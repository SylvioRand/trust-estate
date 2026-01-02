import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as userControllers from './user.controllers'
import { UpdatePhoneNumberSchema } from "../auth/auth.schema";

export async function userRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get("/users/me", {preHandler: app.authentication}, userControllers.getUser);
	app.put<{Body: {phoneNumber: string}}>("/users/me/phone", 
		{schema: UpdatePhoneNumberSchema, preHandler: app.phoneAuthentication},
		 userControllers.updatePhoneNumber)
}