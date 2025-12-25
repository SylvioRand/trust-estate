import fastifyPlugin from "fastify-plugin";
import type { FastifyBaseLogger, FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest,  } from "fastify";
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
	const publicKey = loadKey(app.config.JWT_SECRET_PUBLIC_KEY, app.log);
	const privateKey = loadKey(app.config.GATEWAY_SECRET_PRIVATE_KEY, app.log);

	app.decorate("authentication", async function (request: FastifyRequest, reply: FastifyReply) {
		const {realestate_access_token, realestate_refresh_token} = request.cookies;

		try {
			if (!realestate_access_token)
			{
				if (realestate_refresh_token)
					return reply.redirect("/auth/refresh");
				return reply.code(401).send({ error: "Missing token" });
			}
			const user = jwt.verify(realestate_access_token, publicKey, { algorithms: ["RS256"] });
			console.log(user);
			(request as any).user = user;
		    const internalToken = jwt.sign(
				{
					sub: (user as any).id,
					scp: ["access:service"],
				},
				privateKey,
				{
					algorithm: "RS256",
					issuer: "gateway.mycompany.internal",
					audience: "service",
					expiresIn: "30s",
					jwtid: crypto.randomUUID(),
			});
			(request as any).internalToken  = internalToken;
		} catch (err: any) {
			return reply.code(401).send({ error: "Invalid token" });
		}
	});
};

export default fastifyPlugin(jwtPlugin);