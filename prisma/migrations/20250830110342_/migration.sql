/*
  Warnings:

  - You are about to drop the `FraudLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FraudLog" DROP CONSTRAINT "FraudLog_giftId_fkey";

-- AlterTable
ALTER TABLE "public"."AuditLog" ADD COLUMN     "giftId" TEXT;

-- DropTable
DROP TABLE "public"."FraudLog";

-- DropEnum
DROP TYPE "public"."FraudType";

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "public"."Gift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
