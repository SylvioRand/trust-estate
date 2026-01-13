import { z } from 'zod';
import zonesData from '../../shared/zones.json';

// Utiliser les IDs des zones (ex: "tana-analakely"), pas displayName
const validZoneIds = zonesData.zones.map(z => z.displayName) as [string, ...string[]];
const ZoneIdSchema = z.enum(validZoneIds);

export const PublishListingSchema = z.object({
  type: z.enum(['sale', 'rent']),
  propertyType: z.enum(['apartment', 'house', 'loft', 'land', 'commercial']),

  // Règles docs: title 10-100, description 50-2000
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(2000),

  // Limites docs
  price: z.number().int().positive().max(999_999_999_999),
  surface: z.number().int().positive().max(10_000),

  // Localisation
  zone: ZoneIdSchema,

  // Caractéristiques
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

  // Tags marketing (enum partagé)
  tags: z.array(z.enum(['urgent', 'exclusive', 'discount'])).default([])
}).strict(); // additionalProperties: false

// Extraction du type pour TypeScript
export type PropertyListing = z.infer<typeof PublishListingSchema>;
