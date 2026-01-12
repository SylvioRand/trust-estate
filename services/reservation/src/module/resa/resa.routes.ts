import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as resaControllers from './resa.controllers'
import { DeleteReservationInterface, ReservationInterface } from "./resa.interface";
import { DeleteReservationSchema, ReservationSchema } from "./resa.schema";

export async function reservationRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get("/reservations/mine",
		{preHandler: app.authentication}, resaControllers.listReservation);

	app.post<{ Body: ReservationInterface }>("/reservations",
		{
			schema: ReservationSchema,
			preHandler: app.authentication
		}, resaControllers.createSlot);

	app.delete<{ Params: DeleteReservationInterface }>("/reservations/:id",
		{
			schema: DeleteReservationSchema,
			preHandler: app.authentication
		}, resaControllers.deleteReservation);
	
	app.put<{ Params: DeleteReservationInterface }>("/reservations/:id/cancel",
		{
			schema: DeleteReservationSchema,
			preHandler: app.authentication
		}, resaControllers.cancelReservation);
	// app.post("/reservations/mine", {preHandler: app.authentication}, resaControllers.get)
}