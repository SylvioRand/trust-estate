import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as resaControllers from './resa.controllers'
import { CheckSlotInterface, ReservationIdInterface, ReservationInterface, StatusInterface } from "./resa.interface";
import { CheckSlotSchema, ReservationIdSchema, ReservationSchema, StatusListingSchema } from "./resa.schema";

export async function reservationRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get("/reservations/mine",
		{preHandler: app.authentication}, resaControllers.listReservation);

	app.post<{ Body: ReservationInterface }>("/reservations",
		{
			schema: ReservationSchema,
			preHandler: app.authentication
		}, resaControllers.createSlot);

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
	
	app.patch< {Params: ReservationIdInterface }>("/reservations/:id/confirm",
		{
			schema: ReservationIdSchema,
			preHandler: app.authentication
		}, resaControllers.confirmReservation);
	
	app.patch< {Params: ReservationIdInterface }>("/reservations/:id/reject",
		{
			schema: ReservationIdSchema,
			preHandler: app.authentication
		}, resaControllers.rejectReservation);
	app.get<{Querystring: StatusInterface}>("/reservations/internal/status", 
		{
			schema: StatusListingSchema,
			preHandler: app.authentication
		}, resaControllers.statusListing);
	app.get<{Querystring: CheckSlotInterface}>("/reservations/check-slot",
		{
			schema: CheckSlotSchema,
			preHandler: app.authentication
		}, resaControllers.checkSlot);
}

export async function deleteData(app: FastifyInstance, options: FastifyPluginOptions) {
	app.delete("/internal/delete/data",
		{preHandler: app.internalAuthentication}, resaControllers.requestDeleteData);
}
