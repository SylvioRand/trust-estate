import type { FastifyInstance } from "fastify";
import type { UserInterface } from "../auth/auth.interface";
import bcrypt from 'bcrypt'
import { UserDetailsInterface } from "./user.interface";

export async function showProfile(app: FastifyInstance, userPayload: UserInterface) {
	const user = await app.prisma.user.findUnique({
		where: { id: userPayload.id },
	});

	if (!user)
		throw new Error("User not found");

	return (user);
};


export async function updatePhoneNumberUser(app: FastifyInstance, userId: string, phone: string) {
	const phoneExist = await app.prisma.user.findFirst({
		where: { phone: phone }
	})

	if (phoneExist) {
		app.log.warn({
			userId,
			phone,
			action: 'phone_update_failed',
			reason: 'phone_already_exists',
			timestamp: new Date().toISOString()
		});
		throw new Error("phone_exists");
	}

	const updatedUser = await app.prisma.user.update({
		where: { id: userId },
		data: {
			phone,
			phoneVerified: true
		}
	});

	app.log.info({
		userId,
		phone,
		action: 'phone_updated',
		timestamp: new Date().toISOString()
	});

	return updatedUser;
};

export async function updatePassword(app: FastifyInstance, password: string, newPassword: string, userId: string) {
	const user = await app.prisma.user.findUnique({
		where: { id: userId },
	});


	if (!user)
		throw new Error("User not found");

	if (!user.password)
		throw new Error("Invalid password");

	const isValid = await bcrypt.compare(password, user.password);

	if (!isValid)
		throw new Error("Invalid password");

	const salt = await bcrypt.genSalt(12);
	const passwordHash = await bcrypt.hash(newPassword, salt);
	await app.prisma.user.update({
		where: { id: userId },
		data: {
			password: passwordHash
		}
	})
}

export async function addPassword(app: FastifyInstance, password: string, userId: string) {
	const user = await app.prisma.user.findUnique({
		where: { id: userId },
	});


	if (!user)
		throw new Error("User not found");

	if (user.password)
		throw new Error("Invalid password");
	const salt = await bcrypt.genSalt(12);

	const passwordHash = await bcrypt.hash(password, salt);
	await app.prisma.user.update({
		where: { id: userId },
		data: {
			password: passwordHash
		}
	});
}

export async function updateUser(app: FastifyInstance, phone: string, firstName: string, userId: string, lastName?: string) {
	const user = await app.prisma.user.findUnique({
		where: { id: userId }
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.phone !== phone) {
		const phoneExist = await app.prisma.user.findFirst({
			where: {
				phone,
				id: { not: userId }
			}
		});

		if (phoneExist) {
			app.log.warn({
				userId,
				phone,
				action: 'user_update_failed',
				reason: 'phone_already_exists',
				timestamp: new Date().toISOString()
			});
			throw new Error("phone_exists");
		}
	}

	const updatedUser = await app.prisma.user.update({
		where: { id: userId },
		data: {
			phone,
			lastName,
			firstName
		},
	});


	app.log.info({
		userId,
		action: 'user_updated',
		timestamp: new Date().toISOString()
	});

	return (updatedUser);
}


export async function getUserDetails(app: FastifyInstance, userId: string) {
	const user = await app.prisma.user.findUnique({
		where: {id : userId}
	});

	console.log(user);
	if (!user)
		throw new Error("User not found");

	const respone : UserDetailsInterface = {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName ?? undefined,
		email: user.email,
		phone: user.phone ?? undefined,
		createdAt: user.createAt
	};

	return (respone);
}