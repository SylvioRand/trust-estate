import type { FastifyInstance } from "fastify";
import type { UserInterface } from "../../interfaces/auth.interface";

export async function showProfile(app: FastifyInstance, userPayload: UserInterface) {
	const user = await app.prisma.user.findUnique({
		where: {id: userPayload.id},
		include: {
			sellerStats: true
		}
	});

	if (!user)
		throw new Error("User not found");

	return (user);
};


export async function updatePhoneNumberUser(app: FastifyInstance, userId: string, phone: string) {
	const phoneExist = await app.prisma.user.findFirst({
		where: {phone: phone}
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
		where: {id: userId},
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
