import { prisma } from '../../config/prisma';
import { PropertyListing } from "./listing.schema";
import path from 'path';

export class ListingService {
    static async createListing(validatedData: PropertyListing, photos: string[], sellerId: string) {
        return await prisma.$transaction(async (tx) => {
            // 1. Créer l'annonce de base
            const listing = await tx.listing.create({
                data: {
                    type: validatedData.type,
                    propertyType: validatedData.propertyType,
                    title: validatedData.title,
                    description: validatedData.description,
                    price: validatedData.price,
                    surface: validatedData.surface,
                    zone: validatedData.zone,
                    photos: photos.map(p => path.basename(p)), // On ne garde que le nom du fichier
                    tags: validatedData.tags,
                    sellerId: sellerId,
                }
            });

            // 2. Créer les caractéristiques
            await tx.listingFeatures.create({
                data: {
                    listingId: listing.id,
                    bedrooms: validatedData.features.bedrooms,
                    bathrooms: validatedData.features.bathrooms,
                    wc_separate: validatedData.features.wc_separate,
                    parking_type: validatedData.features.parking_type,
                    garden_private: validatedData.features.garden_private,
                    pool: validatedData.features.pool,
                    water_access: validatedData.features.water_access,
                    electricity_access: validatedData.features.electricity_access,
                }
            });

            // 3. Initialiser les stats de l'annonce
            await tx.listingStats.create({
                data: {
                    listingId: listing.id,
                    views: 0,
                    reservations: 0,
                    feedbacks: 0
                }
            });

            // 4. Mettre à jour les stats du vendeur (Incrémentation)
            await tx.sellerStats.upsert({
                where: { userId: sellerId },
                update: {
                    totalListings: { increment: 1 },
                    activeListings: { increment: 1 }
                },
                create: {
                    userId: sellerId,
                    totalListings: 1,
                    activeListings: 1
                }
            });

            return listing;
        });
    }
}
