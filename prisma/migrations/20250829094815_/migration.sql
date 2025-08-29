/*
  Warnings:

  - You are about to drop the column `userId` on the `FraudLog` table. All the data in the column will be lost.
  - Added the required column `giftId` to the `FraudLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."FraudLog" DROP CONSTRAINT "FraudLog_userId_fkey";

-- AlterTable
ALTER TABLE "public"."FraudLog" DROP COLUMN "userId",
ADD COLUMN     "giftId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."FraudLog" ADD CONSTRAINT "FraudLog_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "public"."Gift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
