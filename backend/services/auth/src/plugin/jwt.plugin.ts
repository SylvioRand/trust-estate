import fastifyPlugin from "fastify-plugin";
import type { FastifyBaseLogger, FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest,  } from "fastify";
import fastifyJwt from "@fastify/jwt";
import jwt from "jsonwebtoken";
import fs from "fs";
import type { UserInterface } from "../interfaces/auth.interface";

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

	app.decorate("partialAuthentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const {realestate_access_token, realestate_refresh_token} = request.cookies;

		try {
			if (!realestate_access_token)
			{
				if (realestate_refresh_token)
					return reply.redirect("/auth/refresh");
				return reply.code(401).send({
					"error": "invalid_or_expired_token",
					"message": "auth.verification_token_invalid"
				});
			}
			const user = jwt.verify(realestate_access_token, publicKey, { algorithms: ["RS256"] }) as UserInterface;
			request.user = user;
		} catch (err: any) {
			return reply.code(401).send({
				"error": "invalid_or_expired_token",
				"message": "auth.verification_token_invalid"
			});
		}
	});

	app.decorate("phoneAuthentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const {realestate_access_token, realestate_refresh_token} = request.cookies;

		try {
			if (!realestate_access_token)
			{
				if (realestate_refresh_token)
					return reply.redirect("/auth/refresh");
				return reply.code(401).send({
					"error": "invalid_or_expired_token",
					"message": "auth.verification_token_invalid"
				});
			}
			const user = jwt.verify(realestate_access_token, publicKey, { algorithms: ["RS256"] }) as UserInterface;
			request.user = user;

			if (!user.emailVerified)
				return reply.code(401).send({
					"error": "email_not_verified",
					"message": "auth.email_verification_required",
					"redirect": "/request-email-verification.html"
				});
		} catch (err: any) {
			return reply.code(401).send({
				"error": "invalid_or_expired_token",
				"message": "auth.verification_token_invalid"
			});
		}
	});

	app.decorate("emailAuthentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const {realestate_access_token, realestate_refresh_token} = request.cookies;

		try {
			if (!realestate_access_token)
			{
				if (realestate_refresh_token)
					return reply.redirect("/auth/refresh");
				return reply.code(401).send({
					"error": "invalid_or_expired_token",
					"message": "auth.verification_token_invalid"
				});
			}
			const user = jwt.verify(realestate_access_token, publicKey, { algorithms: ["RS256"] }) as UserInterface;
			request.user = user;

			if (!user.phoneVerified)
				return reply.code(403).send({
					"error": "phone_number_not_verified",
					"message": "auth.phone_number_verification_required",
				});
		} catch (err: any) {
			return reply.code(401).send({
				"error": "invalid_or_expired_token",
				"message": "auth.verification_token_invalid"
			});
		}
	});
	
	app.decorate("authentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const {realestate_access_token, realestate_refresh_token} = request.cookies;

		try {
			if (!realestate_access_token)
			{
				if (realestate_refresh_token)
					return reply.redirect("/auth/refresh");
				return reply.code(401).send({
					"error": "invalid_or_expired_token",
					"message": "auth.verification_token_invalid"
				});
			}
			const user = jwt.verify(realestate_access_token, publicKey, { algorithms: ["RS256"] }) as UserInterface;
			request.user = user;
			console.log(user);
			if (!user.phoneVerified)
				return reply.code(403).send({
					"error": "phone_number_not_verified",
					"message": "auth.phone_number_verification_required",
					"redirect": "/add-phone.html"
				});
			if (!user.emailVerified) {
				return reply.code(403).send({
					"error": "email_not_verified",
					"message": "auth.email_verification_required",
					"redirect": "/request-email-verification.html"
				});
			}
		} catch (err: any) {
			return reply.code(401).send({
				"error": "invalid_or_expired_token",
				"message": "auth.verification_token_invalid"
			});
		}
	});
};

export default fastifyPlugin(jwtPlugin);