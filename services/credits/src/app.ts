import fastify, { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv"
import fastifyCors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import { envSchema } from "./config/env.schema";
import { setupErrorHandler } from "./hooks/errorHandle";
import { creditRoutesRegister, pluginRegister } from "./module/credit/credit.modules";

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
	logger: true,
});


await server.register(fastifyCors, {
	origin: ['http://127.0.0.1:3001', 'http://127.0.0.1:5500', 'http://localhost:5500'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	exposedHeaders: ['X-Total-Count'],
	credentials: true,
	maxAge: 600
});

await server.register(fastifyEnv, options);
await setupErrorHandler(server);
await pluginRegister(server);
await creditRoutesRegister(server);



const start = async () => {
	try {
		await server.listen({
			port: parseInt(server.config.PORT_CREDITS_SERVICE || '3004'),
			host: '0.0.0.0'
		});

	} catch (error: any) {
		server.log.error(error);
		process.exit(1);
	}
};

start();