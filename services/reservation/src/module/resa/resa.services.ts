import type { FastifyInstance } from "fastify";
import { responseReservation } from "../../utils/utils";
import { CancelledBy } from "@prisma/client";

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
	console.log(reservation);
	if (!reservation)
		throw new Error("slot_unavailable");
	return (reservation);
}

export async function addSlot(app: FastifyInstance, userId: string, slot: Date, sellerId: string, listingId: string) {

	return await app.prisma.$transaction(async (tx: any) => {
		const slotDate = slot instanceof Date ? slot : new Date(slot);
		
		const now = new Date();
		const minAdvanceTime = new Date(now.getTime() + 60 * 60 * 1000);
		
		if (slotDate < minAdvanceTime) {
			throw new Error("slot_unavailable");
		}

		const slotStart = new Date(slotDate.getTime() - 60 * 60 * 1000);
		const slotEnd = new Date(slotDate.getTime() + 60 * 60 * 1000);

		const sellerSlotTaken = await tx.reservation.findFirst({
			where: {
				sellerId,
				slot: {
					gte: slotStart,
					lte: slotEnd
				},
				status: {
					in: ['pending', 'confirmed']
				}
			}
		});
		
		if (sellerSlotTaken) {
			throw new Error("seller_slot_unavailable");
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
				slot: slot
			}
		});

		return (responseReservation(reservation));
	});
};

export async function deleteReservation(app: FastifyInstance, userId: string, reservationId: string) {
	await app.prisma.$transaction(async (tx) => {
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

		const twoHours = 1 * 60 * 60 * 1000;
		if (total > 0)
		{
			console.log(total , "  ", twoHours);
			if (total <= twoHours)
				throw new Error("cancellation_too_late");
		}

		await tx.reservation.delete({
			where: {reservationId}
		});
	})
};

export async function changeStatusReservation(app: FastifyInstance, userId: string, reservationId: string) {
	await app.prisma.$transaction(async (tx) => {
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

		const twoHours = 2 * 60 * 60 * 1000;
		if (total < twoHours)
			throw new Error("cancellation_too_late");

		let cancel: CancelledBy;
		if (reservation.buyerId === userId)
			cancel = CancelledBy.buyer;
		else if (reservation.sellerId === userId)
			cancel = CancelledBy.seller;
		else
			cancel = CancelledBy.system;

		await tx.reservation.update({
			where: {reservationId},
			data: {
				status: "cancelled",
				cancelledAt: new Date(),
				cancelledBy: cancel
			}
		});
	})
};

export async function confirmStatusReservation(app: FastifyInstance, userId: string, reservationId: string) {
	await app.prisma.$transaction(async (tx) => {
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
					{sellerId: userId},
					{buyerId: userId}
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

		const data = await tx.reservation.update({
			where: {reservationId},
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
	await app.prisma.$transaction(async (tx) => {
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
			where: {reservationId},
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
				{listingId},
				{buyerId: userId}
			]
		}
	});

	if (!reservation)
		throw new Error("reservation_not_found");

};

export async function getSlot(app: FastifyInstance, listingId: string, slot: Date, userId: string) {
	return await app.prisma.$transaction(async (tx) => {
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
}