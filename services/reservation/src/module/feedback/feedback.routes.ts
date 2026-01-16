import type { FastifyInstance } from "fastify";
import * as feedbackController from "./feedback.controllers"
import { FeedbackSchema } from "./feedback.schema";
import { FeedbackInterface } from "./feedback.interface";

export async function feedbackRoutes(app: FastifyInstance) {
	app.post<{Body: FeedbackInterface}>("/feedback",
		{
			schema: FeedbackSchema,
			preHandler: app.authentication
		}, feedbackController.postFeedback);
	// app.get("/feedback/mine", )
}