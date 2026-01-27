import { ListingAvailability } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { PropertyListing, GetMineListingsQuery, SearchListingsQuery, UpdateListingData, ArchiveListingData, ReportListing, UpdateavailabilityType, getAvailabilityParams } from "./listing.schema";
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

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.minSurface !== undefined || query.maxSurface !== undefined) {
      where.surface = {};
      if (query.minSurface !== undefined) where.surface.gte = query.minSurface;
      if (query.maxSurface !== undefined) where.surface.lte = query.maxSurface;
    }

    // Features filters
    const features: any = {};

    if (query.minBedRoom !== undefined || query.maxBedRoom !== undefined) {
      features.bedrooms = {};
      if (query.minBedRoom !== undefined) features.bedrooms.gte = query.minBedRoom;
      if (query.maxBedRoom !== undefined) features.bedrooms.lte = query.maxBedRoom;
    }

    if (query.minBathRoom !== undefined || query.maxBathRoom !== undefined) {
      features.bathrooms = {};
      if (query.minBathRoom !== undefined) features.bathrooms.gte = query.minBathRoom;
      if (query.maxBathRoom !== undefined) features.bathrooms.lte = query.maxBathRoom;
    }

    if (query.parkingType && query.parkingType.length > 0) {
      features.parking_type = {
        in: query.parkingType
      };
    }
    if (query.waterAccess !== undefined) features.water_access = query.waterAccess;
    if (query.electricityAccess !== undefined) features.electricity_access = query.electricityAccess;
    if (query.pool !== undefined) features.pool = query.pool;
    if (query.gardenPrivate !== undefined) features.garden_private = query.gardenPrivate;

    if (Object.keys(features).length > 0) {
      where.features = features;
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = {
        hasSome: query.tags
      };
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

    const { features, ...updatedListing } = result;
    return { listing: updatedListing, features };
  }

  static async archiveListing(id: string, sellerId: string, data: ArchiveListingData) {
    // 1. Vérification propriété
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) throw new Error('listing.not_found');
    if (listing.status === 'archived') throw new Error('listing.already_archived');

    return await prisma.$transaction(async (tx) => {
      const now = new Date();

      const archivedListing = await tx.listing.update({
        where: { id },
        data: {
          status: 'archived',
          isAvailable: false,
        },
      });


      const statsUpdate: any = {
        activeListings: { decrement: 1 }
      };

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

  static async incrementViews(id: string) {
    await prisma.listingStats.updateMany({
      where: { listingId: id },
      data: {
        views: { increment: 1 }
      }
    });
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

  static async updateAvailability(listingId: string, sellerId: string, schedule: UpdateavailabilityType) {
    await prisma.listing.findUnique({ where: { id: listingId } }).then(listing => {
      if (!listing) throw new Error('listing.not_found');
      if (listing.sellerId !== sellerId) throw new Error('forbidden');
    });

    return await prisma.listing.update({
      where: { id: listingId },
      data: {
        availability: {
          deleteMany: {},
          create: schedule.weeklySchedule.map(slot => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime
          }))
        }
      }
    });
  }

  static async makeAvailable(listingId: string, sellerId: string) {
    await prisma.listing.findUnique({ where: { id: listingId } }).then(listing => {
      if (!listing) throw new Error('listing.not_found');
      if (listing.sellerId !== sellerId) throw new Error('forbidden');
    });

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.listing.update({
        where: { id: listingId },
        data: {
          isAvailable: true,
          status: 'active',
          soldAt: null
        },
        include: {
          features: true
        }
      });

      await tx.sellerStats.update({
        where: { userId: sellerId },
        data: {
          activeListings: { increment: 1 }
        }
      });

      const { features, ...updatedListing } = updated;
      return { listing: updatedListing, features };
    });
  }

  static async markAsRealized(listingId: string, sellerId: string) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });

    if (!listing) throw new Error('listing.not_found');
    if (listing.sellerId !== sellerId) throw new Error('forbidden');
    if (listing.status === 'archived' || !listing.isAvailable) throw new Error('listing.already_completed');

    return await prisma.$transaction(async (tx) => {
      // 1. Marquer l'annonce comme vendue/louée et non disponible
      const updated = await tx.listing.update({
        where: { id: listingId },
        data: {
          isAvailable: false,
          status: 'archived',
          soldAt: new Date(),
        }
      });

      // 2. Mettre à jour les compteurs du vendeur
      await tx.sellerStats.update({
        where: { userId: sellerId },
        data: {
          activeListings: { decrement: 1 },
          successfulSales: listing.type === 'sale' ? { increment: 1 } : undefined,
          successfulRents: listing.type === 'rent' ? { increment: 1 } : undefined,
        }
      });

      return (updated);
    });
  }


  static async getAvailability(listingId: getAvailabilityParams) {
    const listing = await prisma.listing.findUnique({
      where: listingId,
      include: {
        availability: true
      }
    });

    if (!listing) {
      throw new Error('listing.not_found');
    }

    return listing;
  }


  static async incrementReservationStat(listingId: string) {
    const stats = await prisma.listingStats.findUnique({
      where: { listingId }
    });

    if (!stats) {
      throw new Error('listing.stats_not_found');
    }
    await prisma.listingStats.update({
      where: { listingId: listingId },
      data: { reservations: { increment: 1 } }
    })
  }
}
