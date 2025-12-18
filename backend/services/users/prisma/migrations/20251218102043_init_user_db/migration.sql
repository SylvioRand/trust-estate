-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalListings" INTEGER NOT NULL DEFAULT 0,
    "activeListings" INTEGER NOT NULL DEFAULT 0,
    "successfulSales" INTEGER NOT NULL DEFAULT 0,
    "successfulRents" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "SellerStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "SellerStats_userId_key" ON "SellerStats"("userId");

-- CreateIndex
CREATE INDEX "SellerStats_averageRating_idx" ON "SellerStats"("averageRating");

-- CreateIndex
CREATE INDEX "SellerStats_successfulSales_idx" ON "SellerStats"("successfulSales");

-- CreateIndex
CREATE INDEX "SellerStats_responseRate_idx" ON "SellerStats"("responseRate");

-- AddForeignKey
ALTER TABLE "SellerStats" ADD CONSTRAINT "SellerStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
