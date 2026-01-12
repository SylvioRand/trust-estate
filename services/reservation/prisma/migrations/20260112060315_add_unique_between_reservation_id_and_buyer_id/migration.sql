/*
  Warnings:

  - A unique constraint covering the columns `[reservationId,buyer_id]` on the table `reservations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reservations_reservationId_buyer_id_key" ON "reservations"("reservationId", "buyer_id");
