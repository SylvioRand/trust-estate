import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as userControllers from './user.controllers'
import { UpdatePhoneNumberSchema } from "../auth/auth.schema";
import { addPasswordSchema, DeleteAccompte, UpdateInfoUserSchema, UpdatePasswordSchema } from "./user.schema";
import type { UpdateInfoUserInterface, UpdatePasswordInterface } from "./user.interface";
import { validatePassword } from "../../hooks/hooks";

export async function userRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get("/users/me", { preHandler: app.authentication }, userControllers.getUser);
	app.put<{ Body: { phoneNumber: string } }>("/users/me/phone",
		{
			schema: UpdatePhoneNumberSchema,
			preHandler: app.emailVerifiedAuthentication
		}, userControllers.updatePhoneNumber);
	app.put<{ Body: UpdatePasswordInterface }>("/users/me/update-password",
		{
			schema: UpdatePasswordSchema,
			preValidation: validatePassword,
			preHandler: app.authentication
		}, userControllers.requestUpdatePassword);
	app.put<{ Body: { password: string } }>("/users/me/add-password",
		{
			schema: addPasswordSchema,
			preHandler: app.authentication
		}, userControllers.setPassword);
	app.put<{ Body: UpdateInfoUserInterface }>("/users/me",
		{
			schema: UpdateInfoUserSchema,
			preHandler: app.authentication
		}, userControllers.updateInfoUser);
	app.get<{ Params: { id: string } }>("/users/:id/details",
		{
			preHandler: app.internalAuthOnly
		}, userControllers.userDetails);
}

export async function RGPDRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.delete<{ Body: { password: string } }>("/users/me",
		{
			schema: DeleteAccompte,
			preHandler: app.authentication
		}, userControllers.requestDeleteAccompte);
}