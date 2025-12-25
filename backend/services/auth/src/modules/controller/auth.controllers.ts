import type { FastifyReply, FastifyRequest } from "fastify";
import type { LoginUserInterface, SignUpUserInterface } from "../../interfaces/auth.interface.ts";
import * as authServices from '../services/auth.services.ts'
import { cookieOptions, generateAccessToken, responseUser } from "../../utils/auth.utils.ts";

export async function loginUser(request: FastifyRequest<{ Body: LoginUserInterface }>, reply: FastifyReply) {
	const { email, password } = request.body;

	try {
		const user = await authServices.findUserByEmail(request.server, email, password);
		const responseUsers = responseUser(request, reply, user);
		return (reply.status(200).send(responseUsers));
	} catch (error: any) {
		if (error.message === 'Email not verified')
			return reply.status(403).send({
				"error": "email_not_verified",
				"message": "Veuillez vérifier votre email avant de vous connecter."
			});
		else
			return reply.status(400).send({
				"error": "invalid_credentials",
				"message": "Email ou mot de passe incorrect"
			})
	}
}

export async function signUpUser(request: FastifyRequest<{ Body: SignUpUserInterface }>, reply: FastifyReply) {
	const { email, firstName, lastName, phone, password } = request.body;

	try {
		const id = await authServices.createUserAccount(request.server, email, firstName, lastName, phone, password);
		return reply.status(201).send({
			"userId": id,
			"message": "Un email de vérification a été envoyé."
		})
	} catch (error: any) {
		if (error.message === 'Your email is already in use')
			return reply.status(400).send({
				"error": "email_exists",
				"message": "Cet email est déjà utilisé"
			});
		else
			return reply.status(500).send({
				"error": "Internal server error",
				"message": "Internal server error"
			});
	}
}

export async function refreshToken(request: FastifyRequest, reply: FastifyReply) {
	const oldToken = request.cookies.realestate_refresh_token;

	if (!oldToken)
		return reply.code(401).send({
			"error": "invalid_credentials",
			"message": "Refresh token is missing"
		});
	try {
		const decoded: any = request.server.jwt.verify(oldToken, { key: request.server.refreshSecret });

		if (decoded.type !== 'refresh' || !decoded.userId) {
			return reply.code(401).send({
				"error": "invalid_credentials",
				"message": "Token invalide ou expiré"
			});
		}
		if (!await authServices.refreshTokenExists(request.server, decoded.userId, oldToken))
			return reply.code(401).send({
				"error": "invalid_credentials",
				"message": "Token invalide ou expiré"
			});
		const user = await authServices.updateRefrechToken(request.server, decoded, oldToken);
		await generateAccessToken(request, reply, user);
		return (reply.status(200).send({
			"success": true,
			"expiresIn": 900
		}))
	} catch (error: any) {
		if (error.message === "User not found")
			return reply.status(400).send({
				"error": "invalid_credentials",
				"message": "Token invalide ou expiré"
			});
		return reply.status(500).send({
			"error": "Internal server error",
			"message": "Internal server error"
		});
	}
}

export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
	const user = request.user;
	console.log("=>", user);
	if (!user) {
		console.log("User is not authenticated");
		return reply.code(401).send({
			"error":"Error",
			"message":"User is not authenticated"
		});
	}

	const realestate_refresh_token  = request.cookies.realestate_refresh_token;
	if (realestate_refresh_token) {
		await authServices.deleteRefreshToken(request.server, realestate_refresh_token);
	}

	reply.clearCookie("realestate_access_token", { ...cookieOptions });
	reply.clearCookie("realestate_refresh_token", { ...cookieOptions });
	return reply.status(200).send({
			"success": true,
			"message": "Déconnexion réussie"
		});
}

export async function verifiedEmail(request: FastifyRequest<{ Body: { token: string } }>, reply: FastifyReply) {
	const token = request.body.token;

	try {
		const user = await authServices.verifyTokenEmail(request.server, token);
		const responseUsers = responseUser(request, reply, user);
		return (reply.status(200).send(responseUsers));
	} catch (error: any) {
		return reply.status(400).send({
			"error": "invalid_credentials",
			"message": "Invalid token"
		});
	}
}

export async function resendEmailVerification(request: FastifyRequest<{ Body: { email: string, lastName: string } }>, reply: FastifyReply) {
	const { email, lastName } = request.body;

	try {
		const id = await authServices.resendEmail(request.server, lastName, email);
		return reply.status(201).send({
			"userId": id,
			"message": "Un email de vérification a été envoyé."
		})
	} catch (error: any) {
		if (error.message === 'Your email is already in verified')
			return reply.status(400).send({
				"error": "email_verified",
				"message": "Cet email est déjà verifié"
			});
		else if (error.message === "User not found")
			return reply.status(400).send({
				"error": "invalid_credentials",
				"message": "Email incorrect"
			});
		else
			return reply.status(500).send({
				"error": "Internal server error",
				"message": "Internal server error"
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
			"message": "Email incorrect"
		});

	try {
		const userData = await authServices.getUserInfo(request.server, code);
		const user = await authServices.createOrUpdateUserAccount(request.server, userData);
		const responseUsers = responseUser(request, reply, user);
		console.log(responseUsers);
		return (reply.redirect(request.server.config.FRONTEND_URL));
	} catch (error: any) {
		if (error.message === "Invalid credential")
			return reply.status(400).send({
				"error": "invalid_credentials",
				"message": "Email incorrect"
			});
		else if (error.message === "Ce compte est déjà lié à un autre compte Google")
			return reply.status(400).send({
				"error": "invalid_credentials",
				"message": "Ce compte est déjà lié à un autre compte Google"
			});
		else
			return reply.status(500).send({
				"error": "Internal server error",
				"message": "Internal server error"
			});
	}
}

export async function profile(request: FastifyRequest, reply: FastifyReply) {
	const token = request.cookies.realestate_access_token;

	if (!token) {
		return reply.status(401).send({ error: "Unauthorized", message: "Non authentifié" });
	}

	try {
		const decoded: any = request.server.jwt.verify(token);
		// Note: decoded.id comes from the payload
		const user = await authServices.findUserById(request.server, decoded.id);

		// Ensure we don't return null if user deleted but valid token
		if (!user) {
			return reply.status(401).send({ error: "Unauthorized", message: "Utilisateur introuvable" });
		}

		return user;
	} catch (error) {
		return reply.status(401).send({ error: "Unauthorized", message: "Session invalide" });
	}
}