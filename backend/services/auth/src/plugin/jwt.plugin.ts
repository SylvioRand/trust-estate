import fastifyPlugin from "fastify-plugin";
import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest,  } from "fastify";
import fastifyJwt from "@fastify/jwt";

async function jwtPlugin(app: FastifyInstance, options: FastifyPluginOptions) {
	const JWT_ACCESS_SECRET = app.config.JWT_SECRET;
	const JWT_REFRESH_SECRET = app.config.JWT_REFRESH_SECRET;
	await app.register(fastifyJwt, {
		secret: JWT_ACCESS_SECRET,
		sign: {
			expiresIn: '15m'
		}
	});
	await app.decorate("refreshSecret", JWT_REFRESH_SECRET);
	await app.decorate("authentication", async function (request: FastifyRequest, reply: FastifyReply) {
		// const token = request.cookies.tokenPong;

		// if (!token) {
		// 	return reply.code(401).send({ error: "Missing session cookie" });
		// }

		// try {
		// 	const user = await request.server.jwt.verify(token);
		// 	request.user = user;
		// } catch (err: any) {
		// 	return reply.code(401).send({ error: "Invalid session" });
		// }
		// console.log("/n/n OK izy ra tafavoka eto");
	});
};

export default fastifyPlugin(jwtPlugin);