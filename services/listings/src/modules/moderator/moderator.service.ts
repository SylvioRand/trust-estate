import { prisma } from '../../config/prisma';
import { FlaggedListingsQuery, ModerationActionData, ModerationActionsQuery } from './moderator.schema';
import { ReportReason } from '@prisma/client';
import { AuthClient } from '../../infrastructure/auth.client';

export class ModeratorServices {
  static async getFlagged(query: FlaggedListingsQuery) {
    const { page, limit, reportReason } = query;
    const skip = (page - 1) * limit;

    const whereClause = {
      reports: {
        some: reportReason ? { reason: reportReason as ReportReason }
          : {}
      }
    };

    const [totalMatching, listings] = await prisma.$transaction([
      prisma.listing.count({ where: whereClause }),
      prisma.listing.findMany({
        where: whereClause,
        include: {
          reports: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { reports: true }
          }
        },
        skip,
        take: limit,
      })
    ]);

    const totalPages = Math.ceil(totalMatching / limit);

    const data = await Promise.all(listings.map(async (listing) => {
      const latestReport = listing.reports[0];

      const sellerDetails = await AuthClient.getUserDetails(listing.sellerId);

      return {
        listingId: listing.id,
        title: listing.title,
        reportCount: listing._count.reports,
        latestReportReason: latestReport?.reason || null,
        comment: latestReport?.comment || null,
        seller: {
          id: listing.sellerId,
          name: sellerDetails ? `${sellerDetails.firstName} ${sellerDetails.lastName}` : null,
          email: sellerDetails?.email || null,
        },
        flaggedAt: latestReport?.createdAt || null,
      };
    }));

    data.sort((a, b) => {
      const dateA = a.flaggedAt ? new Date(a.flaggedAt).getTime() : 0;
      const dateB = b.flaggedAt ? new Date(b.flaggedAt).getTime() : 0;
      return dateB - dateA;
    });

    return {
      data,
      pagination: {
        page,
        limit,
        totalMatching,
        totalPages
      }
    }
  }

  static async getListingPost(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        reports: true,
        moderationActions: true
      }
    });
    if (!listing) {
      throw new Error('listing.not_found');
    }
    const sellerDetails = await AuthClient.getUserDetails(listing.sellerId);
    return {
      listing: {
        id: listing?.id,
        title: listing?.title,
        description: listing?.description,
        price: listing?.price,
        status: listing?.status,
        createdAT: listing?.createdAt
      },
      seller: {
        id: sellerDetails?.id,
        firstName: sellerDetails?.firstName,
        lastName: sellerDetails?.lastName,
        email: sellerDetails?.email,
        phone: sellerDetails?.phone,
        memberSince: sellerDetails?.createdAt,
      },
      reports: listing.reports.map((report) => ({
        id: report.id,
        reportedId: report.reporterId,
        reason: report.reason,
        comment: report.comment,
        createdAt: report.createdAt,
      })),
      moderationHistory: listing.moderationActions.map((action) => ({
        action: action.action,
        reason: action.reason,
        date: action.createdAt
      }))
    };
  }

  static async applyModeratorAction(id: string, moderatorId: string, data: ModerationActionData) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { reports: true }
    });

    if (!listing) {
      throw new Error('listing.not_found');
    }

    let newStatus = listing.status;

    switch (data.action) {
      case 'block_temporary':
        newStatus = 'blocked';
        break;
      case 'archive_permanent':
        newStatus = 'archived';
        break;
      case 'reject_reports':
        newStatus = 'active';
        break;
      case 'request_clarification':
        newStatus = 'active';
        break;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer l'action de modération
      const moderation = await tx.moderationAction.create({
        data: {
          listingId: id,
          moderatorId,
          action: data.action,
          reason: data.reason,
          internalNote: data.internalNote,
          messageToSeller: data.messageToSeller
        }
      });

      await tx.listing.update({
        where: { id },
        data: { status: newStatus }
      });

      if (data.action === 'reject_reports') {
        await tx.report.deleteMany({
          where: { listingId: id }
        });
      }

      return {
        success: true,
        actionId: moderation.id,
        newStatus,
        message: "moderator.action_applied_successfully"
      };
    });

    return result;
  }

  static async getModerationActions(query: ModerationActionsQuery) {
    const { moderator, targetId, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (moderator) where.moderatorId = moderator;
    if (targetId) where.listingId = targetId;

    const [actions, total] = await Promise.all([
      prisma.moderationAction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.moderationAction.count({ where })
    ]);

    return {
      data: actions.map(action => ({
        id: action.id,
        moderatorId: action.moderatorId,
        targetType: "listing",
        targetId: action.listingId,
        action: action.action,
        reason: action.reason,
        appliedAt: action.createdAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        totalMatching: total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

}
