import type { FastifyReply, FastifyRequest } from "fastify";
import type { LoginUserInterface, SignUpUserInterface } from "../../interfaces/auth.interface.ts";
import * as authServices from '../services/auth.services.ts'
import { generateTokens, responseUser, setAuthCookies } from "../../utils/auth.utils.ts";

export async function loginUser(request: FastifyRequest < {Body: LoginUserInterface } >, reply: FastifyReply) {
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

export async function signUpUser(request: FastifyRequest < {Body: SignUpUserInterface} >, reply: FastifyReply) {
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
	
}

export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
	
}

export async function verifiedEmail(request: FastifyRequest <{Body: {token: string}}>, reply: FastifyReply) {
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

export async function resendEmailVerification(request: FastifyRequest <{Body: {email: string, lastName: string}}>, reply: FastifyReply) {
	const {email, lastName} = request.body;

	try {
		const id = await authServices.resendEmail(request.server,lastName, email);
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
	
}