/*
  Warnings:

  - You are about to drop the column `features` on the `PlanTier` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeIntentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subtitle` to the `HardwareProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HardwareProduct" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subtitle" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "stripeIntentId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "PlanTier" DROP COLUMN "features";

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeIntentId_key" ON "Order"("stripeIntentId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
