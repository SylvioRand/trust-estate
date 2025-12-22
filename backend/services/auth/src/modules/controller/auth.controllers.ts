import type { FastifyReply, FastifyRequest } from "fastify";
import type { LoginUserInterface, SignUpUserInterface } from "../../interfaces/auth.interface.ts";

export async function loginUser(request: FastifyRequest < {Body: LoginUserInterface } >, reply: FastifyReply) {
	const { email, password } = request.body;
	const user = await request.server.prisma.user.findMany();

	console.log("==========><", user);
	try {
		// const {user, realestate_access_token, realestate_refresh_token} ;
	} catch (error: any) {
		
	}
}

export async function signUpUser(request: FastifyRequest < {Body: SignUpUserInterface} >, reply: FastifyReply) {
	
}

export async function refreshToken(request: FastifyRequest, reply: FastifyReply) {
	
}

export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
	
}

export async function verifiedEmail(request: FastifyRequest, reply: FastifyReply) {
	
}

export async function loginOauth(request: FastifyRequest, reply: FastifyReply) {
	
}