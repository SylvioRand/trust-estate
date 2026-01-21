import type { FastifyReply, FastifyRequest } from "fastify";
import * as userServices from './user.service'
import type { UserInterface } from "../auth/auth.interface";
import { generateAccessToken, responseUser } from "../../utils/auth.utils";
import type { UpdateInfoUserInterface, UpdatePasswordInterface } from "./user.interface";
import { logoutUser } from "../auth/auth.controllers";

export async function getUser(request: FastifyRequest, reply: FastifyReply) {
	const user = request.user as UserInterface;

	if (!user)
		return reply.status(401).send({
				"error": "invalid_credentials",
				"message": "auth.invalid_credentials"
			});
	try {
		const result = await userServices.showProfile(request.server, user);
	
		return reply.status(200).send(responseUser(result));
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
		await generateAccessToken(request, reply, updatedUser);
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
			return reply.code(404).send({
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

export async function requestUpdatePassword(request: FastifyRequest<{Body: UpdatePasswordInterface}>, reply: FastifyReply) {
	const {password, newPassword} = request.body;
	const userId = (request.user as UserInterface).id;

	try {
		await userServices.updatePassword(request.server, password, newPassword, userId);
		return reply.status(200).send({
			"user": {
				"id": userId
			},
			"message": "auth.password_update_success"
		});
	} catch (error: any) {
		if (error.message === "Invalid password" || error.message === "User not found")
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
}

export async function setPassword(request: FastifyRequest<{Body: {password: string}}>, reply: FastifyReply) {
	const password = request.body.password;
	const userId = (request.user as UserInterface).id;

	try {
		await userServices.addPassword(request.server, password, userId)
		return reply.status(200).send({
			"user": {
				"id": userId
			},
			"message": "auth.password_add_success"
		});
	} catch (error : any) {
		if (error.message === "Invalid password" || error.message === "User not found")
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
}

export async function updateInfoUser(request: FastifyRequest<{Body: UpdateInfoUserInterface}>, reply: FastifyReply) {
	const {phone, firstName, lastName} = request.body;
	const userId = (request.user as UserInterface).id;

	try {
		await userServices.updateUser(request.server, phone, firstName, userId, lastName)
		return reply.status(200).send({
			"updated": true,
			"user": {
				"id": "7631562f-fa30-4db3-8af2-4db942f0efd7",
				"firstName": "Jude",
				"lastName": "Turner",
				"phone": "+261386000000"
			}
		})
	} catch (error : any) {
		if (error.message === "User not found")
			return reply.code(404).send({
				"error": "user_not_found",
				"message": "User not found"
			});
		else if (error.message === "phone_exists")
			return reply.code(400).send({
				"error": "phone_exists",
				"message": "auth.phone_already_exists"
			})
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function userDetails(request: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
	const userId = request.params.id;

	try {
		const response = await userServices.getUserDetails(request.server, userId);
		return reply.status(200).send(response);
	} catch (error: any) {
		if (error.message === "User not found")
			return reply.code(404).send({
					"error": "user_not_found",
					"message": "User not found"
				});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function requestDeleteAccompte(request: FastifyRequest<{Body: {password: string}}>, reply: FastifyReply) {
	const password = request.body.password;
	const userId = (request.user as UserInterface).id;

	try {
		await userServices.DeleteUser(request.server, userId, password);
		await logoutUser(request, reply);
	} catch (error: any) {
		if (error.message === "User not found")
			return reply.code(404).send({
					"error": "user_not_found",
					"message": "User not found"
				});
		else if (error.message === "Invalid password")
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
}
