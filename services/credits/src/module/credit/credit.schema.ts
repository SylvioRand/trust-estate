export const RechargerSchema = {
	body: {
		type: 'object',
		required: ["amount"],
		properties: {
			amount: {
				type: "number",
				minimum: 0,
			}
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
			reason: {type:"string", enum: StatusTypes}
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
			reason: {type:"string", enum: StatusReasonCredit},
			type: {type:"string", enum: StatusTypesCredit}
		},
		additionalProperties: false
	}
}