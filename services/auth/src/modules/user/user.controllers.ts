import type { FastifyReply, FastifyRequest } from "fastify";
import * as userServices from './user.service'
import type { UserInterface } from "../../interfaces/auth.interface";
import { generateTokens, responseUser, setAuthCookies } from "../../utils/auth.utils";
import { saveRefreshToken } from "../auth/auth.services";

export async function getUser(request: FastifyRequest, reply: FastifyReply) {
	const user = request.user as UserInterface;

	if (!user)
		return reply.status(401).send({
				"error": "invalid_credentials",
				"message": "auth.invalid_credentials"
			});
	try {
		const result = await userServices.showProfile(request.server, user);
		console.log(responseUser(result));
		return reply.status(200).send(responseUser(result));
	} catch (error: any) {
		return reply.status(500).send({
				"error": "Internal server error",
				"message": "Internal server error"
			});
	}
}

export async function getUserBasic(request: FastifyRequest, reply: FastifyReply) {
	const user = request.user as UserInterface;

	if (!user)
		return reply.status(401).send({
				"error": "invalid_credentials",
				"message": "auth.invalid_credentials"
			});
	try {
		const result = await userServices.showProfile(request.server, user);
		
		return reply.status(200).send({
			id: result.id,
			email: result.email,
			emailVerified: result.emailVerified,
			phoneVerified: result.phoneVerified,
			firstName: result.firstName,
			lastName: result.lastName
		});
	} catch (error: any) {
		return reply.status(500).send({
				"error": "Internal server error",
				"message": "Internal server error"
			});
	}
}

export async function updatePhoneNumber(request: FastifyRequest <{Body: {phoneNumber: string}}>, reply: FastifyReply) {
	const phoneNumber = request.body.phoneNumber;
	const userId = (request.user as UserInterface).id;

	try {
		const updatedUser = await userServices.updatePhoneNumberUser(request.server, userId, phoneNumber);
		
		const { realestate_access_token, realestate_refresh_token } = generateTokens(request.server, {
			id: updatedUser.id,
			role: updatedUser.role,
			phoneVerified: true,
			emailVerified: updatedUser.emailVerified
		});
		setAuthCookies(reply, realestate_access_token, realestate_refresh_token);

		await saveRefreshToken(request.server, userId, realestate_refresh_token);
		
		return reply.status(200).send({
			"user": {
				"id": userId,
				"phone": phoneNumber,
				"phoneVerified": true
			},
			"message": "auth.phone_update_success"
		});
	} catch (error: any) {
		if (error.message === "phone_exists")
			return reply.code(400).send({
					"error": "phone_exists",
					"message": "Ce numéro de téléphone est déjà utilisé par un autre compte"
				});
		else if (error.message === "User not found")
			return reply.code(400).send({
					"error": "invalid_credentials",
					"message": "auth.invalid_credentials"
				});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};