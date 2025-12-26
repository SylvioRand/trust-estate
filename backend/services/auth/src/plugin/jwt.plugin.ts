import fastifyPlugin from "fastify-plugin";
import type { FastifyBaseLogger, FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest,  } from "fastify";
import fastifyJwt from "@fastify/jwt";
import jwt from "jsonwebtoken";
import fs from "fs";
import type { UserInterface } from "../interfaces/auth.interface.ts";

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
	const privateKey = loadKey(app.config.JWT_SECRET_PRIVATE_KEY, app.log);
	const publicKey = loadKey(app.config.JWT_SECRET_PUBLIC_KEY, app.log);

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
		const {realestate_access_token, realestate_refresh_token} = request.cookies;

		try {
			if (!realestate_access_token)
			{
				if (realestate_refresh_token)
					return reply.redirect("/auth/refresh");
				return reply.code(401).send({ 
					"error": "invalid_refresh_token",
  					"message": "Missing token"
				});
			}
			const user = jwt.verify(realestate_access_token, publicKey, { algorithms: ["RS256"] }) as UserInterface;
			request.user = user;
			if (!user.phoneVerified)
				return reply.code(401).send({ 
					"error": "PHONE_NOT_VERIFIED",
					"message": "Missing token"
				});
			if (!user.emailVerified)
				return reply.code(401).send({ 
					"error": "Veuillez verifier votre numero de telephone",
					"message": "Veuillez verifier votre email"
				});
		} catch (err: any) {
			return reply.code(401).send({ error: "Invalid token" });
		}
	});
};

export default fastifyPlugin(jwtPlugin);