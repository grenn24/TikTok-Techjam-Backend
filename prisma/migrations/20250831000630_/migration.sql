/*
  Warnings:

  - Added the required column `lengthFeedback` to the `ContentQuality` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lengthScore` to the `ContentQuality` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ContentQuality" ADD COLUMN     "lengthFeedback" TEXT NOT NULL,
ADD COLUMN     "lengthScore" DOUBLE PRECISION NOT NULL;
