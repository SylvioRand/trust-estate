import fastifyPlugin from "fastify-plugin";
import type { FastifyBaseLogger, FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, } from "fastify";
import jwt from "jsonwebtoken";
import fs from "fs";
import { UserInterface } from "../interfaces/config.interface";

function loadKey(path: string, log: FastifyBaseLogger) {
	try {
		return (fs.readFileSync(path, 'utf8'));
	} catch (error: any) {
		log.fatal({ error, path });
		process.exit(1);
	}
}

async function jwtPlugin(app: FastifyInstance, options: FastifyPluginOptions) {
	app.decorate("authentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const cookies = request.headers.cookie || '';

		const internalToken = jwt.sign(
			{ service: 'auth-gateway' },
			app.config.INTERNAL_KEY_SECRET,
			{ algorithm: 'HS256', expiresIn: '30s' }
		);
		try {
			const response = await fetch(`${app.config.AUTH_SERVICE_URL}/auth/verify-token`, {
				method: 'POST',
				headers: {
					'x-internal-key': internalToken,
					'Cookie': cookies
				},
				credentials: 'include'
			});
			if (!response.ok) {
				const data = await response.json();
				return reply.status(response.status).send(data)
			}
			const setCookies = (response.headers as any).getSetCookie?.() || (response.headers as any).raw?.()['set-cookie'] || response.headers.get('set-cookie');
			if (setCookies) {
				reply.header('set-cookie', setCookies as any);
			}

			const user = await response.json() as UserInterface;
			(request as any).user = user;
		} catch (error: any) {
			return reply.status(400).send({ message: error.message })
		}
	});

	app.decorate("internalAuthentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const internalToken = (request as any).headers['x-internal-key'];
		let userId = (request as any).headers['x-user-id'];

		if (!userId)
			userId = (request.query as any).userId;
	
		if (!internalToken || !userId) {
			return reply.code(401).send({
				error: 'unauthorized',
				message: 'Missing internal token or user ID'
			});
		}

		try {
			const payload = jwt.verify(internalToken, app.config.INTERNAL_KEY_SECRET, {
				algorithms: ["HS256"]
			}) as any;

			if (!payload.service || !payload.userId) {
				return reply.code(401).send({
					error: 'invalid_token',
					message: 'Invalid internal token structure'
				});
			}

			if (payload.userId !== userId) {
				return reply.code(403).send({
					error: 'forbidden',
					message: 'User ID mismatch'
				});
			}

			(request as any).user = {
				id: userId,
			} as UserInterface;

		} catch (err) {
			return reply.code(401).send({
				error: 'invalid_token',
				message: 'Invalid or expired internal token'
			});
		}
	});
};

export default fastifyPlugin(jwtPlugin);
