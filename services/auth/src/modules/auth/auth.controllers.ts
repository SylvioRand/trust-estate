import type { FastifyReply, FastifyRequest } from "fastify";
import type { changePermissionInterface, LoginUserInterface, SignUpUserInterface, UserInterface } from "./auth.interface";
import * as authServices from './auth.services'
import { cookieOptions, generateAccessToken, responseUserAddToken } from "../../utils/auth.utils";
import { deleteRefreshToken } from "../../utils/token.utils";

export async function loginUser(request: FastifyRequest<{ Body: LoginUserInterface }>, reply: FastifyReply) {
	const { email, password } = request.body;

	try {
		const user = await authServices.findUserByEmail(request.server, email, password);
		const data = await responseUserAddToken(request, reply, user);
		return (reply.status(200).send(data));
	} catch (error: any) {
		if (error.message === 'Email not verified')
			return reply.status(403).send({
				"error": "email_not_verified",
				"message": "auth.email_verification_required"
			});
		else
			return reply.status(400).send({
				"error": "invalid_credentials",
				"message": "auth.invalid_credentials"
			})
	}
}

export async function signUpUser(request: FastifyRequest<{ Body: SignUpUserInterface }>, reply: FastifyReply) {
	const { email, firstName, lastName, phone, password } = request.body;

	try {
		const user = await authServices.createUserAccount(request.server, email, firstName, lastName, phone, password);
		const data = await responseUserAddToken(request, reply, user);
		return reply.status(201).send({
			data,
			"message": "auth.verification_email_sent"
		})
	} catch (error: any) {
		if (error.message === 'email_exists')
			return reply.status(400).send({
				"error": "email_exists",
				"message": "auth.email_already_exists"
			});
		else if (error.message === 'phone_exists')
			return reply.status(400).send({
				"error": "phone_exists",
				"message": "auth.phone_already_exists"
			});
		else
			return reply.status(500).send({
				"error": "Internal server error",
				"message": "Internal server error"
			});
	}
}

export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
	const user = request.user;

	if (!user) {
		return reply.code(400).send({
			"error": "Error",
			"message": "User is not authenticated"
		});
	}

	const realestate_refresh_token = request.cookies.realestate_refresh_token;
	if (realestate_refresh_token) {
		await deleteRefreshToken(request.server, realestate_refresh_token);
	}

	reply.clearCookie("realestate_access_token", { ...cookieOptions });
	reply.clearCookie("realestate_refresh_token", { ...cookieOptions });
	return reply.status(200).send({
		"success": "true",
		"message": "auth.logout_success"
	});
}

export async function verifiedEmail(request: FastifyRequest<{ Body: { token: string } }>, reply: FastifyReply) {
	const token = request.body.token;

	try {
		const user = await authServices.verifyTokenEmail(request.server, token);
		const data = await responseUserAddToken(request, reply, user);
		await authServices.crediter(request.server, user.id);
		return (reply.status(200).send({
			data,
			message: "Compte activé avec succès. 5 crédits offerts !"
		}));
	} catch (error: any) {
		return reply.status(401).send({
			"error": "invalid_or_expired_token",
			"message": "auth.verification_token_invalid"
		});
	}
}

export async function resendEmailVerification(request: FastifyRequest, reply: FastifyReply) {
	const user = request.user as UserInterface;

	if (!user) {
		return reply.status(401).send({
			"error": "invalid_credentials",
			"message": "auth.invalid_credentials"
		});
	}

	try {
		const users = await authServices.findUserById(request.server, user.id);
		const id = await authServices.resendEmail(request.server, users.firstName, users.email);
		return reply.status(201).send({
			"userId": id,
			"message": "auth.verification_email_sent_if_exists"
		})
	} catch (error: any) {
		if (error.message === "Your email is already in verified") {
			return reply.status(400).send({
				"error": "email_already_verified",
				"message": "auth.email_already_verified"
			});
		}
		else if (error.message === "User not found")
			return reply.status(404).send({
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

export async function loginOauth(request: FastifyRequest, reply: FastifyReply) {
	const params = new URLSearchParams({
		client_id: request.server.config.GOOGLE_CLIENT_ID,
		redirect_uri: request.server.config.REDIRECT_URI,
		response_type: 'code',
		scope: 'openid email profile',
		access_type: 'offline',
		prompt: 'consent',
		include_granted_scopes: 'true',
		state: 'state_parameter_passthrough_value'
	});

	return reply.redirect(`${request.server.config.AUTH_URL}?${params.toString()}`)
}

export async function googleCallback(request: FastifyRequest<{ Querystring: { code: string } }>, reply: FastifyReply) {
	const { code } = request.query;

	if (!code)
		return reply.status(400).send({
			"error": "invalid_credentials",
			"message": "auth.invalid_credentials"
		});

	try {
		const userData = await authServices.getUserInfo(request.server, code);
		const user = await authServices.createOrUpdateUserAccount(request.server, userData);
		await generateAccessToken(request, reply, user);

		return (reply.redirect(`${request.server.config.FRONTEND_URL}/home?auth_google=success`));
	} catch (error: any) {
		console.error("❌ Google Auth Callback Error:", error);
		if (error.message === "Invalid credential")
			return reply.status(400).send({
				"error": "invalid_google_token",
				"message": "auth.google_token_invalid"
			});
		else if (error.message === "Ce compte est déjà lié à un autre compte Google")
			return reply.status(403).send({
				"error": "invalid_google_token",
				"message": "auth.google_token_invalid"
			});
		else {
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
		}
	}
}

export async function forgotPassword(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
	const email = request.body.email;

	try {
		await authServices.sendTokenForgotPassword(request.server, email);
		return reply.status(200).send({ "message": "auth.reset_password_email_sent" })
	} catch (error: any) {
		if (error.message === "User not found")
			return reply.status(404).send({
				"error": "forgot_pass_user_not_found",
				"message": "auth.forgot_pass_user_not_found"
			});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function resetPassword(request: FastifyRequest<{
	Body: { newPassword: string, token: string }
}>, reply: FastifyReply) {
	const token = request.body.token;
	const newPassword = request.body.newPassword;

	try {
		await authServices.changePassword(request.server, token, newPassword);
		return reply.status(200).send({
			"success": true,
			"message": "auth.password_reset_success"
		});
	} catch (error: any) {
		if (error.message === "Invalid token")
			return reply.status(401).send({
				"error": "invalid_token",
				"message": "auth.reset_token_invalid"
			});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
}

export async function authValidate(request: FastifyRequest, reply: FastifyReply) {
	return (request.user);
}

export async function verificationUserRole(request: FastifyRequest, reply: FastifyReply) {
	const user = request.user as UserInterface;

	if (!user) {
		return reply.status(401).send({
			"error": "invalid_credentials",
			"message": "auth.invalid_credentials"
		});
	}

	try {
		const userId = await authServices.isModerator(request.server, user.id);
		return reply.status(200).send({
			"id": userId,
			"role": "moderator",
			"phoneVerified": true,
			"emailVerified": true
		})
	} catch (error: any) {
		if (error.message === "admin_required")
			return reply.status(403).send({
				"error": "forbidden",
				"message": "auth.admin_required"
			})
		else if (error.message === "User not found")
			return reply.status(404).send({
				"error": "forgot_pass_user_not_found",
				"message": "auth.forgot_pass_user_not_found"
			});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function changeUserPermission(request: FastifyRequest<{Body: changePermissionInterface, Params: {id: string}}>, reply: FastifyReply) {
	const user = request.user as UserInterface;
	const userId = request.params.id;
	const permission = request.body.role;

	if (!user) {
		return reply.status(401).send({
			"error": "invalid_credentials",
			"message": "auth.invalid_credentials"
		});
	}

	try {
		await authServices.changeRole(request.server, user.id, userId, permission);
		return reply.status(200).send({
			"userId": userId,
			"success": true,
			"message": "User permission updated successfully"
		});
	} catch (error: any) {
		if (error.message === "User not found")
			return reply.status(404).send({
				"error":"user_not_found",
				"message": "auth.user_not_found"
			});
		else if (error.message === "admin_required")
			return reply.status(401).send({
				"error":"permission_denied",
				"message": "auth.permission_denied"
			});
		else if (error.message === "Can't assign this role")
			return reply.status(401).send({
				"error":"permission_denied",
				"message": "auth.can_t_assign_this_role"
			})
		return reply.status(500).send({
			"error": "internal_server_error",
			"message": "common.internal_server_error"
		});
	}
}