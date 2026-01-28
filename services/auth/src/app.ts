import fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import dotenv from 'dotenv';
import fastifyEnv from '@fastify/env'
import { envSchema } from "./config/env.schema";
import fastifyCors from "@fastify/cors";
import { authRegister, pluginRegister } from "./modules/auth/auth.module";
import { addHooks } from "./hooks/hooks";
import ajvErrors from 'ajv-errors';
import { setErrorHandler } from "./hooks/errorHandle";
import { userRegister } from "./modules/user/user.module";

const dir = "../../.env";

try {
	dotenv.config({ path: dir });
} catch (error: any) {
	const tmpServer = fastify({ logger: true });
	tmpServer.log.error(error);
	process.exit(1);
}

const options = {
	confKey: 'config',
	schema: envSchema,
	dotenv: true,
	data: process.env
};

const server = fastify({
	logger: true,
	ajv: {
		customOptions: {
		allErrors: true
		},
		plugins: [ajvErrors]
	}
});

await server.register(fastifyCors, {
	origin: ['http://127.0.0.1:3001', 'http://127.0.0.1:5500', 'http://localhost:5500'],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	exposedHeaders: ['X-Total-Count'],
	credentials: true,
	maxAge: 600
});

await setErrorHandler(server);

await server.register(fastifyEnv, options);
await addHooks(server);
await pluginRegister(server);
await authRegister(server);
await userRegister(server);

server.get("/health", async (req: FastifyRequest, reply: FastifyReply) => {
	return reply.status(200).send({ status: "ok" });
});

server.get("/api/auth", async (req: FastifyRequest, reply: FastifyReply) => {
	return reply.status(200).send("Bonjour depuis auth");
});

const start = async () => {
	try {
		await server.listen({
		port: parseInt(server.config.PORT_AUTH_SERVICE || '3001'),
		host: '0.0.0.0'
		});

	} catch (error: any) {
		server.log.error(error);
		process.exit(1);
	}
};

start();
