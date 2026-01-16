/*
  Warnings:

  - You are about to drop the column `targetId` on the `Feedback` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Feedback_targetId_idx";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "targetId",
ALTER COLUMN "authorId" DROP NOT NULL;
