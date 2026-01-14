import { z } from 'zod';
import zonesData from '../../shared/zones.json';

const validZoneIds = zonesData.zones.map(z => z.displayName) as [string, ...string[]];
const ZoneIdSchema = z.enum(validZoneIds);

export const PublishListingSchema = z.object({
  type: z.enum(['sale', 'rent']),
  propertyType: z.enum(['apartment', 'house', 'loft', 'land', 'commercial']),

  title: z.string().min(10).max(100),
  description: z.string().min(50).max(2000),

  price: z.number().int().positive().max(999_999_999_999),
  surface: z.number().int().positive().max(10_000),

  zone: ZoneIdSchema,

  features: z.object({
    bedrooms: z.number().int().min(0),
    bathrooms: z.number().int().min(0),
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