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
                slot: slot
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

export async function getAvailableSlotsByUserId(app: FastifyInstance, userId: string, day: Date) {
	const dayDate = new Date(day);
	const slots: Date[] = [];
	const startHour = 8;
	const endHour = 17;
	for (let hour = startHour; hour <= endHour; hour++) {
		for (let minute = 0; minute < 60; minute += 30) {
			const slot = new Date(dayDate);
			slot.setHours(hour, minute, 0, 0);
			slots.push(new Date(slot));
		}
	}

	const startOfDay = new Date(dayDate);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(dayDate);
	endOfDay.setHours(23, 59, 59, 999);

	const reservedSlots = await app.prisma.reservation.findMany({
		where: {
			sellerId: userId,
			status: { in: ['pending', 'confirmed'] },
			slot: {
				gte: startOfDay,
				lt: endOfDay
			}
		},
		select: { slot: true }
	});

	const reservedDates = reservedSlots.map(r => r.slot.getTime());
	const availableSlots = slots.filter(slot => !reservedDates.includes(slot.getTime()));

	return availableSlots;
}