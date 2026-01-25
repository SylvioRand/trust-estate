import { z } from 'zod';

export const FlaggedListingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  reportReason: z.enum(['fraud', 'duplicate', 'spam', 'incorrect_info', 'inappropriate']).optional()
}).strict();

export const AdminActionSchema = z.object({
  action: z.enum(['block_temporary', 'archive_permanent', 'request_clarification', 'reject_reports']),
  reason: z.string().min(5, { message: 'validation.admin.reason.too_short' }),
  messageToSeller: z.string().optional(),
  internalNote: z.string().optional()
}).strict();

export const ListingPostParamsSchema = z.object({
  id: z.string().uuid()
})

export const ModerationActionSchema = z.object({
  action: z.enum([
    "block_temporary",
    "archive_permanent",
    "request_clarification",
    "reject_reports"
  ], {
    message: "validation.admin.action.invalid"
  }),

  reason: z.string()
    .min(10, "validation.admin.reason.too_short")
    .max(500, "validation.admin.reason.too_long"),
  messageToSeller: z.string()
    .max(1000, "validation.admin.message.too_long")
    .optional(),
  internalNote: z.string()
    .max(1000, "validation.admin.note.too_long")
    .optional()
}).strict();

export const ModerationActionsQuerySchema = z.object({
  moderator: z.string().uuid().optional(),
  targetId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export type FlaggedListingsQuery = z.infer<typeof FlaggedListingsQuerySchema>;
export type AdminAction = z.infer<typeof AdminActionSchema>;
export type ListingPostParams = z.infer<typeof ListingPostParamsSchema>;
export type ModerationActionData = z.infer<typeof ModerationActionSchema>;
export type ModerationActionsQuery = z.infer<typeof ModerationActionsQuerySchema>;
