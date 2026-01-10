-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled', 'done');

-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('buyer', 'seller', 'system');

-- CreateTable
CREATE TABLE "reservations" (
    "reservationId" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'pending',
    "slot" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by" "CancelledBy",
    "done_at" TIMESTAMP(3),
    "feedback_eligible" BOOLEAN NOT NULL DEFAULT false,
    "feedback_given" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("reservationId")
);

-- CreateIndex
CREATE INDEX "reservations_listing_id_idx" ON "reservations"("listing_id");

-- CreateIndex
CREATE INDEX "reservations_buyer_id_idx" ON "reservations"("buyer_id");

-- CreateIndex
CREATE INDEX "reservations_seller_id_idx" ON "reservations"("seller_id");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "reservations_slot_idx" ON "reservations"("slot");
