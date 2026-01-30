import { uuid, z } from 'zod';
import zonesData from '../../shared/zones.json';
import { ReportReason } from '@prisma/client';

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
  propertyType: z.enum(['apartment', 'house', 'loft', 'land', 'commercial']).optional(),

  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minSurface: z.coerce.number().optional(),
  maxSurface: z.coerce.number().optional(),
  minBedRoom: z.coerce.number().optional(),
  maxBedRoom: z.coerce.number().optional(),
  minBathRoom: z.coerce.number().optional(),
  maxBathRoom: z.coerce.number().optional(),
  parkingType: z.preprocess((val) => {
    if (typeof val === 'string') return [val];
    return val;
  }, z.array(z.enum(['none', 'garage', 'box', 'parking'])).optional()),
  waterAccess: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : val, z.boolean().optional()),
  electricityAccess: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : val, z.boolean().optional()),
  pool: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : val, z.boolean().optional()),
  gardenPrivate: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : val, z.boolean().optional()),
  tags: z.preprocess((val) => {
    if (typeof val === 'string') return [val];
    return val;
  }, z.array(z.enum(['urgent', 'exclusive', 'discount'])).optional()),
  zone: ZoneSchema.optional(),

  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).refine((data) => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: "validation.listing.search.price_range_invalid",
  path: ["minPrice"]
}).refine((data) => {
  if (data.minSurface !== undefined && data.maxSurface !== undefined) {
    return data.minSurface <= data.maxSurface;
  }
  return true;
}, {
  message: "validation.listing.search.surface_range_invalid",
  path: ["minSurface"]
}).refine((data) => {
  if (data.minBedRoom !== undefined && data.maxBedRoom !== undefined) {
    return data.minBedRoom <= data.maxBedRoom;
  }
  return true;
}, {
  message: "validation.listing.search.bedroom_range_invalid",
  path: ["minBedRoom"]
}).refine((data) => {
  if (data.minBathRoom !== undefined && data.maxBathRoom !== undefined) {
    return data.minBathRoom <= data.maxBathRoom;
  }
  return true;
}, {
  message: "validation.listing.search.bathroom_range_invalid",
  path: ["minBathRoom"]
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
  action: z.literal("archive")
}).strict();
export type ArchiveListingData = z.infer<typeof ArchiveListingSchema>;



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


const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const UpdateAvailabilitySchema = z.object({
  weeklySchedule: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0, 'validation.listing.schedule.invalid_day').max(6, 'validation.listing.schedule.invalid_day'),
      startTime: z.string().regex(timeRegex, "validation.listing.schedule.invalid_time"),
      endTime: z.string().regex(timeRegex, "validation.listing.schedule.invalid_time"),
    })
  ).min(1, "validation.listing.schedule.required")
    .refine((data) => {
      return data.every(slot => {
        const [startH, startM] = slot.startTime.split(':').map(Number);
        const [endH, endM] = slot.endTime.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        return startMinutes < endMinutes;
      });
    }, {
      message: "validation.listing.schedule.invalid_range",
      path: ["weeklySchedule"]
    })
});
export type UpdateavailabilityType = z.infer<typeof UpdateAvailabilitySchema>;


export const GetSlotsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.invalid_date_format"),
  days: z.coerce.number().int().min(1).max(14).default(7) // On limite à 14 jours par exemple
});
export type GetSlotsQuery = z.infer<typeof GetSlotsQuerySchema>;

export const GetSlotsResponseSchema = z.object({
  slots: z.array(z.object({
    start: z.string(),
    end: z.string(),
    available: z.boolean()
  }))
});
export type GetSlotsResponse = z.infer<typeof GetSlotsResponseSchema>;

export const GetAvailabilityParamsSchema = z.object({
  id: z.string().uuid()
}).strict();

export type getAvailabilityParams = z.infer<typeof GetAvailabilityParamsSchema>

export const ReservationIdSchema = z.object({
  listingId: z.string().uuid()
}).strict();

export type ReservationIdParams = z.infer<typeof ReservationIdSchema>

export const GetDeleteUserDataParams = z.object({
  userId: z.string().uuid()
}).strict();

export type GetDeleteUserDataParamsType = z.infer<typeof GetDeleteUserDataParams>;
