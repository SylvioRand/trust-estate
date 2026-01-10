import { z } from 'zod';

export const PublishListingSchema = z.object({
  type: z.enum(["sale", "rent"]),
  propertyType: z.enum(["apartment", "house", "loft", "land", "commercial"]),
  title: z.string().min(10, "Le titre est trop court").max(100),
  description: z.string().min(20, "La description doit être plus détaillée"),
  price: z.number().positive("Le prix doit être supérieur à 0"),
  surface: z.number().positive(),
  zone: z.string().min(2, "Zone invalide"),

  // Validation des photos (on vérifie que c'est bien du texte base64)
  photos: z.array(z.string().regex(/^data:image\/\w+;base64,/, "Format d'image invalide"))
    .min(1, "Au moins une photo est requise"),

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

  // Gestion des tags : on transforme les doublons en valeurs uniques
  tags: z.array(z.enum(["urgent", "exclusive", "discount"]))
    .default([])
    .transform(val => [...new Set(val)]), // Supprime les doublons automatiquement
});
