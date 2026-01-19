-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "listingAccurate" BOOLEAN NOT NULL,
    "sellerReactive" BOOLEAN NOT NULL,
    "visitUseful" BOOLEAN NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "feedbackId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "visible" BOOLEAN,
    "moderatedAt" TEXT,
    "moderationReason" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("feedbackId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categories_feedbackId_key" ON "Categories"("feedbackId");

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("feedbackId") ON DELETE CASCADE ON UPDATE CASCADE;
