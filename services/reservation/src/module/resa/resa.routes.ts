import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as resaControllers from './resa.controllers'
import { CheckSlotInterface, FilterReservationsInterface, ReservationIdInterface, ReservationInterface, StatusInterface } from "./resa.interface";
import { CheckSlotSchema, FilterReservationsSchema, GetReservationSchema, ReservationIdSchema, ReservationSchema, StatusListingSchema } from "./resa.schema";

export async function reservationRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get<{ Querystring: FilterReservationsInterface }>("/reservations/mine",
		{
			schema: FilterReservationsSchema,
			preHandler: app.authentication
		}, resaControllers.listReservation);

	app.post<{ Body: ReservationInterface }>("/reservations",
		{
			schema: ReservationSchema,
			preHandler: app.authentication
		}, resaControllers.createSlot);

	app.get<{ Querystring: { id: string } }>("/reservations/get-slot",
		{
			schema: GetReservationSchema,
			preHandler: app.authentication
		}, resaControllers.getSlots
	)

	app.delete<{ Params: ReservationIdInterface }>("/reservations/:id",
		{
			schema: ReservationIdSchema,
			preHandler: app.authentication
		}, resaControllers.deleteReservation);

	app.patch<{ Params: ReservationIdInterface }>("/reservations/:id/cancel",
		{
			schema: ReservationIdSchema,
			preHandler: app.authentication
		}, resaControllers.cancelReservation);

	app.patch<{ Params: ReservationIdInterface }>("/reservations/:id/confirm",
		{
			schema: ReservationIdSchema,
			preHandler: app.authentication
		}, resaControllers.confirmReservation);

	app.patch<{ Params: ReservationIdInterface }>("/reservations/:id/reject",
		{
			schema: ReservationIdSchema,
			preHandler: app.authentication
		}, resaControllers.rejectReservation);
	app.patch<{ Params: ReservationIdInterface }>("/reservations/:id/done",
		{
			schema: ReservationIdSchema,
			preHandler: app.authentication
		}, resaControllers.doneReservation);
	app.get<{ Querystring: StatusInterface }>("/reservations/internal/status",
		{
			schema: StatusListingSchema,
			preHandler: app.internalAuthentication
		}, resaControllers.statusListing);

	app.get<{ Querystring: CheckSlotInterface }>("/reservations/check-slot",
		{
			schema: CheckSlotSchema,
			preHandler: app.authentication
		}, resaControllers.checkSlot);
	app.get<{ Querystring: FilterReservationsInterface }>("/reservations/seller/me", {
		schema: FilterReservationsSchema,
		preHandler: app.authentication
	}, resaControllers.getSellerReservations);
}

export async function deleteData(app: FastifyInstance, options: FastifyPluginOptions) {
	app.delete("/internal/delete/data",
		{ preHandler: app.internalAuthentication }, resaControllers.requestDeleteData);
}
