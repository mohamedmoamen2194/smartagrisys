/*
  Warnings:

  - You are about to drop the `disease_detections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fruit_sizing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- DropTable
DROP TABLE "disease_detections";

-- DropTable
DROP TABLE "fruit_sizing";

-- DropTable
DROP TABLE "images";

-- DropEnum
DROP TYPE "ImageType";

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "pickupAddress" JSONB NOT NULL,
    "deliveryAddress" JSONB NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);
