/*
  Warnings:

  - You are about to drop the column `fromId` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `toId` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `Reward` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[creatorId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `consumerId` to the `Gift` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Gift` table without a default value. This is not possible if the table is not empty.
  - Made the column `contentId` on table `Gift` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `amount` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Gift" DROP CONSTRAINT "Gift_contentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Gift" DROP CONSTRAINT "Gift_fromId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Gift" DROP CONSTRAINT "Gift_toId_fkey";

-- AlterTable
ALTER TABLE "public"."Gift" DROP COLUMN "fromId",
DROP COLUMN "toId",
ADD COLUMN     "consumerId" TEXT NOT NULL,
ADD COLUMN     "creatorId" TEXT NOT NULL,
ALTER COLUMN "contentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Reward" DROP COLUMN "points",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "reason" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reward_creatorId_key" ON "public"."Reward"("creatorId");

-- AddForeignKey
ALTER TABLE "public"."Gift" ADD CONSTRAINT "Gift_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gift" ADD CONSTRAINT "Gift_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gift" ADD CONSTRAINT "Gift_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
