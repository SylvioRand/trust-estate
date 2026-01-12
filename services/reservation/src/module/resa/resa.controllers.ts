import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserInterface } from "../../interfaces/config.interface";
import * as resaServices from "./resa.services"
import type { DeleteReservationInterface, ReservationInterface } from "./resa.interface";

export async function listReservation(request: FastifyRequest, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const reservation = await resaServices.getAllUserReservation(request.server, user.id);
		return reply.status(200).send(reservation);
	} catch (error: any) {
		if (error.message === "slot_unavailable")
			return reply.status(409).send({
				"error": "slot_unavailable",
				"message": "reservation.slot_unavailable",
				"availableSlots": []
		});
		else
			console.log(error)
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
}

export async function createSlot(request: FastifyRequest<{Body: ReservationInterface}>, reply: FastifyReply) {
	const {slot, sellerId, listingId} = request.body;
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const reservation = await resaServices.addSlot(request.server, user.id, slot, sellerId, listingId);
		return reply.status(201).send(reservation);
	} catch (error: any) {
		if (error.message === "cannot_reserve_own_listing")
			return reply.status(403).send({
				"error": "cannot_reserve_own_listing",
				"message": "reservation.cannot_reserve_own"
			});
		else if (error.message === "slot_unavailable")
			return reply.status(409).send({
				"error": "slot_unavailable",
				"message": "reservation.slot_unavailable",
				"availableSlots": []
		});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function deleteReservation(request: FastifyRequest<
	{Params: DeleteReservationInterface}>, reply: FastifyReply) {
	const	reservationId = request.params.id;
	const	user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		await resaServices.deleteReservation(request.server, user.id, reservationId);
		return reply.status(200).send({
			"cancelled":true,
			"refund": 0
		})
	} catch (error: any) {
		if (error.message === "cancellation_too_late")
			return reply.status(400).send({
				"error": "cancellation_too_late",
				"message": "reservation.cancellation_too_late"
			});
		else if (error.message === "reservation_not_found")
			return reply.status(404).send({
				"error": "reservation_not_found",
				"message": "reservation.not_found"
			})
		else
			console.log(error)
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function cancelReservation(request: FastifyRequest<
	{Params: DeleteReservationInterface}>, reply: FastifyReply) {
	const	reservationId = request.params.id;
	const	user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		await resaServices.changeStatusReservation(request.server, user.id, reservationId);
		return reply.status(200).send({
			"cancelled":true,
			"refund": 0
		})
	} catch (error: any) {
		if (error.message === "cancellation_too_late")
			return reply.status(400).send({
				"error": "cancellation_too_late",
				"message": "reservation.cancellation_too_late"
			});
		else if (error.message === "reservation_not_found")
			return reply.status(404).send({
				"error": "reservation_not_found",
				"message": "reservation.not_found"
			})
		else
			console.log(error)
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
}