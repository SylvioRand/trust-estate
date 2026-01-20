import { prisma } from '../../config/prisma';
import { PropertyListing, GetMineListingsQuery, SearchListingsQuery, UpdateListingData, ArchiveListingData, ReportListing } from "./listing.schema";
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

      const listingFeatures = await tx.listingFeatures.create({
        data: {
          listingId: listing.id,
          bedrooms: validatedData.features.bedrooms,
          bathrooms: validatedData.features.bathrooms,
          wc: validatedData.features.wc,
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

      return { listing, listingFeatures };
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

  static async searchListings(query: SearchListingsQuery) {
    const where: any = {
      status: 'active',
      isAvailable: true
    };

    if (query.type) where.type = query.type;
    if (query.propertyType) where.propertyType = query.propertyType;
    if (query.zone) where.zone = query.zone;

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = query.minPrice;
      if (query.maxPrice) where.price.lte = query.maxPrice;
    }

    if (query.minSurface || query.maxSurface) {
      where.surface = {};
      if (query.minSurface) where.surface.gte = query.minSurface;
      if (query.maxSurface) where.surface.lte = query.maxSurface;
    }

    const [listings, countMatching] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { features: true }
      }),
      prisma.listing.count({ where })
    ]);

    return { listings, countMatching };
  }

  static async updateListing(id: string, sellerId: string, data: UpdateListingData) {
    const listing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!listing) throw new Error('listing.not_found');
    if (listing.sellerId !== sellerId) throw new Error('forbidden');

    const result = await prisma.listing.update({
      where: { id },
      data: {
        type: data.type,
        propertyType: data.propertyType,
        title: data.title,
        description: data.description,
        price: data.price,
        surface: data.surface,
        zone: data.zone,
        tags: data.tags,
        features: data.features ? {
          update: data.features
        } : undefined
      },
      include: {
        features: true
      }
    });

    const { features, ...listings } = result;
    console.log("features = ", features);
    console.log("listings = ", listings);
    return { listing, features };
  }

  static async archiveListing(id: string, sellerId: string, data: ArchiveListingData) {
    // 1. Vérification propriété
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) throw new Error('listing.not_found');
    if (listing.sellerId !== sellerId) throw new Error('forbidden');
    if (listing.status === 'archived') throw new Error('listing.already_archived');

    return await prisma.$transaction(async (tx) => {
      const now = new Date();

      const archivedListing = await tx.listing.update({
        where: { id },
        data: {
          status: 'archived',
          isAvailable: false,
          soldAt: data.sold ? now : null
        }
      });

      const statsUpdate: any = {
        activeListings: { decrement: 1 }
      };

      if (data.sold) {
        if (listing.type === 'sale') statsUpdate.successfulSales = { increment: 1 };
        else statsUpdate.successfulRents = { increment: 1 };
      }

      await tx.sellerStats.update({
        where: { userId: sellerId },
        data: statsUpdate
      });

      return archivedListing;
    });
  }

  static async reportListing(id: string, reporterId: string, data: ReportListing) {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) throw new Error('listing.not_found');

    if (listing.sellerId === reporterId) throw new Error('listing.cannot_report_own');
    try {
      return await prisma.report.create({
        data: {
          listingId: id,
          reporterId: reporterId,
          reason: data.reason,
          comment: data.comment
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('listing.already_reported');
      }
      throw error;
    }
  }

  static async getSellerStats(userId: string) {
    return await prisma.sellerStats.findUnique({
      where: { userId }
    });
  }

  static async getOne(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        features: true,
        stats: true
      }
    });

    if (!listing) throw new Error('listing.not_found');

    const sellerStats = await prisma.sellerStats.findUnique({
      where: { userId: listing.sellerId }
    });

    return { listing, sellerStats };
  }

  static async deleteUserData(userId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.report.deleteMany({
        where: { reporterId: userId }
      });

      await tx.listing.deleteMany({
        where: { sellerId: userId }
      });

      await tx.sellerStats.deleteMany({
        where: { userId }
      });
    });
  }
}
