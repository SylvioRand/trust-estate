import type { FastifyInstance, FastifyReply } from "fastify";
import bcrypt from 'bcrypt'
import crypto from "node:crypto";
import { createHash } from 'node:crypto';
import { generateMail } from "../../utils/text.ts";

export async function findUserByEmail(app: FastifyInstance, email: string, password: string) {
	const user = await app.prisma.user.findUnique({
		where: {email: email},
		include: {
			sellerStats: true
		}
	});

	if (!user)
		throw new Error("User not found");
	const isValid = await bcrypt.compare(password, user.password);

	if (!isValid)
		throw new Error("Mot de passe incorrect");
	if (!user.emailVerified)
		throw new Error("Email not verified");

	return (user);
}

export async function createUserAccount(app: FastifyInstance,
	 email: string, firstName: string, lastName: string, phone: string, password: string) {
	const userExist = await app.prisma.user.findUnique({
		where: {email: email}
	});
	if (userExist && userExist.email === email) {
		throw new Error("Your email is already in use");
	}
	try {
		const salt = await bcrypt.genSalt(12);
		const passwordHash = await bcrypt.hash(password, salt);
		const hash = crypto.randomBytes(32).toString('base64url');
		const tokenHash = createHash('sha256').update(hash).digest('hex');

		const user = await app.prisma.user.create({
			data: {
				email,
				firstName,
				lastName,
				password: passwordHash,
				phone,
				emailVerificationToken: {
					create: {
						tokenHash,
						expiresAt: new Date(Date.now() + 1000 * 60 * 24).toISOString()
					}
				}
			},
			include: {
				sellerStats: true
			}
		});

		const baseUrl = app.config.FRONTEND_URL;
		const verificationUrl = `${baseUrl}/verify-email?token=${hash}`;
		const {text, html} = generateMail(lastName, verificationUrl);
		const info = await (app as any).mailer.sendMail({
			from: 'dinandrianom@gmail.com',
			to: email,
			subject: "✓ Confirmez votre adresse email",
			text: text,
			html: html
		});
		return (user.id);
	} catch (error: any) {
		throw new Error(error);
	}
};

export async function verifyTokenEmail(app: FastifyInstance, token: string) {
	const hash = createHash('sha256').update(token).digest('hex');
	const verificationToken = await app.prisma.email_Verification_token.findUnique({
		where: { tokenHash: hash}
	});

	if (!verificationToken)
		throw new Error("Invalid or expired verification token");

	const expiresAtTimestamp = new Date(verificationToken.expiresAt).getTime();
	if (expiresAtTimestamp < Date.now()) {
		throw new Error("Verification token has expired");
	}
	await app.prisma.user.update({
		where: { id: verificationToken.userId },
		data:{
			emailVerified: true
		}
	});
	const user = await app.prisma.user.findUnique({
		where: {id: verificationToken.userId}
	});
	await app.prisma.email_Verification_token.delete({
		where: {userId: verificationToken.userId}
	});
	return (user);
};

export async function resendEmail(app: FastifyInstance, lastName: string, email: string) {
	const user = await app.prisma.user.findUnique({
		where: {email: email}
	});

	if (!user)
		throw new Error("User not found");

	if (user.emailVerified)
		throw new Error("Your email is already in verified");
	const hash = crypto.randomBytes(32).toString('base64url');
	const tokenHash = createHash('sha256').update(hash).digest('hex');
	const expiresAt = new Date(Date.now() + 1000 * 60 * 24).toISOString();
	await app.prisma.email_Verification_token.upsert({
		where: {userId: user.id},
		update: {
			tokenHash,
			expiresAt
		},
		create:{
			userId: user.id,
			tokenHash,
			expiresAt
		}
	});

	const baseUrl = app.config.FRONTEND_URL;
	const verificationUrl = `${baseUrl}/verify-email?token=${hash}`;
	const {text, html} = generateMail(lastName, verificationUrl);
	const info = await (app as any).mailer.sendMail({
		from: 'dinandrianom@gmail.com',
		to: email,
		subject: "✓ Confirmez votre adresse email",
		text: text,
		html: html
	});
	return (user.id);
}