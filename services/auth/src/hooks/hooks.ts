import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UpdatePasswordInterface } from "../modules/user/user.interface";

export async function addHooks(server: FastifyInstance) {
	server.addHook("preParsing", async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
		const maxSize = 10 * 1024 * 1024;
		const contentLength = parseInt(req.headers['content-length'] || '0');

		if (contentLength > maxSize) {
			throw new Error(`Payload trop volumineux: ${contentLength} bytes (max: ${maxSize})`);
		}
	});

	server.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
		delete req.headers.host;
		delete req.headers['x-forwarded-host'];
		delete req.headers['x-real-ip'];

		if (req.headers['x-forwarded-for']) {
			req.headers['x-forwarded-for'] = (req.headers['x-forwarded-for'] as any).split(',')[0].trim()
		}
	});

	server.addHook('onSend', async (req:FastifyRequest, reply: FastifyReply) => {
		reply.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
		reply.header('X-Content-Type-Options', 'nosniff')
		reply.header('X-Frame-Options', 'DENY')
		reply.header('Referrer-Policy', 'no-referrer')
	});
}

export async function validatePassword(req:FastifyRequest <{Body: UpdatePasswordInterface}>, reply: FastifyReply) {
	const { password, newPassword } = req.body;

	if (password === newPassword)
		return reply.status(400).send({
			"error": "invalid_credentials",
			"message": "New password must be different"
		});
}