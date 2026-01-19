/*
  Warnings:

  - The primary key for the `Feedback` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createAt` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `feedbackId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Feedback` table. All the data in the column will be lost.
  - The `moderatedAt` column on the `Feedback` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[reservationId]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Feedback` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `listingId` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Made the column `visible` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Categories" DROP CONSTRAINT "Categories_feedbackId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_pkey",
DROP COLUMN "createAt",
DROP COLUMN "feedbackId",
DROP COLUMN "updateAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "listingAccurate" BOOLEAN,
ADD COLUMN     "listingId" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL,
ADD COLUMN     "sellerReactive" BOOLEAN,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "visitUseful" BOOLEAN,
ALTER COLUMN "visible" SET NOT NULL,
ALTER COLUMN "visible" SET DEFAULT true,
DROP COLUMN "moderatedAt",
ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_reservationId_key" ON "Feedback"("reservationId");

-- CreateIndex
CREATE INDEX "Feedback_listingId_idx" ON "Feedback"("listingId");

-- CreateIndex
CREATE INDEX "Feedback_targetId_idx" ON "Feedback"("targetId");

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("reservationId") ON DELETE RESTRICT ON UPDATE CASCADE;
