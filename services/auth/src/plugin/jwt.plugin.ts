import fastifyPlugin from "fastify-plugin";
import type { FastifyBaseLogger, FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest,  } from "fastify";
import fastifyJwt from "@fastify/jwt";
import jwt from "jsonwebtoken";
import fs from "fs";
import { createHash } from "node:crypto";
import type { UserInterface } from "../modules/auth/auth.interface";
import { deleteRefreshToken, refreshTokenExists } from "../utils/token.utils";
import { generateAccessToken } from "../utils/auth.utils";

function loadKey(path:string, log: FastifyBaseLogger) {
	try {
		return (fs.readFileSync(path, 'utf8'));
	} catch (error: any) {
		log.fatal({error, path});
		process.exit(1);
	}
}

async function autoRefreshToken(
	request: FastifyRequest,
	reply: FastifyReply,
	refreshToken: string,
	refreshSecret: string,
	privateKey: string,
	cookieOptions: any
): Promise<UserInterface | null> {
	try {
		const decoded: any = jwt.verify(refreshToken, refreshSecret,{ algorithms: ["HS256"] });

		if (decoded.type !== 'refresh' || !decoded.userId) {
			return null;
		}
		const tokenHash = await refreshTokenExists(request.server, decoded.userId, refreshToken);

		if (!tokenHash)
		{
			reply.clearCookie("realestate_access_token", { ...cookieOptions });
			reply.clearCookie("realestate_refresh_token", { ...cookieOptions });
			return (null);
		}
		const user = await request.server.prisma.user.findUnique({
			where: { id: decoded.userId }
		});

		if (!user) return null;
		await deleteRefreshToken(request.server, refreshToken);
		await generateAccessToken(request, reply, user);
		
		return {
			id: user.id,
			role: user.role,
			phoneVerified: user.phoneVerified,
			emailVerified: user.emailVerified
		} as UserInterface;
	} catch (error) {
		return null;
	}
}

export async function verifyAccessToken(
	request: FastifyRequest,
	reply: FastifyReply,
	publicKey: string,
	refreshSecret: string,
	privateKey: string,
	cookieOptions: any
): Promise<UserInterface | void> {
	const { realestate_access_token, realestate_refresh_token } = request.cookies;
	if (!realestate_access_token) {
		if (realestate_refresh_token) {
			const user = await autoRefreshToken(
				request,
				reply,
				realestate_refresh_token,
				refreshSecret,
				privateKey,
				cookieOptions
			);
			console.log(user);
			
			if (user) {
				return user;
			}
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
	} catch (error: any) {
		if (error.name === "TokenExpiredError" && realestate_refresh_token) {
			const user = await autoRefreshToken(
				request,
				reply,
				realestate_refresh_token,
				refreshSecret,
				privateKey,
				cookieOptions
			);

			if (user) {
				return (user);
			}
		}

		reply.code(401).send({
			error: "invalid_or_expired_token",
			message: "auth.verification_token_invalid"
		});
	}
}

async function validateToken(request: FastifyRequest, reply: FastifyReply)
	{
	const internalToken = (request as any).headers['x-internal-key'];

	try {
		const payload = jwt.verify(internalToken, "INTERNAL_KEY", { algorithms: ["HS256"] });
		return (payload);
	} catch (err) {
		reply.code(401).send({ error: 'Invalide' });
	}
}

async function jwtPlugin(app: FastifyInstance, options: FastifyPluginOptions) {
	const JWT_REFRESH_SECRET = app.config.JWT_REFRESH_SECRET;
	const privateKey = loadKey(app.config.JWT_SECRET_PRIVATE_KEY, app.log);
	const publicKey = loadKey(app.config.JWT_SECRET_PUBLIC_KEY, app.log);

	const isProduction = process.env.NODE_ENV === 'production';

	const cookieOptions = {
		httpOnly: true,
		secure: isProduction,
		sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
		path: '/',
		maxAge: 7 * 24 * 60 * 60 * 1000
	};

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
		const user = await verifyAccessToken(request, reply, publicKey, JWT_REFRESH_SECRET, privateKey, cookieOptions);
		if (!user) return;
		request.user = user;
	});

	app.decorate("emailVerifiedAuthentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const user = await verifyAccessToken(request, reply, publicKey, JWT_REFRESH_SECRET, privateKey, cookieOptions);

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
		const user = await verifyAccessToken(request, reply, publicKey, JWT_REFRESH_SECRET, privateKey, cookieOptions);

		if (!user) return;
		request.user = user;
		if (!user.phoneVerified)
			return reply.code(403).send({
				"error": "phone_number_not_verified",
				"message": "auth.phone_number_verification_required",
			});
	});
	
	app.decorate("authentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const user = await verifyAccessToken(request, reply, publicKey, JWT_REFRESH_SECRET, privateKey, cookieOptions);

		if (!user) return;
		request.user = user;

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
	});

	app.decorate("authValidations", async function (request: FastifyRequest, reply: FastifyReply) {
		const payload = await validateToken(request, reply);
		if (!payload)
			return;

		const user = await verifyAccessToken(request, reply, publicKey, JWT_REFRESH_SECRET, privateKey, cookieOptions);
		if (!user) return;
		request.user = user;

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
	});

};

export default fastifyPlugin(jwtPlugin);