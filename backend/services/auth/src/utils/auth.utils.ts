import type { FastifyInstance } from "fastify";

export function generateTokens(app: FastifyInstance, user: any) {
	const payload = {
		id: user.id,
		username: user.username,
		email: user.email,
		status: 'online'
	};
	return {
		id: payload.id,
		tokenJwt: app.jwt.sign(payload, { expiresIn: "15m" }),
		refreshTokenJwt: app.jwt.sign(
			{
				userId: user.id,
				type: 'refresh'
			},
			{
				key: app.refreshSecret,
				expiresIn: "7d"
			})
	};
}