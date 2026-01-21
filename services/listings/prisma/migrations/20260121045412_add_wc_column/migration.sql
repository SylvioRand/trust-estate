-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('fraud', 'duplicate', 'spam', 'incorrect_info', 'inappropriate', 'other');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('block_temporary', 'archive_permanent', 'request_clarification', 'reject_reports');

-- AlterTable
ALTER TABLE "ListingFeatures" ADD COLUMN     "wc" BOOLEAN;

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "action" "ModerationActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "internalNote" TEXT,
    "messageToSeller" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_listingId_reporterId_key" ON "Report"("listingId", "reporterId");

-- CreateIndex
CREATE INDEX "ModerationAction_listingId_idx" ON "ModerationAction"("listingId");

-- CreateIndex
CREATE INDEX "ModerationAction_moderatorId_idx" ON "ModerationAction"("moderatorId");

-- CreateIndex
CREATE INDEX "ListingAvailability_listingId_idx" ON "ListingAvailability"("listingId");

-- CreateIndex
CREATE INDEX "ListingAvailability_dayOfWeek_idx" ON "ListingAvailability"("dayOfWeek");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
