import { uuid, z } from 'zod';
import zonesData from '../../shared/zones.json';

const validZone = zonesData.zones.map(z => z.displayName) as [string, ...string[]];
const ZoneSchema = z.enum(validZone);

export const PublishListingSchema = z.object({
  type: z.enum(['sale', 'rent']),
  propertyType: z.enum(['apartment', 'house', 'loft', 'land', 'commercial']),

  title: z.string().min(10).max(100),
  description: z.string().min(50).max(2000),

  price: z.number().int().positive().max(999_999_999_999),
  surface: z.number().int().positive().max(10_000),

  zone: ZoneSchema,

  features: z.object({
    bedrooms: z.number().int().min(0),
    bathrooms: z.number().int().min(0),
    wc: z.boolean(),
    wc_separate: z.boolean(),
    parking_type: z.enum(['none', 'garage', 'box', 'parking']),
    garden_private: z.boolean(),
    pool: z.boolean(),
    water_access: z.boolean(),
    electricity_access: z.boolean(),
  }),

  tags: z.array(z.enum(['urgent', 'exclusive', 'discount'])).default([])
}).strict();
export type PropertyListing = z.infer<typeof PublishListingSchema>;



export const GetMineListingsSchema = z.object({
  status: z.enum(['active', 'archived', 'blocked', 'all']).default('all'),

  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type GetMineListingsQuery = z.infer<typeof GetMineListingsSchema>;



export const SearchListingsSchema = z.object({
  type: z.enum(['sale', 'rent']).optional(),
  propertyType: z.enum(['apartment', 'house', 'loft', 'land', 'commercial']).optional(), // Add to contract if needed

  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minSurface: z.coerce.number().optional(), // Add to contract if needed
  maxSurface: z.coerce.number().optional(), // Add to contract if needed

  zone: z.string().optional(),

  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type SearchListingsQuery = z.infer<typeof SearchListingsSchema>;



export const UpdateListingSchema = PublishListingSchema.pick({
  type: true,
  propertyType: true,
  title: true,
  description: true,
  price: true,
  surface: true,
  zone: true,
  tags: true
}).partial().extend({
  features: PublishListingSchema.shape.features.partial().optional()
}).strict();
export type UpdateListingData = z.infer<typeof UpdateListingSchema>;



export const ArchiveListingSchema = z.object({
  sold: z.boolean().default(false)
}).strict();
export type ArchiveListingData = z.infer<typeof ArchiveListingSchema>;



import { ReportReason } from '@prisma/client';

export const ReportListingSchema = z.object({
  reason: z.nativeEnum(ReportReason, {
    message: 'validation.listing.report_reason.invalid'
  }),
  comment: z.string()
    .min(10, { message: 'validation.listing.report_comment.too_short' })
    .max(500, { message: 'validation.listing.report_comment.too_long' })
    .optional()
}).strict();
export type ReportListing = z.infer<typeof ReportListingSchema>;


export const GetSellerStatsParamsSchema = z.object({
  userId: z.string().uuid()
}).strict();
export type GetSellerStatsParams = z.infer<typeof GetSellerStatsParamsSchema>;

export const GetOneParamsSchema = z.object({
  id: z.string().uuid()
}).strict();

