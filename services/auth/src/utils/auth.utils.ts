import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { UserInterface } from "../modules/auth/auth.interface";
import type { User } from "../modules/auth/auth.interface";
import { saveRefreshToken } from "./token.utils";

export function generateTokens(app: FastifyInstance, user: UserInterface) {
	const payload = {
		id: user.id,
		role: user.role,
		phoneVerified: user.phoneVerified,
		emailVerified: user.emailVerified
	};
	return {
		id: payload.id,
		realestate_access_token: app.jwt.sign(payload, {
			expiresIn: "15m"
		}),
		realestate_refresh_token: app.jwt.sign(
			{
				userId: user.id,
				type: 'refresh'
			},
			{
				key: app.refreshSecret,
				expiresIn: "7d"
			})
	};
};

const isProduction = process.env.NODE_ENV === 'production';

export const cookieOptions = (httpOnly: boolean = true) => ({
	httpOnly,
	secure: true,
	sameSite: 'none' as const,
	path: '/'
});

export function setAuthCookies(reply: FastifyReply, realestate_access_token: string, realestate_refresh_token: string) {

	reply.setCookie("realestate_access_token", realestate_access_token, {
		...cookieOptions(true),
		maxAge: 15 * 60
	});
	reply.setCookie("realestate_refresh_token", realestate_refresh_token, {
		...cookieOptions(true),
		maxAge: 7 * 24 * 60 * 60
	});
	reply.setCookie("realestate_logged_in", "true", {
		...cookieOptions(false),
		maxAge: 7 * 24 * 60 * 60
	});
};

export async function generateAccessToken(request: FastifyRequest, reply: FastifyReply, user: any) {
	const { realestate_access_token, realestate_refresh_token } = generateTokens(request.server, user);
	setAuthCookies(reply, realestate_access_token, realestate_refresh_token);

	await saveRefreshToken(request.server, user.id, realestate_refresh_token);
	return {
		access_token: realestate_access_token,
		refresh_token: realestate_refresh_token
	};
}

export function responseUser(user: any) {
	const responseUser: User = {
		id: user.id,
		email: user.email,
		emailVerified: user.emailVerified,
		firstName: user.firstName,
		lastName: user.lastName,
		phone: user.phone,
		phoneVerified: user.phoneVerified,
		role: user.role,
		hasPassword: user.password !== null,

		creditBalance: user.creditBalance,
		createdAt: user.createAt.toISOString(),
		updatedAt: user.updateAt.toISOString()
	};
	return (responseUser);
}

export async function responseUserAddToken(request: FastifyRequest, reply: FastifyReply, user: any) {
	await generateAccessToken(request, reply, user);
	return (responseUser(user));
}