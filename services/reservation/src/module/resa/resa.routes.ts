import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as resaControllers from './resa.controllers'
import { ReservationInterface } from "./resa.interface";
import { ReservationSchema } from "./resa.schema";

export async function reservationRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get("/reservations/mine", {preHandler: app.authentication}, resaControllers.listReservation);
	app.post<{ Body: ReservationInterface }>("/reservations",
		 {schema: ReservationSchema, preHandler: app.authentication}, resaControllers.createSlot)
	// app.post("/reservations/mine", {preHandler: app.authentication}, resaControllers.get)
}