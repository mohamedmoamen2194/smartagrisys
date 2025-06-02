/*
  Warnings:

  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropTable
DROP TABLE "order_items";

-- DropTable
DROP TABLE "orders";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateTable
CREATE TABLE "farmers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "farmName" TEXT NOT NULL,
    "description" TEXT,
    "location" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productIds" TEXT[],
    "sensorIds" TEXT[],
    "imageIds" TEXT[],
    "orderIds" TEXT[],

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_zones" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "cropType" TEXT,
    "sensorIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_plans" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "cropType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "farmers_userId_key" ON "farmers"("userId");
