/*
  Warnings:

  - Added the required column `targetId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "targetId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_targetId_idx" ON "Feedback"("targetId");
