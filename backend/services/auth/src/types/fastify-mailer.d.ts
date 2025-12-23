declare module 'fastify-mailer' {
	import { FastifyPluginCallback } from 'fastify';
	const fastifyMailer: FastifyPluginCallback<any>;
	export default fastifyMailer;
}