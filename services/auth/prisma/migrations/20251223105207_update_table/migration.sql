/*
  Warnings:

  - You are about to drop the column `credit` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `email_Verification_token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "credit",
ADD COLUMN     "creditBalance" INTEGER NOT NULL DEFAULT 10;

-- CreateIndex
CREATE UNIQUE INDEX "email_Verification_token_tokenHash_key" ON "email_Verification_token"("tokenHash");
