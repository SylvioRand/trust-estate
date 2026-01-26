import type { FastifyInstance } from "fastify";
import { createHash } from 'node:crypto';

export async function saveRefreshToken(app: FastifyInstance, userId: string, token: string) {
	const tokenHash = createHash('sha256').update(token).digest('hex');
	const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

	await app.prisma.refresh_token.upsert({
		where: { userId },
		update: {
			tokenHash,
			expiresAt
		},
		create: {
			userId,
			tokenHash,
			expiresAt
		}
	});
}

export async function refreshTokenExists(app: FastifyInstance, userId: string, token: string) {
	const tokenHash = createHash('sha256').update(token).digest('hex');

	const storedToken = await app.prisma.refresh_token.findUnique({
		where: { userId }
	});
	if (!storedToken || storedToken.expiresAt <= new Date()) {
			return (null);
		}
	return (tokenHash);
}

export async function deleteRefreshToken(app: FastifyInstance, token: string): Promise<void> {
	const tokenHash = createHash('sha256').update(token).digest('hex');
	await app.prisma.refresh_token.deleteMany({
		where: { tokenHash: tokenHash }
	});
}

export async function updateRefreshToken(app: FastifyInstance, decoded: any, oldToken: string) {
	const user = await app.prisma.user.findUnique({
		where: { id: decoded.userId }
	})

	if (!user)
		throw new Error("User not found");
	await deleteRefreshToken(app, oldToken);
	return (user);
}
