/*
  Warnings:

  - You are about to drop the `alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sensor_readings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sensors` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('PRODUCT', 'DISEASE_DETECTION', 'FRUIT_SIZING', 'FARM', 'PROFILE');

-- DropForeignKey
ALTER TABLE "sensor_readings" DROP CONSTRAINT "sensor_readings_sensorId_fkey";

-- DropTable
DROP TABLE "alerts";

-- DropTable
DROP TABLE "sensor_readings";

-- DropTable
DROP TABLE "sensors";

-- DropEnum
DROP TYPE "SensorType";

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ImageType" NOT NULL,
    "metadata" JSONB NOT NULL,
    "farmerId" TEXT,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disease_detections" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disease_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fruit_sizing" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "measurements" JSONB NOT NULL,
    "grade" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fruit_sizing_pkey" PRIMARY KEY ("id")
);
