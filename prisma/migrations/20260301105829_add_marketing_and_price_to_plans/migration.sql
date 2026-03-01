/*
  Warnings:

  - You are about to drop the column `stripePlanPriceId` on the `PlanTier` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeProductId]` on the table `PlanTier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PlanTier_stripePlanPriceId_key";

-- AlterTable
ALTER TABLE "PlanTier" DROP COLUMN "stripePlanPriceId",
ADD COLUMN     "stripeProductId" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "PlanTier_stripeProductId_key" ON "PlanTier"("stripeProductId");
