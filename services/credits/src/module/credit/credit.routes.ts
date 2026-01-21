import type { FastifyInstance } from "fastify";
import * as creditController from "./credit.controllers"
import { DebitCreditSchema, InternalCreditSchema, RechargerSchema } from "./credit.schema";
import { creditBalanceInterface, RechargeInterface } from "./credit.interface";

export async function creditRoutes(app: FastifyInstance) {
	app.post<{ Body: RechargeInterface }>("/credits/recharge",
		{
			schema: RechargerSchema,
			preHandler: app.internalAuthentication
		}, creditController.rechargeCredit);
	app.post<{Body: RechargeInterface}>("/credits/recharge/me",
		{
			schema: RechargerSchema,
			preHandler: app.authentication
		}, creditController.rechargeCredit);
	app.get("/credits/balance",
		{
			preHandler: app.authentication
		}, creditController.getBalance);
	app.get("/credits/health", async (req, reply) => {
		return reply.status(200).send({ status: "ok", service: "credits", version: "1.0.1" });
	});
	app.get("/credits/history", { preHandler: app.authentication }, creditController.history);
};

export async function InternalRoutes(app: FastifyInstance) {
	app.post<{ Body: any }>("/internal/credits/debit",
		{
			schema: DebitCreditSchema,
			preHandler: app.internalAuthentication
		}, creditController.debitBalance);
	app.post<{ Body: creditBalanceInterface }>("/internal/credits/credit",
		{
			schema: InternalCreditSchema,
			preHandler: app.internalAuthentication
		}, creditController.creditBalance);
};

export async function deleteData(app: FastifyInstance) {
	app.delete("/internal/delete/data",
		{
			preHandler: app.internalAuthentication
		}, creditController.requestDeleteData);
}