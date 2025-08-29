/*
  Warnings:

  - You are about to alter the column `commentCount` on the `Content` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `likes` on the `Content` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `shares` on the `Content` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to drop the column `reputation` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."EngagementType" AS ENUM ('LIKE', 'COMMENT', 'SHARE');

-- AlterTable
ALTER TABLE "public"."Content" ADD COLUMN     "url" TEXT,
ALTER COLUMN "commentCount" SET DATA TYPE INTEGER,
ALTER COLUMN "likes" SET DATA TYPE INTEGER,
ALTER COLUMN "shares" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "reputation";

-- CreateTable
CREATE TABLE "public"."Engagement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "type" "public"."EngagementType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_userId_contentId_type_key" ON "public"."Engagement"("userId", "contentId", "type");
