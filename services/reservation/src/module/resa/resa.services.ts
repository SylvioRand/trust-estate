import type { FastifyInstance } from "fastify";
import { generateSlotsForDay, parseHourMinute, responseReservation, toGmt3String } from "../../utils/utils";
import { Prisma, PrismaClient, $Enums } from "@prisma/client";
import { error } from "console";
import { ListingDataInterface, ListingInterface, ReservationDetailsInterface, UserDetailsInterface } from "./resa.interface";

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export async function getAllUserReservation(app: FastifyInstance, userId: string) {
	const reservation = await app.prisma.reservation.findMany({
		where: {
			OR: [
				{ buyerId: userId },
				{ sellerId: userId }
			]
		},
		include: {
			feedbacks: true
		}
	});
	if (!reservation)
		throw new Error("slot_unavailable");
	return (reservation);
}

export async function addSlot(app: FastifyInstance, userId: string, slot: Date, sellerId: string, listingId: string) {

	return await app.prisma.$transaction(async (tx: TransactionClient) => {
		const slotDate = slot instanceof Date ? slot : new Date(slot);

		const now = new Date();
		const minDate = new Date(now);
		minDate.setDate(now.getDate() + 2);
		minDate.setHours(0, 0, 0, 0);

		if (slotDate < minDate) {
			throw new Error("slot_unavailable");
		}

		const slotStart = new Date(slotDate.getTime() - 30 * 60 * 1000); // 30 minutes avant
		const slotEnd = new Date(slotDate.getTime() + 30 * 60 * 1000); // 30 minutes après

		const sellerSlotTaken = await tx.reservation.findFirst({
			where: {
				sellerId,
				slot: {
					gte: slotStart,
					lte: slotEnd
				},
				status: {
					in: ['confirmed', 'pending']
				}
			}
		});

		if (sellerSlotTaken) {
			throw new Error("slot_unavailable");
		}

		const buyerSlotTaken = await tx.reservation.findFirst({
			where: {
				buyerId: userId,
				slot: {
					gte: slotStart,
					lte: slotEnd
				},
				status: {
					in: ['pending', 'confirmed']
				}
			}
		});

		if (buyerSlotTaken) {
			throw new Error("cannot_reserve_own_listing");
		}

		await debitCredits(app, userId);

		const reservation = await tx.reservation.create({
			data: {
				listingId,
				buyerId: userId,
				sellerId,
				slot: slotDate
			}
		});

		return (responseReservation(reservation));
	});
};

export async function deleteReservation(app: FastifyInstance, userId: string, reservationId: string) {
	await app.prisma.$transaction(async (tx: TransactionClient) => {
		const reservation = await tx.reservation.findFirst({
			where: {
				AND: [
					{ reservationId },
					{
						OR: [
							{ buyerId: userId },
							{ sellerId: userId }
						]
					}
				]
			}
		});

		if (!reservation)
			throw new Error("reservation_not_found");


		const time = new Date();
		const total = reservation.slot.getTime() - time.getTime();

		const minCancelTime = 30 * 60 * 1000; // 30 minutes
		if (total > 0) {
			if (total <= minCancelTime)
				throw new Error("cancellation_too_late");
		}

		await tx.reservation.delete({
			where: { reservationId }
		});
	})
};

export async function cancelReservation(app: FastifyInstance, userId: string, reservationId: string) {
	await app.prisma.$transaction(async (tx: TransactionClient) => {
		const reservation = await tx.reservation.findFirst({
			where: {
				AND: [
					{ reservationId },
					{
						OR: [
							{ buyerId: userId },
							{ sellerId: userId }
						]
					}
				]
			}
		});
		if (!reservation)
			throw new Error("reservation_not_found");

		const time = new Date();
		const total = reservation.slot.getTime() - time.getTime();

		const minCancelTime = 30 * 60 * 1000; // 30 minutes
		if (total < minCancelTime)
			throw new Error("cancellation_too_late");

		let cancel: $Enums.CancelledBy;
		if (reservation.buyerId === userId)
			cancel = $Enums.CancelledBy.buyer;
		else if (reservation.sellerId === userId)
			cancel = $Enums.CancelledBy.seller;
		else
			cancel = $Enums.CancelledBy.system;


		// NEW RULE: Only refund if the SELLER or SYSTEM cancels.
		// If the BUYER cancels their own reservation, they lose their credits.
		if ((reservation.status === 'confirmed' || reservation.status === 'pending') && (cancel === $Enums.CancelledBy.seller || cancel === $Enums.CancelledBy.system)) {
			await refundCredits(app, reservation.buyerId);
		}

		await tx.reservation.update({
			where: { reservationId },
			data: {
				status: "cancelled",
				cancelledAt: new Date(),
				cancelledBy: cancel
			}
		});
	})
};

export async function confirmStatusReservation(app: FastifyInstance, userId: string, reservationId: string) {
	return await app.prisma.$transaction(async (tx: TransactionClient) => {
		const reservation = await tx.reservation.findFirst({
			where: {
				AND: [
					{ reservationId },
					{ sellerId: userId }
				]
			}
		});

		if (!reservation)
			throw new Error("reservation_not_found");

		if (reservation.status !== "pending")
			throw new Error("reservation_already_processed");

		const slotStart = new Date(reservation.slot.getTime() - 60 * 60 * 1000);
		const slotEnd = new Date(reservation.slot.getTime() + 60 * 60 * 1000);

		const conflictingReservation = await tx.reservation.findFirst({
			where: {
				OR: [
					{ sellerId: userId },
					{ buyerId: userId }
				],
				reservationId: { not: reservationId },
				slot: {
					gte: slotStart,
					lte: slotEnd
				},
				status: 'confirmed'
			}
		});

		if (conflictingReservation) {
			throw new Error("seller_slot_unavailable");
		}

		await tx.reservation.updateMany({
			where: {
				sellerId: userId,
				reservationId: { not: reservationId },
				slot: {
					gte: slotStart,
					lte: slotEnd
				},
				status: 'pending'
			},
			data: {
				status: 'rejected',
				rejectedAt: new Date()
			}
		});

		const data = await tx.reservation.update({
			where: { reservationId },
			data: {
				status: "confirmed",
				confirmedAt: new Date(),
				sellerContactVisible: true
			}
		});

		try {
			const internalToken = await import('jsonwebtoken');
			const token = internalToken.default.sign(
				{ service: 'reservation-service', userId },
				app.config.INTERNAL_KEY_SECRET,
				{ algorithm: 'HS256', expiresIn: '30s' }
			);

			await fetch(`${app.config.LISTINGS_SERVICE_URL}/listings/${data.listingId}/events/reservation-confirmed`, {
				method: 'POST',
				headers: {
					'x-internal-key': token,
					'x-user-id': userId
				}
			});
		} catch (error) {
			app.log.error({ error }, 'Failed to notify listing service of reservation confirmation');
		}
		return (data.confirmedAt);
	});
};

export async function doneStatusReservation(app: FastifyInstance, userId: string, reservationId: string) {
	await app.prisma.$transaction(async (tx: TransactionClient) => {
		const reservation = await tx.reservation.findFirst({
			where: {
				AND: [
					{ reservationId },
					{ sellerId: userId }
				]
			}
		});

		if (!reservation)
			throw new Error("reservation_not_found");

		if (reservation.status !== "confirmed")
			throw new Error("reservation_not_confirmed");

		const data = await tx.reservation.update({
			where: { reservationId },
			data: {
				status: "done",
				feedbackEligible: true,
				feedbackGiven: false,
				doneAt: new Date()
			}
		});

		return (data.doneAt);
	});
}

export async function rejectStatusReservation(app: FastifyInstance, userId: string, reservationId: string) {
	await app.prisma.$transaction(async (tx: TransactionClient) => {
		const reservation = await tx.reservation.findFirst({
			where: {
				AND: [
					{ reservationId },
					{ sellerId: userId }
				]
			}
		});

		if (!reservation)
			throw new Error("reservation_not_found");

		if (reservation.status !== "pending")
			throw new Error("reservation_already_processed");

		await refundCredits(app, reservation.buyerId);

		const data = await tx.reservation.update({
			where: { reservationId },
			data: {
				status: "rejected",
				rejectedAt: new Date()
			}
		});

		return (data.rejectedAt);
	});
}

export async function getStatusUserListing(app: FastifyInstance, listingId: string, userId: string) {
	const reservation = await app.prisma.reservation.findFirst({
		where: {
			AND: [
				{ listingId },
				{ buyerId: userId }
			]
		}
	});

	if (!reservation)
		throw new Error("reservation_not_found");

};

export async function getSlot(app: FastifyInstance, listingId: string, slot: Date, userId: string) {
	return await app.prisma.$transaction(async (tx: TransactionClient) => {
		const slotDate = new Date(slot);

		const slotStart = new Date(slotDate.getTime() - 60 * 60 * 1000);
		const slotEnd = new Date(slotDate.getTime() + 60 * 60 * 1000);

		const reservation = await tx.reservation.findFirst({
			where: {
				AND: [
					{ listingId },
					{
						OR: [
							{ sellerId: userId },
							{ buyerId: userId }
						]
					},
					{
						slot: {
							gte: slotStart,
							lte: slotEnd
						}
					},
					{
						status: { in: ['confirmed'] }
					}
				]
			}
		});

		if (reservation)
			throw new Error("reservation.slot_already_reserved");
	})
};

async function debitCredits(app: FastifyInstance, buyerId: string) {
	const jwt = await import('jsonwebtoken');
	const internalToken = jwt.default.sign(
		{ service: 'reservation-service', userId: buyerId },
		app.config.INTERNAL_KEY_SECRET,
		{ algorithm: 'HS256', expiresIn: '30s' }
	);

	try {
		const response = await fetch(`${app.config.CREDITS_SERVICE_URL}/internal/credits/debit`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-internal-key': internalToken,
				'x-user-id': buyerId
			},
			body: JSON.stringify({
				reason: 'reserve_visit'
			})
		});

		if (!response.ok) {
			const error = await response.json() as any;

			if (error.error === 'insufficient_credits') {
				throw new Error('insufficient_credits');
			}
			throw new Error('credit_service_error');
		}
	} catch (error: any) {
		app.log.error({ error }, 'Failed to debit credits');
		throw error;
	}
}

async function refundCredits(app: FastifyInstance, buyerId: string) {
	const jwt = await import('jsonwebtoken');
	const internalToken = jwt.default.sign(
		{ service: 'reservation-service', userId: buyerId },
		app.config.INTERNAL_KEY_SECRET,
		{ algorithm: 'HS256', expiresIn: '30s' }
	);

	try {
		const response = await fetch(`${app.config.CREDITS_SERVICE_URL}/internal/credits/refund`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-internal-key': internalToken,
				'x-user-id': buyerId
			},
			body: JSON.stringify({
				reason: 'refund_visit'
			})
		});

		if (!response.ok) {
			throw new Error('credit_service_error');
		}
	} catch (error: any) {
		app.log.error({ error }, 'Failed to refund credits');
		// We don't necessarily want to crash the whole process if refund fails, but log it
	}
}
export async function deleteUserData(app: FastifyInstance, userId: string) {
	return await app.prisma.$transaction(async (tx: TransactionClient) => {
		await tx.reservation.deleteMany({
			where: {
				OR: [
					{ buyerId: userId },
					{ sellerId: userId }
				]
			}
		});
	});
}


export async function getAvailability(app: FastifyInstance, userId: string) {
	const jwt = await import('jsonwebtoken');
	const internalToken = jwt.default.sign(
		{ service: 'reservation-service', userId },
		app.config.INTERNAL_KEY_SECRET,
		{ algorithm: 'HS256', expiresIn: '30s' }
	);

	try {
		const response = await fetch(`${app.config.LISTINGS_SERVICE_URL}/listings/${userId}/availability`, {
			method: 'GET',
			headers: {
				'x-internal-key': internalToken,
				'x-user-id': userId
			}
		});

		if (!response.ok) {
			const error = await response.json() as any;
			throw new Error('listing_server_error');
		}
		const data = await response.json();
		return (data);
	} catch (error: any) {
		app.log.error({ error }, 'listing_server_error');
		throw new Error("listing_server_error");
	}
}


async function getReservedSlots(app: FastifyInstance, userId: string, startOfDayUtc: Date, endOfDayUtc: Date): Promise<number[]> {
	const reservedSlots = await app.prisma.reservation.findMany({
		where: {
			listingId: userId,
			status: { in: ['confirmed', 'pending'] },
			slot: {
				gte: startOfDayUtc,
				lt: endOfDayUtc
			}
		},
		select: { slot: true }
	});
	return reservedSlots.map(r => r.slot.getTime());
}

async function getAvailableSlotsForDay(app: FastifyInstance, userId: string, dayDateUtc: Date, startTime: number, startMinute: number, endTime: number, endMinute: number, GMT_OFFSET: number) {
	const slots = generateSlotsForDay(dayDateUtc, startTime, startMinute, endTime, endMinute, GMT_OFFSET);
	const startOfDayUtc = new Date(Date.UTC(
		dayDateUtc.getUTCFullYear(),
		dayDateUtc.getUTCMonth(),
		dayDateUtc.getUTCDate(),
		0 - GMT_OFFSET, 0, 0, 0
	));
	const endOfDayUtc = new Date(Date.UTC(
		dayDateUtc.getUTCFullYear(),
		dayDateUtc.getUTCMonth(),
		dayDateUtc.getUTCDate(),
		23 - GMT_OFFSET, 59, 59, 999
	));
	const reservedDates = await getReservedSlots(app, userId, startOfDayUtc, endOfDayUtc);
	return slots.filter(slot => !reservedDates.includes(slot.getTime()));
}

export async function getAvailableSlotsByUserId(
	app: FastifyInstance,
	userId: string,
	days: { dayOfWeek: number, startTime: number | string, endTime: number | string }[]
): Promise<{ day: string, slots: string[], Taken: string[] }[]> {
	const allAvailableSlots: { day: string, slots: string[], Taken: string[] }[] = [];
	const now = new Date();
	const GMT_OFFSET = 3;
	const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

	for (let i = 2; i < 16; i++) {
		const dayDateUtc = new Date(todayUtc);
		dayDateUtc.setUTCDate(todayUtc.getUTCDate() + i);

		const jsDay = dayDateUtc.getUTCDay();
		const dayRanges = days.filter(d => (d.dayOfWeek % 7) === jsDay);

		if (dayRanges.length > 0) {
			let allSlotsForDay: Date[] = [];

			for (const range of dayRanges) {
				const { hour: startTime, minute: startMinute } = parseHourMinute(range.startTime);
				const { hour: endTime, minute: endMinute } = parseHourMinute(range.endTime);
				const rangeSlots = generateSlotsForDay(dayDateUtc, startTime, startMinute, endTime, endMinute, GMT_OFFSET);
				allSlotsForDay.push(...rangeSlots);
			}

			// Remove duplicate timestamps if ranges overlap
			const uniqueSlots = Array.from(new Set(allSlotsForDay.map(s => s.getTime())))
				.map(t => new Date(t))
				.sort((a, b) => a.getTime() - b.getTime());

			const startOfDayUtc = new Date(Date.UTC(
				dayDateUtc.getUTCFullYear(),
				dayDateUtc.getUTCMonth(),
				dayDateUtc.getUTCDate(),
				0 - GMT_OFFSET, 0, 0, 0
			));
			const endOfDayUtc = new Date(Date.UTC(
				dayDateUtc.getUTCFullYear(),
				dayDateUtc.getUTCMonth(),
				dayDateUtc.getUTCDate(),
				23 - GMT_OFFSET, 59, 59, 999
			));

			const reservedDates = await getReservedSlots(app, userId, startOfDayUtc, endOfDayUtc);

			const availableSlots = uniqueSlots.filter(slot => !reservedDates.includes(slot.getTime()));
			const takenSlots = uniqueSlots.filter(slot => reservedDates.includes(slot.getTime()));

			allAvailableSlots.push({
				day: toGmt3String(new Date(dayDateUtc)),
				slots: availableSlots.map(toGmt3String),
				Taken: takenSlots.map(toGmt3String)
			});
		}
	}
	return allAvailableSlots;
};

export async function getListingData(app: FastifyInstance, listingId: string, userId: string, token: string) {
	try {
		const response = await fetch(`${app.config.LISTINGS_SERVICE_URL}/listings/${listingId}`, {
			method: 'GET',
			headers: {
				'x-internal-key': token,
				'x-user-id': userId
			}
		});

		if (!response.ok) {
			const error = await response.json() as any;
			throw new Error('listing_server_error');
		}
		const data = await response.json() as ListingDataInterface;
		return (data);
	} catch (error: any) {
		app.log.error({ error }, 'listing_server_error');
		throw new Error("listing_server_error");
	}
}

export async function getUserData(app: FastifyInstance, userId: string, token: string) {
	try {
		const response = await fetch(`${app.config.AUTH_SERVICE_URL}/users/${userId}/details`, {
			method: 'GET',
			headers: {
				'x-internal-key': token,
				'x-user-id': userId
			}
		});

		if (!response.ok) {
			const error = await response.json() as any;
			throw new Error('auth_server_error');
		}
		const data = await response.json() as UserDetailsInterface;
		return (data);
	} catch (error: any) {
		app.log.error({ error }, 'auth_server_error');
		throw new Error("auth_server_error");
	}
}

export async function getReservationsBySellerId(app: FastifyInstance, sellerId: string, status?: string | string[]): Promise<ReservationDetailsInterface[]> {
	const reservations = await app.prisma.reservation.findMany({
		where: {
			sellerId,
			...(status ? { status: Array.isArray(status) ? { in: status as $Enums.ReservationStatus[] } : status as $Enums.ReservationStatus } : {})
		}
	});

	if (!reservations)
		throw new Error("reservations_not_found");

	const internalToken = await import('jsonwebtoken');
	const token = internalToken.default.sign(
		{ service: 'reservation-service', userId: sellerId },
		app.config.INTERNAL_KEY_SECRET,
		{ algorithm: 'HS256', expiresIn: '30s' }
	);

	let response: ReservationDetailsInterface[] = [];
	try {
		const response = await Promise.all(reservations.map(async (reservation: any) => ({
			reservationId: reservation.reservationId,
			slot: reservation.slot,
			status: reservation.status,
			createdAt: reservation.createdAt,
			listing: await getListingData(app, reservation.listingId, sellerId, token),
			buyer: await getUserData(app, reservation.buyerId, token)
		})));
		return (response);
	} catch (error) {
		app.log.error({ error }, 'Failed to notify listing service of reservations viewed');
	}

	return (response);
}