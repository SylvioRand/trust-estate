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

export type FlaggedListingsQuery = z.infer<typeof FlaggedListingsQuerySchema>;
export type AdminAction = z.infer<typeof AdminActionSchema>;
export type ListingPostParams = z.infer<typeof ListingPostParamsSchema>;
