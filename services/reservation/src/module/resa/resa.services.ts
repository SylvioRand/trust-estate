import type { FastifyInstance } from "fastify";
import { responseReservation } from "../../utils/utils";
import { Prisma, PrismaClient, $Enums } from "@prisma/client";
import { error } from "console";

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
		const minAdvanceTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

		if (slotDate < minAdvanceTime) {
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
					in: ['confirmed']
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

export async function changeStatusReservation(app: FastifyInstance, userId: string, reservationId: string) {
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

		if (reservation.status === "confirmed" && cancel === $Enums.CancelledBy.seller) {
			await crediter(app, reservation.buyerId);
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

		await debiter(app, reservation.buyerId);

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

        return (data.confirmedAt);
    });
};

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
                    }
                ]
            }
        });

        if (reservation)
            throw new Error("reservation.slot_already_reserved");
    })
};

async function debiter(app: FastifyInstance, buyerId: string) {
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
		console.log("DELETE RESERVATION")
    });
}

async function crediter(app: FastifyInstance, userId: string) {
	const jwt = await import('jsonwebtoken');
	const internalToken = jwt.default.sign(
		{ service: 'reservation-service', userId },
		app.config.INTERNAL_KEY_SECRET,
		{ algorithm: 'HS256', expiresIn: '30s' }
	);

	try {
		const response = await fetch(`${app.config.CREDITS_SERVICE_URL}/internal/credits/credit`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-internal-key': internalToken,
				'x-user-id': userId
			},
			body: JSON.stringify({
				reason: "refund_cancelled",
				type: 'refund'
			})
		});

		if (!response.ok) {
			const error = await response.json() as any;
			throw new Error('credit_service_error');
		}
	} catch (error: any) {
		app.log.error({ error }, 'Failed to credit user');
	}
};

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
		console.log(error);
		app.log.error({ error }, 'listing_server_error');
		throw new Error("listing_server_error");
	}
}

export async function getAvailableSlotsByUserId(app: FastifyInstance, userId: string, days: { dayOfWeek: number, startTime: number|string, endTime: number|string }[]) {
		let allAvailableSlots: { day: Date, slots: Date[] }[] = [];
		const now = new Date();
		const GMT_OFFSET = 3; // heures
		// today = date du jour à minuit GMT+3 (en UTC)
		const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

		function parseHourMinute(val: number|string): { hour: number, minute: number } {
			if (typeof val === 'number') return { hour: val, minute: 0 };
			if (typeof val === 'string') {
				const [h, m] = val.split(':').map(Number);
				return { hour: h, minute: m || 0 };
			}
			return { hour: 0, minute: 0 };
		}

		for (const dayObj of days) {
			// 1=lundi -> 1, 7=dimanche -> 0 (JS Sunday=0)
			const jsDay = (dayObj.dayOfWeek % 7);
			const todayJsDay = todayUtc.getUTCDay();
			let daysToAdd = jsDay - todayJsDay;
			if (daysToAdd < 0) daysToAdd += 7;
			// Date du jour cible à minuit GMT+3 (en UTC)
			const dayDateUtc = new Date(todayUtc);
			dayDateUtc.setUTCDate(todayUtc.getUTCDate() + daysToAdd);

			const { hour: startTime, minute: startMinute } = parseHourMinute(dayObj.startTime);
			const { hour: endTime, minute: endMinute } = parseHourMinute(dayObj.endTime);

			const slots: Date[] = [];
			for (let hour = startTime; hour <= endTime; hour++) {
				for (let minute = (hour === startTime ? startMinute : 0); minute < 60; minute += 30) {
					if (hour === endTime && minute > endMinute) break;
					// Crée le slot en UTC correspondant à l'heure GMT+3 demandée
					const slotUtc = new Date(Date.UTC(
						dayDateUtc.getUTCFullYear(),
						dayDateUtc.getUTCMonth(),
						dayDateUtc.getUTCDate(),
						hour - GMT_OFFSET,
						minute,
						0,
						0
					));
					slots.push(slotUtc);
				}
			}

			// début et fin de la journée en GMT+3 (en UTC)
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

			const reservedSlots = await app.prisma.reservation.findMany({
				where: {
					listingId: userId,
					status: { in: ['confirmed'] },
					slot: {
						gte: startOfDayUtc,
						lt: endOfDayUtc
					}
				},
				select: { slot: true }
			});
			console.log(reservedSlots);
			const reservedDates = reservedSlots.map(r => r.slot.getTime());
			const availableSlots = slots.filter(slot => !reservedDates.includes(slot.getTime()));

			// Formatage explicite en GMT+3 pour l'affichage
			function toGmt3String(date: Date) {
				// Décale la date de +3h et retourne sous forme YYYY-MM-DDTHH:mm:ss+03:00
				const gmt3 = new Date(date.getTime() + 3 * 60 * 60 * 1000);
				const pad = (n: number) => n.toString().padStart(2, '0');
				const year = gmt3.getUTCFullYear();
				const month = pad(gmt3.getUTCMonth() + 1);
				const day = pad(gmt3.getUTCDate());
				const hour = pad(gmt3.getUTCHours());
				const min = pad(gmt3.getUTCMinutes());
				const sec = pad(gmt3.getUTCSeconds());
				return `${year}-${month}-${day}T${hour}:${min}:${sec}+03:00`;
			}

			allAvailableSlots.push({
				day: toGmt3String(new Date(dayDateUtc)),
				slots: availableSlots.map(toGmt3String)
			});
		}

		return allAvailableSlots;
}