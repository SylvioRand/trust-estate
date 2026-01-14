import { prisma } from '../../config/prisma';
import { PropertyListing, GetMineListingsQuery } from "./listing.schema";
import path from 'path';

export class ListingService {
    static async createListing(validatedData: PropertyListing, photos: string[], sellerId: string) {
        return await prisma.$transaction(async (tx) => {
            const listing = await tx.listing.create({
                data: {
                    type: validatedData.type,
                    propertyType: validatedData.propertyType,
                    title: validatedData.title,
                    description: validatedData.description,
                    price: validatedData.price,
                    surface: validatedData.surface,
                    zone: validatedData.zone,
                    photos: photos.map(p => path.basename(p)),
                    tags: validatedData.tags,
                    sellerId: sellerId,
                }
            });

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

            await tx.listingStats.create({
                data: {
                    listingId: listing.id,
                    views: 0,
                    reservations: 0,
                    feedbacks: 0
                }
            });

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

    static async getMineListings(sellerId: string, query: GetMineListingsQuery) {
        const where: any = { sellerId };

        if (query.status !== 'all') {
            where.status = query.status;
        }

        const [listings, countMatching, sellerStats] = await Promise.all([
            prisma.listing.findMany({
                where,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    stats: true
                }
            }),
            prisma.listing.count({ where }),
            prisma.sellerStats.findUnique({ where: { userId: sellerId } })
        ]);

        return {
            listings,
            countMatching,
            stats: {
                total: sellerStats?.totalListings || 0,
                active: sellerStats?.activeListings || 0,
                archived: (sellerStats?.totalListings || 0) - (sellerStats?.activeListings || 0)
            }
        };
    }
}
