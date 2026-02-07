import { z } from "zod";

const BuyerSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string().optional().or(z.literal("")),
    email: z.string().email(),
    phone: z.string()
});

const ListingSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    price: z.number(),
    photos: z.array(z.string()).min(1),
    zone: z.string().optional()
});

const ReservationItemSchema = z.object({
    reservationId: z.string().uuid(),
    slot: z.string().datetime(),
    status: z.enum(["pending", "confirmed", "cancelled", "rejected", "done"]),
    cancelledBy: z.enum(["buyer", "seller", "system"]).optional().nullable(),
    createdAt: z.string(),
    listing: ListingSchema,
    buyer: BuyerSchema
});

export const ReservationsResponseSchema = z.object({
    reservations: z.array(ReservationItemSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        totalMatching: z.number(),
        totalPages: z.number()
    })
});

export type ReservationsResponse = z.infer<typeof ReservationsResponseSchema>;
export type Reservation = z.infer<typeof ReservationItemSchema>;

const VisitItemSchema = z.object({
    reservationId: z.string().uuid(),
    listingId: z.string().uuid(),
    buyerId: z.string().uuid(),
    sellerId: z.string().uuid(),
    status: z.enum(["pending", "confirmed", "cancelled", "rejected", "done"]),
    slot: z.string().datetime(),
    confirmedAt: z.string().datetime().nullable(),
    rejectedAt: z.string().datetime().nullable(),
    cancelledAt: z.string().datetime().nullable(),
    cancelledBy: z.enum(["buyer", "seller", "system"]).nullable(),
    doneAt: z.string().datetime().nullable(),
    sellerContactVisible: z.boolean(),
    feedbackEligible: z.boolean(),
    feedbackGiven: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    feedbacks: z.any().nullable()
});

export const VisitsResponseSchema = z.object({
    reservations: z.array(ReservationItemSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        totalMatching: z.number(),
        totalPages: z.number()
    })
});
export type VisitsResponse = z.infer<typeof VisitsResponseSchema>;
export type Visit = z.infer<typeof VisitItemSchema>;