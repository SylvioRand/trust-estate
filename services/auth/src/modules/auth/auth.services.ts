import type { FastifyInstance, FastifyReply } from "fastify";
import bcrypt from 'bcrypt'
import crypto from "node:crypto";
import { createHash } from 'node:crypto';
import { generateForgotPasswordMail, generateMail } from "../../utils/text";
import type { UserGoogleInterface } from "./auth.interface";
import { Role } from "@prisma/client";

export async function findUserByEmail(app: FastifyInstance, email: string, password: string) {
	const user = await app.prisma.user.findUnique({
		where: { email: email },
	});


	if (!user) {
		app.log.warn({
			email,
			action: 'login_failed',
			reason: 'user_not_found',
			timestamp: new Date().toISOString()
		});
		throw new Error("User not found");
	}

	if (user.password === null) {
		app.log.warn({
			userId: user.id,
			email: user.email,
			action: 'login_failed',
			reason: 'oauth_user_password_login_attempt',
			timestamp: new Date().toISOString()
		});
		throw new Error("Veuillez vous connecter par mail");
	}

	const isValid = await bcrypt.compare(password, user.password);

	if (!isValid) {
		app.log.warn({
			userId: user.id,
			email: user.email,
			action: 'login_failed',
			reason: 'invalid_password',
			timestamp: new Date().toISOString()
		});
		throw new Error("Mot de passe incorrect");
	}

	app.log.info({
		userId: user.id,
		email: user.email,
		action: 'login_success',
		timestamp: new Date().toISOString()
	});

	return (user);
}

export async function createUserAccount(app: FastifyInstance,
	email: string, firstName: string, lastName: string, phone: string, password: string) {
	const userExist = await app.prisma.user.findFirst({
		where: {
			OR: [
				{ email: email },
				{ phone: phone }
			]
		}
	});

	if (userExist) {
		if (userExist.email === email) {
			throw new Error("email_exists");
		}
		if (userExist.phone === phone) {
			throw new Error("phone_exists");
		}
	};

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
				phoneVerified: true,
				emailVerificationToken: {
					create: {
						tokenHash,
						expiresAt: new Date(Date.now() + 1000 * 60 * 24).toISOString()
					}
				}
			},
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

		app.log.info({
			userId: user.id,
			email,
			phone,
			action: 'account_created',
			timestamp: new Date().toISOString()
		});

		return (user);
	} catch (error: any) {
		throw new Error(error);
	}
};

export async function verifyTokenEmail(app: FastifyInstance, token: string) {
	const hash = createHash('sha256').update(token).digest('hex');

	const verificationToken = await app.prisma.email_Verification_token.findFirst({
		where: {
			tokenHash: hash,
			expiresAt: { gt: new Date() }
		}
	});

	if (!verificationToken)
		throw new Error("invalid_or_expired_token");

	const user = await app.prisma.$transaction(async (prisma: any) => {
		await prisma.user.update({
			where: { id: verificationToken.userId },
			data: { emailVerified: true }
		});

		await prisma.email_Verification_token.delete({
			where: { userId: verificationToken.userId }
		});

		return prisma.user.findUnique({
			where: { id: verificationToken.userId }
		});
	});

	app.log.info({
		userId: verificationToken.userId,
		action: 'email_verified',
		timestamp: new Date().toISOString()
	});

	return (user);
}

export async function resendEmail(app: FastifyInstance, lastName: string, email: string) {
	const user = await app.prisma.user.findUnique({
		where: { email: email },
		include: { emailVerificationToken: true }
	});

	if (!user)
		throw new Error("User not found");

	if (user.emailVerified)
		throw new Error("Your email is already in verified");

	if (user.emailVerificationToken) {
		const tokenCreatedAt = new Date(user.emailVerificationToken.expiresAt.getTime() - 24 * 60 * 1000);
		const timeSinceCreation = Date.now() - tokenCreatedAt.getTime();
		const ONE_MINUTE = 60 * 1000;

		if (timeSinceCreation < ONE_MINUTE) {
			const remainingSeconds = Math.ceil((ONE_MINUTE - timeSinceCreation) / 1000);
			app.log.warn({
				userId: user.id,
				email: user.email,
				action: 'resend_email_rate_limited',
				remainingSeconds
			});
			throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new verification email`);
		}
	}

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

	app.log.info({
		userId: user.id,
		email: user.email,
		action: 'verification_email_sent',
		timestamp: new Date().toISOString()
	});

	return (user.id);
};

/**
 * Fetch with retry logic to handle intermittent network issues (ETIMEDOUT) in Docker
 */
async function fetchWithRetry(
	url: string,
	options: RequestInit,
	maxRetries: number = 3,
	timeoutMs: number = 10000
): Promise<Response> {
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

			const response = await fetch(url, {
				...options,
				signal: controller.signal
			});

			clearTimeout(timeoutId);
			return response;
		} catch (error: any) {
			lastError = error;
			const isRetryableError =
				error.cause?.code === 'ETIMEDOUT' ||
				error.cause?.code === 'ECONNRESET' ||
				error.cause?.code === 'ECONNREFUSED' ||
				error.name === 'AbortError';

			if (isRetryableError && attempt < maxRetries) {
				console.warn(`⚠️ Fetch attempt ${attempt}/${maxRetries} failed (${error.cause?.code || error.name}), retrying in ${attempt * 500}ms...`);
				await new Promise(resolve => setTimeout(resolve, attempt * 500));
			} else {
				throw error;
			}
		}
	}

	throw lastError;
}

export async function getUserInfo(app: FastifyInstance, code: string): Promise<UserGoogleInterface> {
	const tokentResponse = await fetchWithRetry(app.config.TOKEN_URL, {
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
	if (!tokentResponse.ok) {
		throw new Error("Invalid credentials");
	}

	if (!tokens || !(tokens as any).access_token) {
		throw new Error("Invalid credentials");
	}

	const userResponse = await fetchWithRetry(app.config.USER_INFO_URL, {
		headers: { Authorization: `Bearer ${(tokens as any).access_token}` }
	});

	if (!userResponse.ok) {
		const errorData = await userResponse.json();
		throw new Error("Something went wrong");
	}
	const userData: any = await userResponse.json();

	const userInfo: UserGoogleInterface = {
		id: userData.id || userData.sub, // Google uses 'sub' as primary ID
		email: userData.email,
		verified_email: userData.verified_email,
		name: userData.name,
		given_name: userData.given_name || userData.name || 'User', // Fallback for required field
		family_name: userData.family_name || '',
		picture: userData.picture
	};
	return (userInfo);
};

export async function createOrUpdateUserAccount(app: FastifyInstance, userData: UserGoogleInterface) {
	const user = await app.prisma.user.findUnique({
		where: { email: userData.email },
	});


	if (!user) {
		const newUser = await app.prisma.user.create({
			data: {
				email: userData.email,
				firstName: userData.given_name,
				lastName: userData.family_name,
				sub: userData.id,
				emailVerified: true,
				phoneVerified: false
			},
		});
		try {
			await crediter(app, newUser.id);
		} catch (error: any) {
			app.log.error(error);
		}
		return (newUser);
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

export async function findUserById(app: FastifyInstance, id: string) {
	const user = await app.prisma.user.findUnique({
		where: { id: id },
	});

	if (!user) throw new Error("User not found");
	return (user);
}

export async function sendTokenForgotPassword(app: FastifyInstance, email: string) {
	const user = await app.prisma.user.findUnique({
		where: { email }
	});

	if (!user)
		throw new Error("User not found");
	const hash = crypto.randomBytes(32).toString('base64url');
	const tokenHash = createHash('sha256').update(hash).digest('hex');
	const expiresAt = new Date(Date.now() + 1000 * 60 * 24).toISOString();

	await app.prisma.forgot_password_token.upsert({
		where: { userId: user.id },
		create: {
			userId: user.id,
			tokenHash,
			expiresAt
		},
		update: {
			tokenHash,
			expiresAt
		}
	});

	const baseUrl = app.config.FRONTEND_URL;
	const resetPasswordUrl = `${baseUrl}/sign-in/reset-password?token=${hash}`;
	const { text, html } = generateForgotPasswordMail(resetPasswordUrl);
	await (app as any).mailer.sendMail({
		from: 'dinandrianom@gmail.com',
		to: email,
		subject: "Reinitialisation de mot de passe",
		text: text,
		html: html
	});
};

export async function changePassword(app: FastifyInstance, token: string, password: string) {
	const hash = createHash('sha256').update(token).digest('hex');
	const tokenExist = await app.prisma.forgot_password_token.findUnique({
		where: { tokenHash: hash }
	});

	if (!tokenExist)
		throw new Error("Invalid token");

	if (tokenExist.expiresAt < new Date())
		throw new Error("Invalid token");

	const salt = await bcrypt.genSalt(12);
	const passwordHash = await bcrypt.hash(password, salt);
	await app.prisma.user.update({
		where: { id: tokenExist.userId },
		data: {
			password: passwordHash
		}
	});

	await app.prisma.forgot_password_token.delete({
		where: { userId: tokenExist.userId }
	})
};

export async function crediter(app: FastifyInstance, userId: string) {
	const jwt = await import('jsonwebtoken');
	const internalToken = jwt.default.sign(
		{ service: 'reservation-service', userId },
		app.config.INTERNAL_KEY_SECRET,
		{ algorithm: 'HS256', expiresIn: '30s' }
	);

	try {
		const response = await fetch(`${app.config.CREDITS_SERVICE_URL}/credits/recharge`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-internal-key': internalToken,
				'x-user-id': userId
			},
			body: JSON.stringify({
				amount: 5,
				reason: "initial_bonus",
				type: 'bonus'
			})
		});

		if (!response.ok) {
			const error = await response.json() as any;
			throw new Error('credit_service_error');
		}
	} catch (error: any) {
		app.log.error({ error }, 'Failed to credit user');
	}
};

export async function isModerator(app: FastifyInstance, userId: string) {
	const user = await app.prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user)
		throw new Error("User not found");

	if (user.role != "MODERATOR")
		throw new Error("moderator_required");

	return (user.id);
}

export async function changeRole(app: FastifyInstance, amdinUserid: string, userId: string, role: Role) {
	const adminUser = await app.prisma.user.findUnique({
		where: { id: amdinUserid }
	});

	if (!adminUser)
		throw new Error("User not found");

	if (adminUser.role != "ADMIN")
		throw new Error("admin_required");

	if (amdinUserid === userId)
		throw new Error("Can't assign this role");

	const user = await app.prisma.user.findUnique({
		where: { id: userId }
	});

	if (!user)
		throw new Error("User not found");

	await app.prisma.user.update({
		where: { id: userId },
		data: {
			role
		}
	});
}