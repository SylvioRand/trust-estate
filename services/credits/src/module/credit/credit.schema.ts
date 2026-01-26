const RechargeTypesCredit = ['recharge', 'bonus']
const RechargeReasonCredit = ['recharge_pack', 'initial_bonus']
import { z } from 'zod';

export const RechargerSchema = {
  body: {
    type: 'object',
    required: ["amount", "reason", "type"],
    properties: {
      amount: {
        type: "number",
        minimum: 0,
      },
      reason: { type: "string", enum: RechargeReasonCredit },
      type: { type: "string", enum: RechargeTypesCredit }
    },
    additionalProperties: false
  }
};

const StatusTypes = ['publish_listing', 'renew_listing', 'reserve_visit']

export const DebitCreditSchema = {
  body: {
    type: 'object',
    required: ["reason"],
    properties: {
      reason: { type: "string", enum: StatusTypes }
    },
    additionalProperties: false
  }
}

const StatusReasonCredit = ['initial_bonus', 'refund_cancelled']
const StatusTypesCredit = ['refund', 'bonus']

export const InternalCreditSchema = {
  body: {
    type: 'object',
    required: ["reason", "type"],
    properties: {
      reason: { type: "string", enum: StatusReasonCredit },
      type: { type: "string", enum: StatusTypesCredit }
    },
    additionalProperties: false
  }
}

export const HistoryQuerrySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().default(20),
}).strict();
