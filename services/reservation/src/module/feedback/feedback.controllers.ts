import type { FastifyReply, FastifyRequest } from "fastify";
import { UserInterface } from "../../interfaces/config.interface";
import { FeedbackInterface } from "./feedback.interface";
import * as feedbackServices from "./feedback.services"

export async function postFeedback(request: FastifyRequest<{Body: FeedbackInterface}>, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;
	const {reservationId, rating, comment, categories} = request.body;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const feedbackId = await feedbackServices.addFeedback(request.server, user.id, {reservationId, rating, comment, categories});
		return reply.status(201).send({
			"feedbackId": feedbackId,
			"saved": true,
			"message": "feedback.created_success"
		});
	} catch (error: any) {
		if (error.message === "feedback_already_exists")
			return reply.status(400).send({
				"error": "feedback_already_exists",
				"message": "feedback.already_exists",
			});
		else if (error.message === "reservation_not_done")
			return reply.status(403).send({
				"error": "reservation_not_done",
				"message": "feedback.reservation_not_done",
			});
		else if (error.message === "feedback_not_eligible")
			return reply.status(403).send({
				"error": "reservation_not_done",
				"message": "feedback.feedback_not_eligible",
			});
		else if (error.message === "invalid_rating") {
			return reply.status(400).send({
				"error": "invalid_rating",
				"message": "feedback.invalid_rating",
			});
		}
		else if (error.message === "invalid_comment_length") {
			return reply.status(400).send({
				"error": "invalid_comment_length",
				"message": "feedback.invalid_comment_length",
			});
		}
		else {
			request.server.log.error({ error, userId: user?.id, reservationId }, 'PostFeedback error');
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
		}
	}
};

export async function getFeedback(request: FastifyRequest, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;

	if (!user)
		return reply.status(401).send({
			"error": "unauthorized",
			"message": "common.unauthorized"
		});

	try {
		const feedback = await feedbackServices.getUserFeedback(request.server, user.id);
		return reply.status(200).send(feedback);
	} catch (error: any) {
		if (error.message === "feedback_not_found")
			return reply.status(400).send({
				"error": "feedback_not_found",
				"message": "feedback.feedback_not_found",
			});
		else {
			request.server.log.error({ error, userId: user?.id }, 'GetFeedback error');
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
		}
	}
}