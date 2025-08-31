-- CreateTable
CREATE TABLE "public"."ContentQuality" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "communityGuidelinesScore" DOUBLE PRECISION NOT NULL,
    "communityGuidelinesFeedback" TEXT NOT NULL,
    "educationScore" DOUBLE PRECISION NOT NULL,
    "educationFeedback" TEXT NOT NULL,
    "deliveryScore" DOUBLE PRECISION NOT NULL,
    "deliveryFeedback" TEXT NOT NULL,
    "audioVisualScore" DOUBLE PRECISION NOT NULL,
    "audioVisualFeedback" TEXT NOT NULL,

    CONSTRAINT "ContentQuality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentQuality_contentId_key" ON "public"."ContentQuality"("contentId");

-- AddForeignKey
ALTER TABLE "public"."ContentQuality" ADD CONSTRAINT "ContentQuality_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
