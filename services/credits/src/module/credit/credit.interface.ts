import { TransactionReason, TransactionType } from "@prisma/client";

export interface RechargeInterface {
	amount: number
	reason: TransactionReason 
	type: TransactionType
}

export interface creditBalanceInterface {
	reason: TransactionReason 
	type: TransactionType
}