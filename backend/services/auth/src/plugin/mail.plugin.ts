import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin'
import fastifyMailer from "fastify-mailer";
import { generateMail } from '../utils/text.ts';
import nodemailer from 'nodemailer'

async function mailerPlugin(app: FastifyInstance, options: FastifyPluginOptions) {
	await app.register(fastifyMailer, {
		transport: {
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user: app.config.GMAIL_USER,
				pass: app.config.GMAIL_APP_PASSWORD
			}
		}
	});
};

export default fp(mailerPlugin);