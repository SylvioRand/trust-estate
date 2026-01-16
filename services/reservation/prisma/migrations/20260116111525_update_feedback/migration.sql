/*
  Warnings:

  - Made the column `authorId` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "authorId" SET NOT NULL,
ALTER COLUMN "listingId" DROP NOT NULL;
