import { z } from 'zod';
import zonesData from '../../shared/zones.json';

// Extraire les IDs valides depuis zones.json
const validZoneIds = zonesData.zones.map(z => z.displayName) as [string, ...string[]];
const ZoneIdSchema = z.enum(validZoneIds);
console.log("Valid Zone IDs:", validZoneIds);

export const PublishListingSchema = z.object({
  // Énumérations principales
  type: z.enum(["sale", "rent"]),
  propertyType: z.enum(["apartment", "house", "loft", "land", "commercial"]),

  // Informations textuelles
  title: z.string().min(5).max(100),
  description: z.string().min(10),

  // Données chiffrées (on s'assure que c'est positif)
  price: z.number().positive(),
  surface: z.number().positive(),

  // Localisation (validé contre zones.json)
  zone: ZoneIdSchema,

  // Objet imbriqué pour les caractéristiques
  features: z.object({
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative(),
    wc_separate: z.boolean(),
    parking_type: z.enum(["garage", "box", "parking", "none"]),
    garden_private: z.boolean(),
    pool: z.boolean(),
    water_access: z.boolean(),
    electricity_access: z.boolean(),
  }),

  // Tableau d'énums avec gestion du vide
  tags: z
    .array(z.enum(["urgent", "exclusive", "discount"]))
    .default([]) // Si le champ est absent, il devient []
});

// Extraction du type pour TypeScript
export type PropertyListing = z.infer<typeof PublishListingSchema>;
