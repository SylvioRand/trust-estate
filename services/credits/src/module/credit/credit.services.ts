import type { FastifyInstance } from "fastify";
import { TransactionReason, TransactionType } from "@prisma/client";

export async function rechargeUserCredit(app: FastifyInstance, userId: string, amount: number, reason: TransactionReason, type: TransactionType) {
	return await app.prisma.$transaction(async (tx) => {

		let creditBalance = await tx.creditBalance.findUnique({
			where: { userId },
		});

		const previousBalance = creditBalance?.balance ?? 0;

		if (!creditBalance) {
			creditBalance = await tx.creditBalance.create({
				data: {
					userId,
					balance: 0,
					totalEarned: 0,
					totalSpent: 0,
				},
			});
		}

		const creditBalances = await tx.creditBalance.upsert({
			where: { userId },
			update: {
				balance: { increment: amount },
				totalEarned: { increment: amount },
				lastRechargeAt: new Date(),
			},
			create: {
				userId
			}
		});

		const transaction = await tx.creditTransaction.create({
			data: {
				userId,
				amount: amount,
				type,
				reason,
				balanceAfter: previousBalance + amount,
			}
		});

		return {
			transactionId: transaction.id,
			newBalance: creditBalances.balance,
		};
	});
};

export async function getUserBalance(app: FastifyInstance, userId: string) {
	const balance = await app.prisma.creditBalance.findFirst({
		where: { userId }
	});

	if (!balance)
		throw new Error("balance_not_found");

	return (balance.balance);
};

export async function debitUserBalance(app: FastifyInstance, userId: string, reason: TransactionReason) {
	return await app.prisma.$transaction(async (tx) => {

		let creditBalance = await tx.creditBalance.findUnique({
			where: { userId },
		});

		const previousBalance = creditBalance?.balance ?? 0;

		if (!creditBalance)
			throw new Error("insufficient_credits");

		if (creditBalance.balance <= 0)
			throw new Error("insufficient_credits");

		const creditBalances = await tx.creditBalance.update({
			where: { userId },
			data: {
				balance: { decrement: 1 },
				totalEarned: { decrement: 1 }
			}
		});

		const transaction = await tx.creditTransaction.create({
			data: {
				userId,
				amount: 1,
				type: "consume",
				reason: reason,
				balanceAfter: previousBalance - 1,
			}
		});

		return {
			transactionId: transaction.id,
			newBalance: creditBalances.balance,
		};
	});
};

export async function refundUsercredit(app: FastifyInstance, userId: string, type: TransactionType, reason: TransactionReason) {
	return await app.prisma.$transaction(async (tx) => {

		let creditBalance = await tx.creditBalance.findUnique({
			where: { userId },
		});

		const previousBalance = creditBalance?.balance ?? 0;

		if (!creditBalance)
			throw new Error("insufficient_credits");

		let amount: number = 0;

		if (type === "bonus")
			amount = 5;
		else if (type === "refund")
			amount = 1;

		const creditBalances = await tx.creditBalance.update({
			where: { userId },
			data: {
				balance: { increment: amount },
				totalEarned: { increment: amount }
			}
		});

		const transaction = await tx.creditTransaction.create({
			data: {
				userId,
				amount: amount,
				type,
				reason,
				balanceAfter: previousBalance + 1,
			}
		});

		return {
			transactionId: transaction.id,
			newBalance: creditBalances.balance,
		};
	});
};

export async function deleteUserData(app: FastifyInstance, userId: string) {
	return await app.prisma.$transaction(async (tx) => {
		const deletedTransactions = await tx.creditTransaction.deleteMany({
			where: { userId }
		});

		const deletedBalance = await tx.creditBalance.deleteMany({
			where: { userId }
		});

		return {
			deletedTransactions: deletedTransactions.count,
			deletedBalance: deletedBalance.count
		};
	});
}

export async function getUserHistory(app: FastifyInstance, userId: string) {
	const history = await app.prisma.creditTransaction.findMany({
		where: { userId }
	});
	return {
		data: {
			id: history.id,
			type: history.type,
			amount: history.amount,
			balanceAfter: history.balanceAfter,
			createdAt: history.createdAt,
		}
	}
};