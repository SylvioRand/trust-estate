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
		}
	});

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
		const reservation = await tx.reservation.findUnique({
			where: {
				reservationId_buyerId: {
					reservationId,
					buyerId: userId
				}
			}
		});

		if (!reservation)
			throw new Error("reservation_not_found");

		if (reservation.status === "confirmed")
			throw new Error("cancellation_too_late");

		const time = new Date();
		const total = reservation.slot.getTime() - time.getTime();

		const twoHours = 2 * 60 * 60 * 1000;
		if (total < twoHours)
			throw new Error("cancellation_too_late");

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
}