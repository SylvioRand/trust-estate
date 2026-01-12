import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as resaControllers from './resa.controllers'
import { ReservationIdInterface, ReservationInterface } from "./resa.interface";
import { ReservationIdSchema, ReservationSchema } from "./resa.schema";

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
	// app.post("/reservations/mine", {preHandler: app.authentication}, resaControllers.get)
}