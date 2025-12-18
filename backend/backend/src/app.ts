import fastify from "fastify";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyEnv from '@fastify/env'
import dotenv from 'dotenv';
import { envSchema } from "./module/backend.schema.ts";
import { moduleRegister } from "./module/back.module.ts";
import fastifyCors from "@fastify/cors";
import { addHooks } from "./module/hook.ts";
import { gatewayRoutes } from "./module/routes.ts";

const dir = "../.env";

try {
	dotenv.config({ path: dir });
} catch (error: any) {
	console.log(error);
}

const options = {
	confKey: 'config',
	schema: envSchema,
	dotenv: true,
	data: process.env
}


const server : FastifyInstance = fastify({
	logger: {
		level: 'info',
	},
	trustProxy: true
});

await server.register(fastifyCors, {
	origin: ['http://127.0.0.1:3000'],
	methods: ['GET','POST','PUT'],
	allowedHeaders: ['Content-Type','Authorization'],
	exposedHeaders: ['X-Total-Count'],
	credentials:true,
	maxAge:600
});

await server.register(fastifyEnv, options);
await moduleRegister(server);
await addHooks(server);
await gatewayRoutes(server);

server.addHook('onRequest', async (req, reply) => {
	const allowedPrefixes = ['/auth', '/users', '/orders']

	if (!allowedPrefixes.some(p => req.url.startsWith(p))) {
		return reply.code(404).send({ error: 'Route non exposée' })
	};
});

server.get("/", async (req:FastifyRequest, reply: FastifyReply) => {
	return reply.status(200).send("Bonjour");
})

const start = async () => {
	try {
		await server.listen({
			port: parseInt(process.env.PORT_BACKEND || '3000'),
			host: '0.0.0.0'
		});

	} catch (error : any) {
		server.log.error(error);
		process.exit(1);
	}
}

start();