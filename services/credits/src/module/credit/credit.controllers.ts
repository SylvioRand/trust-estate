import type { FastifyReply, FastifyRequest } from "fastify";
import * as creditServices from "./credit.services"
import { UserInterface } from "../../interfaces/config.interface";
import { TransactionReason, TransactionType } from "@prisma/client";
import { creditBalanceInterface, RechargeInterface } from "./credit.interface";

export async function rechargeCredit(request: FastifyRequest<{Body: RechargeInterface}>, reply: FastifyReply) {
	const amount = request.body.amount;
	const reason = request.body.reason;
	const type = request.body.type;
	const user = (request as any).user as UserInterface;

	if (!user) {
		return reply.code(400).send({
			"error": "Error",
			"message": "User is not authenticated"
		});
	}

	try {
		const { transactionId, newBalance } = await  creditServices.rechargeUserCredit(request.server, user.id, amount, reason, type) as any;
		return reply.status(200).send({
				"success": true,
				"newBalance": newBalance,
				"transactionId": transactionId
			})
	} catch (error: any) {
		if (error.message === "payment_failed")
			return reply.status(400).send({
				"error": "payment_failed",
				"message": "payment.transaction_failed",
			});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function getBalance(request: FastifyRequest, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;

	if (!user) {
		return reply.code(400).send({
			"error": "Error",
			"message": "User is not authenticated"
		});
	}

	try {
		const balance = await creditServices.getUserBalance(request.server, user.id)
		return reply.status(200).send({
			"balance": balance,
			"currency": "credits"
		})
	} catch (error: any) {
		if (error.message === "balance_not_found")
			return reply.status(404).send({
				"error": "balance_not_found",
				"message": "balance.balance_not_found",
			});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function debitBalance(request: FastifyRequest<{Body: {reason: TransactionReason}}>, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;
	const reason = request.body.reason;

	if (!user) {
		return reply.code(400).send({
			"error": "Error",
			"message": "User is not authenticated"
		});
	};

	try {
		const { transactionId, newBalance } = await creditServices.debitUserBalance(request.server, user.id, reason);
		return reply.status(200).send({
				"success": true,
				"newBalance": newBalance,
				"transactionId": transactionId
			})
	} catch (error: any) {
		if (error.message === "insufficient_credits")
			return reply.status(402).send({
				"error": "insufficient_credits",
				"message": "payment.insufficient_credits_publish",
				"required": 1,
				"balance": 0
			});
		else
			return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
}

export async function creditBalance(request: FastifyRequest<{Body: creditBalanceInterface}>, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;
	const reason = request.body.reason;
	const type = request.body.type;

	if (!user) {
		return reply.code(400).send({
			"error": "Error",
			"message": "User is not authenticated"
		});
	};

	try {
		const { transactionId, newBalance } = await creditServices.refundUsercredit(request.server, user.id, type, reason);
		return reply.status(200).send({
				"success": true,
				"newBalance": newBalance,
				"transactionId": transactionId
			})
	} catch (error: any) {
		return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
};

export async function requestDeleteData(request: FastifyRequest, reply: FastifyReply) {
	const user = (request as any).user as UserInterface;

	if (!user) {
		return reply.code(400).send({
			"error": "Error",
			"message": "User is not authenticated"
		});
	};

	try {
		await creditServices.deleteUserData(request.server, user.id);
		return reply.status(200).send({
			"deleted": true,
			"message": "auth.account_deleted_success"
		});
	} catch (error: any) {
		return reply.status(500).send({
				"error": "internal_server_error",
				"message": "common.internal_server_error"
			});
	}
}