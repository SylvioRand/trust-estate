import type { FastifyInstance, FastifyReply } from "fastify";
import bcrypt from 'bcrypt'
import crypto from "node:crypto";
import { createHash } from 'node:crypto';
import { generateMail } from "../../utils/text.ts";
import type { UserGoogleInterface } from "../../interfaces/auth.interface.ts";

export async function findUserByEmail(app: FastifyInstance, email: string, password: string) {
	const user = await app.prisma.user.findUnique({
		where: { email: email },
		include: {
			sellerStats: true
		}
	});

	if (!user)
		throw new Error("User not found");

	if (user.password === null)
		throw new Error("Veuillez vous connecter par mail");
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
		where: { email: email }
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
		const verificationUrl = `${baseUrl}/verify-email.html?token=${hash}`;
		const { text, html } = generateMail(lastName, verificationUrl);
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
		where: { tokenHash: hash }
	});

	if (!verificationToken)
		throw new Error("Invalid or expired verification token");

	const expiresAtTimestamp = new Date(verificationToken.expiresAt).getTime();
	if (expiresAtTimestamp < Date.now()) {
		throw new Error("Verification token has expired");
	}
	await app.prisma.user.update({
		where: { id: verificationToken.userId },
		data: {
			emailVerified: true
		}
	});
	const user = await app.prisma.user.findUnique({
		where: { id: verificationToken.userId }
	});
	await app.prisma.email_Verification_token.delete({
		where: { userId: verificationToken.userId }
	});
	return (user);
};

export async function resendEmail(app: FastifyInstance, lastName: string, email: string) {
	const user = await app.prisma.user.findUnique({
		where: { email: email }
	});

	if (!user)
		throw new Error("User not found");

	if (user.emailVerified)
		throw new Error("Your email is already in verified");
	const hash = crypto.randomBytes(32).toString('base64url');
	const tokenHash = createHash('sha256').update(hash).digest('hex');
	const expiresAt = new Date(Date.now() + 1000 * 60 * 24).toISOString();
	await app.prisma.email_Verification_token.upsert({
		where: { userId: user.id },
		update: {
			tokenHash,
			expiresAt
		},
		create: {
			userId: user.id,
			tokenHash,
			expiresAt
		}
	});

	const baseUrl = app.config.FRONTEND_URL;
	const verificationUrl = `${baseUrl}/verify-email?token=${hash}`;
	const { text, html } = generateMail(lastName, verificationUrl);
	await (app as any).mailer.sendMail({
		from: 'dinandrianom@gmail.com',
		to: email,
		subject: "✓ Confirmez votre adresse email",
		text: text,
		html: html
	});
	return (user.id);
};

export async function getUserInfo(app: FastifyInstance, code: string): Promise<UserGoogleInterface> {
	const tokentResponse = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: app.config.GOOGLE_CLIENT_ID!,
			client_secret: app.config.GOOGLE_CLIENT_SECRET!,
			code,
			grant_type: "authorization_code",
			redirect_uri: app.config.REDIRECT_URI,
		}),
	});

	const tokens = await tokentResponse.json();

	if (!tokens)
		throw new Error("Invalid credentials");

	const userResponse = await fetch(app.config.USER_INFO_URL, {
		headers: { Authorization: `Bearer ${(tokens as any).access_token}` }
	});

	if (!userResponse.ok)
		throw new Error("Something went wrong")
	const userData: any = await userResponse.json();
	const userInfo: UserGoogleInterface = {
		id: userData.id,
		email: userData.email,
		verified_email: userData.verified_email,
		name: userData.name,
		given_name: userData.given_name,
		family_name: userData.family_name,
		picture: userData.picture
	};
	return (userInfo);
};

export async function createOrUpdateUserAccount(app: FastifyInstance, userData: UserGoogleInterface) {
	const user = await app.prisma.user.findUnique({
		where: { email: userData.email },
		include: { sellerStats: true }
	});

	if (!user) {
		return await app.prisma.user.create({
			data: {
				email: userData.email,
				firstName: userData.given_name,
				lastName: userData.family_name,
				sub: userData.id,
				emailVerified: true,
				phoneVerified: false
			},
			include: { sellerStats: true }
		});
	}
	if (user.sub && user.sub !== userData.id) {
		throw new Error("Ce compte est déjà lié à un autre compte Google");
	}

	if (!user.sub) {
		return await app.prisma.user.update({
			where: { id: user.id },
			data: {
				sub: userData.id,
				emailVerified: true
			}
		});
	}
	await app.prisma.email_Verification_token.deleteMany({
		where: { userId: user.id }
	});
	return (user);
}

export async function saveRefreshToken(app: FastifyInstance, userId: string, token: string) {
	const tokenHash = createHash('sha256').update(token).digest('hex');
	const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

	await app.prisma.refresh_token.upsert({
		where: { userId },
		update: {
			tokenHash,
			expiresAt
		},
		create: {
			userId,
			tokenHash,
			expiresAt
		}
	});
}

export async function refreshTokenExists(app: FastifyInstance, userId: string, token: string): Promise<boolean> {
	const tokenHash = createHash('sha256').update(token).digest('hex');
	const storedToken = await app.prisma.refresh_token.findUnique({
		where: { userId }
	});

	if (!storedToken) return false;

	return (
		storedToken.tokenHash === tokenHash &&
		storedToken.expiresAt > new Date()
	);
}

export async function deleteRefreshToken(app: FastifyInstance, token: string): Promise<void> {
	const tokenHash = createHash('sha256').update(token).digest('hex');
	await app.prisma.refresh_token.deleteMany({
		where: { tokenHash: tokenHash }
	});
}

export async function updateRefrechToken(app: FastifyInstance, decoded: any, oldToken: string) {
	const user = await app.prisma.user.findUnique({
		where: { id: decoded.userId }
	})

	if (!user)
		throw new Error("User not found");
	await deleteRefreshToken(app, oldToken);
	return (user);
}

export async function findUserById(app: FastifyInstance, id: string) {
	const user = await app.prisma.user.findUnique({
		where: { id: id },
		include: {
			sellerStats: true
		}
	});
	if (!user) throw new Error("User not found");
	return (user);
}

export async function updatePhoneNumberUser(app: FastifyInstance, userId: string, phone: string) {
	await app.prisma.user.update({
		where: {id: userId},
		data: {
			phone,
			phoneVerified: true
		}
	});
}