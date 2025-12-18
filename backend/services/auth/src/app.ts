import fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import dotenv from 'dotenv';
import fastifyEnv from '@fastify/env'
import { envSchema } from "./config/env.schema.ts";
import fastifyCors from "@fastify/cors";

const dir = "../../.env";

try {
	dotenv.config({ path: dir });
} catch (error: any) {
	console.log(error);
};

const options = {
	confKey: 'config',
	schema: envSchema,
	dotenv: true,
	data: process.env
};

const server = fastify({
	logger: true
});

await server.register(fastifyCors, {
	origin: ['http://127.0.0.1:3001'],
	methods: ['GET','POST','PUT'],
	allowedHeaders: ['Content-Type','Authorization'],
	exposedHeaders: ['X-Total-Count'],
	credentials:true,
	maxAge:600
});

await server.register(fastifyEnv, options);

server.addHook('onRequest', async (req, reply) => {
	console.log(req.server.config);
	console.log("HELLO", req.headers['x-internal-gateway'], req.server.config.INTERNAL_SECRET );
	if (req.headers['x-internal-gateway'] !== server.config.INTERNAL_SECRET || !req.headers['x-internal-gateway']) {
		return reply.code(403).send({
				"error": "forbidden",
				"message": "Vous n'avez pas la permission d'effectuer cette action"
				});
	}
});


server.get("/api/auth", async (req:FastifyRequest, reply: FastifyReply) => {
	return reply.status(200).send("Bonjour depuis auth");
});

const start = async () => {
	try {
		await server.listen({
			port: parseInt(server.config.PORT_AUTH_SERVICE || '3001'),
			host: '0.0.0.0'
		});

	} catch (error : any) {
		server.log.error(error);
		process.exit(1);
	}
};

start();