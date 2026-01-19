import type { FastifyInstance } from "fastify";
import * as creditController from "./credit.controllers"
import { DebitCreditSchema, InternalCreditSchema, RechargerSchema } from "./credit.schema";

export async function creditRoutes(app: FastifyInstance) {
	app.post<{Body: {amount: number}}>("/credits/recharge",
		{
			schema: RechargerSchema,
			preHandler: app.authentication
		}, creditController.rechargeCredit);
	app.get("/credits/balance",
		{
			preHandler: app.authentication
		}, creditController.getBalance);
};

export async function InternalRoutes(app: FastifyInstance) {
	app.post<{Body: any}>("/internal/credits/debit",
		{
			schema: DebitCreditSchema,
			preHandler: app.internalAuthentication
		}, creditController.debitBalance);
	app.post<{Body: any}>("/internal/credits/credit",
		{
			schema: InternalCreditSchema,
			preHandler: app.internalAuthentication
		}, creditController.creditBalance);
}