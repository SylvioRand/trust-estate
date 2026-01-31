import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserInterface } from "../../interfaces/config.interface";
import * as resaServices from "./resa.services"
import type { CheckSlotInterface, ListingInterface, ReservationIdInterface, ReservationInterface, StatusInterface } from "./resa.interface";

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
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
}

export async function requestDeleteData(request: FastifyRequest, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		await resaServices.deleteUserData(request.server, user.id);
		return reply.status(200).send({
			"deleted": true,
			"message": "User data deleted successfully"
		});
	} catch (error: any) {
		return reply.status(500).send({
			"error": "internal_server_error",
			"message": "common.internal_server_error"
		});
	}
}

export async function createSlot(request: FastifyRequest<{ Body: ReservationInterface }>, reply: FastifyReply) {
	const { slot, sellerId, listingId } = request.body;
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const slotDate = new Date(slot);

		const reservation = await resaServices.addSlot(request.server, user.id, slot, sellerId, listingId);
		return reply.status(201).send(reservation);
	} catch (error: any) {
		if (error.message.includes("cannot_reserve_own_listing"))
			return reply.status(403).send({
				"error": "cannot_reserve_own_listing",
				"message": "reservation.cannot_reserve_own"
			});
		else if (error.message.includes("slot_unavailable"))
			return reply.status(409).send({
				"error": "slot_unavailable",
				"message": "reservation.slot_unavailable",
				"availableSlots": []
			});
		else if (error.message.includes("insufficient_credits"))
			return reply.status(402).send({
				"error": "insufficient_credits",
				"message": "payment.insufficient_credits"
			});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function deleteReservation(request: FastifyRequest<
	{ Params: ReservationIdInterface }>, reply: FastifyReply) {
	const reservationId = request.params.id;
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		await resaServices.deleteReservation(request.server, user.id, reservationId);
		return reply.status(200).send({
			"cancelled": true,
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
		else {
			request.server.log.error({ error, userId: user?.id, reservationId }, 'DeleteReservation error');
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
		}
	}
};

export async function cancelReservation(request: FastifyRequest<
	{ Params: ReservationIdInterface }>, reply: FastifyReply) {
	const reservationId = request.params.id;
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		await resaServices.cancelReservation(request.server, user.id, reservationId);
		return reply.status(200).send({
			"cancelled": true,
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
		else {
			request.server.log.error({ error, userId: user?.id, reservationId }, 'CancelReservation error');
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
		}
	}
}

export async function confirmReservation(request: FastifyRequest<
	{ Params: ReservationIdInterface }>, reply: FastifyReply) {
	const reservationId = request.params.id;
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const confirmedAt = await resaServices.confirmStatusReservation(request.server, user.id, reservationId);
		return reply.status(200).send({
			"status": "confirmed",
			"confirmedAt": confirmedAt
		})
	} catch (error: any) {
		if (error.message === "reservation_already_processed")
			return reply.status(400).send({
				"error": "reservation_already_processed",
				"message": "reservation.already_processed"
			});
		else if (error.message === "reservation_not_found")
			return reply.status(404).send({
				"error": "reservation_not_found",
				"message": "reservation.not_found"
			});
		else if (error.message === "slot_unavailable")
			return reply.status(409).send({
				"error": "slot_unavailable",
				"message": "reservation.slot_unavailable",
				"availableSlots": []
			});
		else if (error.message === "insufficient_credits")
			return reply.status(402).send({
				"error": "insufficient_credits",
				"message": "payment.insufficient_credits"
			});
		else if (error.message === "credit_service_error")
			return reply.status(503).send({
				"error": "service_unavailable",
				"message": "common.service_unavailable"
			});
		else {
			request.server.log.error({ error, userId: user?.id, reservationId }, 'ConfirmReservation error');
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
		}
	}
}

export async function rejectReservation(request: FastifyRequest<
	{ Params: ReservationIdInterface }>, reply: FastifyReply) {
	const reservationId = request.params.id;
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const rejectedAt = await resaServices.rejectStatusReservation(request.server, user.id, reservationId);
		return reply.status(200).send({
			"status": "confirmed",
			"rejectedAt": rejectedAt
		})
	} catch (error: any) {
		if (error.message === "reservation_already_processed")
			return reply.status(400).send({
				"error": "reservation_already_processed",
				"message": "reservation.already_processed"
			});
		else if (error.message === "reservation_not_found")
			return reply.status(404).send({
				"error": "reservation_not_found",
				"message": "reservation.not_found"
			})
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function doneReservation(request: FastifyRequest<
	{ Params: ReservationIdInterface }>, reply: FastifyReply) {
	const reservationId = request.params.id;
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const doneAt = await resaServices.doneStatusReservation(request.server, user.id, reservationId);
		return reply.status(200).send({
			"status": "done",
			"doneAt": doneAt
		})
	} catch (error: any) {
		if (error.message === "reservation_not_found")
			return reply.status(404).send({
				"error": "reservation_not_found",
				"message": "reservation.not_found"
			})
		else if (error.message === "reservation_not_completed")
			return reply.status(400).send({
				"error": "reservation_not_completed",
				"message": "reservation.not_completed"
			});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function statusListing(request: FastifyRequest<{ Querystring: StatusInterface }>, reply: FastifyReply) {
	const listingId = request.query.listingId;
	const userId = request.query.userId;

	try {
		await resaServices.getStatusUserListing(request.server, listingId, userId);
		return reply.status(200).send({
			"confirmed": true
		})
	} catch (error: any) {
		if (error.message === "reservation_not_found")
			return reply.status(404).send({
				"error": "reservation_not_found",
				"message": "reservation.not_found"
			})
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function checkSlot(request: FastifyRequest<{ Querystring: CheckSlotInterface }>, reply: FastifyReply) {
	const listingId = request.query.listingId;
	const slot = request.query.slot;
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});
	try {
		await resaServices.getSlot(request.server, listingId, slot, user.id);
		return reply.status(200).send({
			"available": true,
			"expiresIn": 300
		})
	} catch (error: any) {
		if (error.message === "reservation.slot_already_reserved")
			return reply.status(409).send({
				"available": false,
				"message": "reservation.slot_already_reserved",
			})
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
}

export async function getSlots(request: FastifyRequest<{ Querystring: { id: string } }>, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;
	const userId = request.query.id;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const data = await resaServices.getAvailability(request.server, userId) as ListingInterface;
		const availability = await resaServices.getAvailableSlotsByUserId(request.server, userId, data.weeklySchedule);
		return reply.status(200).send({ availability, sellerId: data.sellerId });
	} catch (error: any) {
		if (error.message === "listing_server_error")
			return reply.status(503).send({
				"error": "internal_server_error",
				"message": "common.listing_server_error"
			})
		return reply.status(500).send({
			"error": "internal_server_error",
			"message": "common.internal_server_error"
		});
	}
};

export async function getSellerReservations(request: FastifyRequest, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;
	const status = (request.query as any).status as string[] | undefined;

	console.log("Status query:", status);
	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const reservations = await resaServices.getReservationsBySellerId(request.server, user.id, status);
		return reply.status(200).send(reservations);
	} catch (error: any) {
		if (error.message === "reservations_not_found")
			return reply.status(404).send({
				"error": "reservations_not_found",
				"message": "reservations.not_found"
			});
		return reply.status(500).send({
			"error": "internal_server_error",
			"message": "common.internal_server_error"
		});
	}
}