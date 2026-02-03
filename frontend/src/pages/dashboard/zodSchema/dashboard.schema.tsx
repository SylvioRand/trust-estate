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
    status: z.enum(["pending", "confirmed", "cancelled"]),
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