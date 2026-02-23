import type { FastifyInstance } from "fastify";
import { TransactionReason, TransactionType } from "@prisma/client";

export async function rechargeUserCredit(app: FastifyInstance, userId: string, amount: number, reason: TransactionReason, type: TransactionType) {
	return await app.prisma.$transaction(async (tx) => {

		const cappedAmount = Math.min(amount, 5);

		let creditBalance = await tx.creditBalance.findUnique({
			where: { userId },
		});

		const previousBalance = creditBalance?.balance ?? 0;

		if (reason === 'recharge_pack') {
			if (creditBalance && creditBalance.balance > 0)
				throw new Error("balance_not_zero");

			// if (creditBalance?.lastRechargeAt) {
			// 	const now = new Date();
			// 	const last = new Date(creditBalance.lastRechargeAt);
			// 	const sameDay =
			// 		last.getUTCFullYear() === now.getUTCFullYear() &&
			// 		last.getUTCMonth() === now.getUTCMonth() &&
			// 		last.getUTCDate() === now.getUTCDate();
			// 	if (sameDay)
			// 		throw new Error("recharge_daily_limit");
			// }
		}

		const creditBalances = await tx.creditBalance.upsert({
			where: { userId },
			update: {
				balance: { increment: cappedAmount },
				totalEarned: { increment: cappedAmount },
				lastRechargeAt: new Date(),
			},
			create: {
				userId,
				balance: cappedAmount,
				totalEarned: cappedAmount,
				totalSpent: 0,
				lastRechargeAt: new Date(),
			}
		});

		const transaction = await tx.creditTransaction.create({
			data: {
				userId,
				amount: cappedAmount,
				type,
				reason,
				balanceAfter: previousBalance + cappedAmount,
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

	return balance?.balance ?? 0;
};

export async function ensureUserBalance(app: FastifyInstance, userId: string) {
	const balance = await app.prisma.creditBalance.upsert({
		where: { userId },
		update: {},
		create: {
			userId,
			balance: 0,
			totalEarned: 0,
			totalSpent: 0,
		},
	});
	return balance.balance;
};

export async function debitUserBalance(app: FastifyInstance, userId: string, reason: TransactionReason) {
	return await app.prisma.$transaction(async (tx) => {

		let creditBalance = await tx.creditBalance.findUnique({
			where: { userId },
		});

		const previousBalance = creditBalance?.balance ?? 0;

		const cost = reason === 'renew_listing' ? 0.5 : 1;

		if (!creditBalance)
			throw new Error("insufficient_credits");

		if (creditBalance.balance < cost)
			throw new Error("insufficient_credits");

		const creditBalances = await tx.creditBalance.update({
			where: { userId },
			data: {
				balance: { decrement: cost },
				totalSpent: { increment: cost }
			}
		});

		const transaction = await tx.creditTransaction.create({
			data: {
				userId,
				amount: cost,
				type: "consume",
				reason: reason,
				balanceAfter: previousBalance - cost,
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

		const safeDecrement = Math.min(amount, creditBalance.totalSpent ?? 0);

		const creditBalances = await tx.creditBalance.update({
			where: { userId },
			data: {
				balance: { increment: amount },
				totalEarned: { increment: amount },
				...(type === 'refund' && safeDecrement > 0 ? { totalSpent: { decrement: safeDecrement } } : {})
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

interface historyInterface {
	id: string
	type: string
	reason: string
	amount: string
	balanceAfter: string
	createdAt: Date
}

export async function getUserHistory(app: FastifyInstance, userId: string, page: number = 1, limit: number = 10) {
	const skip = (page - 1) * limit;

	const [history, total] = await Promise.all([
		app.prisma.creditTransaction.findMany({
			where: { userId },
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' }
		}),
		app.prisma.creditTransaction.count({ where: { userId } })
	]);

	return {
		data: history as historyInterface[],
		total,
		page,
		limit,
	};
};