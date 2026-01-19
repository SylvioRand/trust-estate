-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('sale', 'rent');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('apartment', 'house', 'loft', 'land', 'commercial');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('active', 'blocked', 'archived');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('none', 'garage', 'box', 'parking');

-- CreateEnum
CREATE TYPE "MarketingTag" AS ENUM ('urgent', 'exclusive', 'discount');

-- CreateTable
CREATE TABLE "SellerStats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "totalListings" INTEGER NOT NULL DEFAULT 0,
    "activeListings" INTEGER NOT NULL DEFAULT 0,
    "successfulSales" INTEGER NOT NULL DEFAULT 0,
    "successfulRents" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "SellerStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "surface" DOUBLE PRECISION NOT NULL,
    "zone" TEXT NOT NULL,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" "MarketingTag"[] DEFAULT ARRAY[]::"MarketingTag"[],
    "status" "ListingStatus" NOT NULL DEFAULT 'active',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "soldAt" TIMESTAMP(3),
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingFeatures" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "wc_separate" BOOLEAN,
    "water_access" BOOLEAN,
    "electricity_access" BOOLEAN,
    "garden_private" BOOLEAN,
    "parking_type" "ParkingType" DEFAULT 'none',
    "pool" BOOLEAN,

    CONSTRAINT "ListingFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAvailability" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "ListingAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingStats" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "reservations" INTEGER NOT NULL DEFAULT 0,
    "feedbacks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ListingStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerStats_user_id_key" ON "SellerStats"("user_id");

-- CreateIndex
CREATE INDEX "SellerStats_averageRating_idx" ON "SellerStats"("averageRating");

-- CreateIndex
CREATE INDEX "SellerStats_successfulSales_idx" ON "SellerStats"("successfulSales");

-- CreateIndex
CREATE INDEX "SellerStats_responseRate_idx" ON "SellerStats"("responseRate");

-- CreateIndex
CREATE UNIQUE INDEX "ListingFeatures_listingId_key" ON "ListingFeatures"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingStats_listingId_key" ON "ListingStats"("listingId");

-- AddForeignKey
ALTER TABLE "ListingFeatures" ADD CONSTRAINT "ListingFeatures_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAvailability" ADD CONSTRAINT "ListingAvailability_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingStats" ADD CONSTRAINT "ListingStats_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
