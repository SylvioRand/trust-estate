import type { FastifyInstance } from "fastify";
import { responseReservation } from "../../utils/utils";

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

	return await app.prisma.$transaction(async (tx) => {
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