/*
  Warnings:

  - The values [recharge_bonus] on the enum `TransactionReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionReason_new" AS ENUM ('initial_bonus', 'recharge_pack', 'publish_listing', 'renew_listing', 'reserve_visit', 'refund_cancelled');
ALTER TABLE "CreditTransaction" ALTER COLUMN "reason" TYPE "TransactionReason_new" USING ("reason"::text::"TransactionReason_new");
ALTER TYPE "TransactionReason" RENAME TO "TransactionReason_old";
ALTER TYPE "TransactionReason_new" RENAME TO "TransactionReason";
DROP TYPE "credits"."TransactionReason_old";
COMMIT;
