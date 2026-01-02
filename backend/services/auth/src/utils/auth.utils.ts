import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { UserInterface } from "../interfaces/auth.interface";
import type { User } from "../interfaces/auth.interface";
import { saveRefreshToken } from "../modules/auth/auth.services";

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

export const cookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'none' as const,
	path: '/'
};

export function setAuthCookies(reply: FastifyReply, realestate_access_token: string, realestate_refresh_token: string) {
	
	reply.setCookie("realestate_access_token", realestate_access_token, {
		...cookieOptions,
		maxAge: 15 * 60
	});
	reply.setCookie("realestate_refresh_token", realestate_refresh_token, {
		...cookieOptions,
		maxAge: 7 * 24 * 60 * 60
	})
};

export async function generateAccessToken(request: FastifyRequest, reply: FastifyReply, user: any) {
	const {realestate_access_token, realestate_refresh_token} = generateTokens(request.server, user);
	setAuthCookies(reply, realestate_access_token, realestate_refresh_token);

	await saveRefreshToken(request.server, user.id, realestate_refresh_token);
	return (realestate_refresh_token);
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
		sellerStats: {
			totalListings: user.sellerStats?.totalListings || 0,
			averageRating: user.sellerStats?.averageRating || 0,
			activeListings: user.sellerStats?.activeListings || 0,
			successfulSales: user.sellerStats?.successfulSales || 0
		},
		creditBalance: user.creditBalance,
		createdAt: user.createAt.toISOString(),
	};
	return (responseUser);
}

export async function responseUserAddToken(request: FastifyRequest,reply: FastifyReply, user: any) {
	await generateAccessToken(request, reply, user);
	return (responseUser(user));
}