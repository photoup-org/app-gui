-- AlterTable
ALTER TABLE "PlanTier" ADD COLUMN     "dataRetentionMonths" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "maxUsers" INTEGER,
ADD COLUMN     "uiFeatureMatrix" JSONB;
