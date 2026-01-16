import type { FastifyInstance } from "fastify";
import { FeedbackInterface } from "./feedback.interface";

export async function addFeedback(app: FastifyInstance, userId: string, data: FeedbackInterface) {
	return await app.prisma.$transaction(async (tx) => {
		const exist = await tx.feedback.findFirst({
			where: {
				AND: [
					{reservationId: data.reservationId},
					{authorId: userId}
				]
			}
		})

		if (exist)
			throw new Error("feedback_already_exists");
		const reservationExist = await tx.reservation.findFirst({
			where: {
				AND: [
					{reservationId: data.reservationId},
					{buyerId: userId}
				]
			}
		});

		if (!reservationExist)
			throw new Error("reservation_not_found");

		if (reservationExist.status !== 'done')
			throw new Error("reservation_not_done");

		if (!reservationExist.feedbackEligible)
			throw new Error("feedback_not_eligible");

		if (reservationExist.feedbackGiven)
			throw new Error("feedback_already_exists");

		if (data.rating < 1 || data.rating > 5)
			throw new Error("invalid_rating");

		if (data.comment.length < 10 || data.comment.length > 1000)
			throw new Error("invalid_comment_length");

		const feedback = await tx.feedback.create({
			data: {
				reservationId: data.reservationId,
				listingId: reservationExist.listingId,
				authorId: userId,
				targetId: reservationExist.sellerId,
				rating: data.rating,
				comment: data.comment,
				listingAccurate: data.categories.listingAccurate,
				sellerReactive: data.categories.sellerReactive,
				visitUseful: data.categories.visitUseful
			}
		});

		await tx.reservation.update({
			where: {reservationId: data.reservationId},
			data: {feedbackGiven: true}
		});

		return feedback.id;
	})
};

export async function getUserFeedback(app: FastifyInstance, userId: string) {
	return await app.prisma.feedback.findMany({
		where:{
			OR: [
				{authorId: userId},
				{targetId: userId}
			]
		}
	});
}