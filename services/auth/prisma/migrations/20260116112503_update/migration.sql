/*
  Warnings:

  - You are about to drop the `SellerStats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SellerStats" DROP CONSTRAINT "SellerStats_userId_fkey";

-- DropTable
DROP TABLE "SellerStats";
