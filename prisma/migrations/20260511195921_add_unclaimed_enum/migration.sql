-- AlterEnum
ALTER TYPE "DeviceStatus" ADD VALUE 'UNCLAIMED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "trackingNumber" TEXT;

-- CreateTable
CREATE TABLE "PendingCart" (
    "id" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingCart_pkey" PRIMARY KEY ("id")
);
