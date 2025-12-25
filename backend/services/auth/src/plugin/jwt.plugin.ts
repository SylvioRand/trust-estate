import fastifyPlugin from "fastify-plugin";
import type { FastifyBaseLogger, FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest,  } from "fastify";
import fastifyJwt from "@fastify/jwt";
import jwt from "jsonwebtoken";
import fs from "fs";

function loadKey(path:string, log: FastifyBaseLogger) {
	try {
		return (fs.readFileSync(path, 'utf8'));
	} catch (error: any) {
		log.fatal({error, path});
		process.exit(1);
	}
}

async function jwtPlugin(app: FastifyInstance, options: FastifyPluginOptions) {
	const JWT_REFRESH_SECRET = app.config.JWT_REFRESH_SECRET;
	const privateKey = loadKey(`../${app.config.JWT_SECRET_PRIVATE_KEY}`, app.log);
	const publicKey = loadKey(`../${app.config.JWT_SECRET_PUBLIC_KEY}`, app.log);
	const interKey = loadKey(`../${app.config.GATEWAY_SECRET_PUBLIC_KEY}`, app.log);

	await app.register(fastifyJwt, {
		secret: {
			private: privateKey,
			public: publicKey,
		},
		sign: {
			algorithm: "RS256",
			expiresIn: "15m"
		}
	});
	app.decorate("privateKey", privateKey);
	app.decorate("refreshSecret", JWT_REFRESH_SECRET);
	app.decorate("authentication", async function (request: FastifyRequest, reply: FastifyReply) {
	try {
		const authHeader = request.headers.authorization;
		if (!authHeader) return reply.code(401).send({ error: "Missing token" });

		const token = authHeader.replace("Bearer ", "");
		const payload = jwt.verify(
			token,
			interKey,
			{
				algorithms: ["RS256"],
				issuer: "gateway.mycompany.internal",
				audience: "service",
			}
		) as any;

		if (!payload.scp || !payload.scp.includes("access:service"))
			return reply.code(403).send({ error: "Insufficient scope" });
		(request as any).user = {
			id: payload.sub,
			scopes: payload.scp,
			jti: payload.jti,
		};
	} catch (err: any) {
		return reply.code(401).send({ error: "Invalid token" });
	}
	});
};

export default fastifyPlugin(jwtPlugin);