import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { UserInterface } from "../interfaces/auth.interface.ts";
import type { User } from "../interfaces/auth.interface.ts";

export function generateTokens(app: FastifyInstance, user: UserInterface) {
	const payload = {
		id: user.id,
		email: user.email,
		lastName: user.lastName,
		firstName: user.firstName,
		phone: user.phone
	};
	return {
		id: payload.id,
		realestate_access_token: app.jwt.sign(payload, { expiresIn: "15m" }),
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

export function setAuthCookies(reply: FastifyReply, realestate_access_token: string, realestate_refresh_token: string) {
	const cookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'none' as const,
		path: '/'
	};
	reply.setCookie("tokenPong", realestate_access_token, {
		...cookieOptions,
		maxAge: 15 * 60
	});
	reply.setCookie("refreshTokenPong", realestate_refresh_token, {
		...cookieOptions,
		maxAge: 7 * 24 * 60 * 60
	})
	console.log("refreshTokenPong", realestate_refresh_token);
};

export function responseUser(request: FastifyRequest,reply: FastifyReply, user: any) {
	const {realestate_access_token, realestate_refresh_token} = generateTokens(request.server, user);
	setAuthCookies(reply, realestate_access_token, realestate_refresh_token);

	const responseUser: User = {
		id: user.id,
		email: user.email,
		emailVerified: user.emailVerified,
		firstName: user.firstName,
		lastName: user.lastName,
		role: user.role,
		sellerStats: {
			totalListings: user.sellerStats?.totalListings || 0,
			averageRating: user.sellerStats?.averageRating || 0,
		},
		creditBalance: user.creditBalance,
		createdAt: user.createAt.toISOString(),
	};
	return (responseUser);
}