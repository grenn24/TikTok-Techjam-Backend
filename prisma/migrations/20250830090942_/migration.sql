/*
  Warnings:

  - You are about to drop the column `qualityScore` on the `Content` table. All the data in the column will be lost.
  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."AuditLogAction" AS ENUM ('SUSPICIOUS_GIFTING', 'SEND_GIFT', 'POTENTIAL_GAMING');

-- AlterTable
ALTER TABLE "public"."AuditLog" DROP COLUMN "action",
ADD COLUMN     "action" "public"."AuditLogAction" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Content" DROP COLUMN "qualityScore";

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
