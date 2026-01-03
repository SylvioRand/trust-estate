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

export async function verifyAccessToken(
	request: FastifyRequest,
	reply: FastifyReply,
	publicKey: string
): Promise<UserInterface | void> {
	const { realestate_access_token, realestate_refresh_token } = request.cookies;

	if (!realestate_access_token) {
		if (realestate_refresh_token) {
			reply.redirect("/auth/refresh");
			return;
		}

		reply.code(401).send({
			error: "invalid_or_expired_token",
			message: "auth.verification_token_invalid"
		});
		return;
	}

	try {
		return jwt.verify(
			realestate_access_token,
			publicKey,
			{ algorithms: ["RS256"] }
		) as UserInterface;
	} catch {
		reply.code(401).send({
			error: "invalid_or_expired_token",
			message: "auth.verification_token_invalid"
		});
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
		const user = await verifyAccessToken(request, reply, publicKey);
		if (!user) return;
		request.user = user;
	});

	app.decorate("emailVerifiedAuthentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const user = await verifyAccessToken(request, reply, publicKey);

		if (!user) return;
		request.user = user;

		if (!user.emailVerified)
			return reply.code(401).send({
				"error": "email_not_verified",
				"message": "auth.email_verification_required",
				"redirect": "/request-email-verification.html"
			});
	});

	app.decorate("phoneVerifiedAuthentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const user = await verifyAccessToken(request, reply, publicKey);

		if (!user) return;
		request.user = user;
		if (!user.phoneVerified)
			return reply.code(403).send({
				"error": "phone_number_not_verified",
				"message": "auth.phone_number_verification_required",
			});
	});
	
	app.decorate("authentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const user = await verifyAccessToken(request, reply, publicKey);

		if (!user) return;
		request.user = user;

		if (!user.phoneVerified)
			return reply.code(403).send({
				"error": "phone_number_not_verified",
				"message": "auth.phone_number_verification_required",
				"redirect": "/add-phone.html"
			});
		if (!user.emailVerified) {
			console.log("FDFDGFDG");
			return reply.code(403).send({
				"error": "email_not_verified",
				"message": "auth.email_verification_required",
				"redirect": "/request-email-verification.html"
			});
		}
	});
};

export default fastifyPlugin(jwtPlugin);