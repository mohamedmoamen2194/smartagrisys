/*
  Warnings:

  - You are about to drop the `crop_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `farm_zones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `farmers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('SOIL_MOISTURE', 'TEMPERATURE', 'HUMIDITY', 'PH', 'LIGHT', 'RAINFALL');

-- DropTable
DROP TABLE "crop_plans";

-- DropTable
DROP TABLE "farm_zones";

-- DropTable
DROP TABLE "farmers";

-- CreateTable
CREATE TABLE "sensors" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "type" "SensorType" NOT NULL,
    "name" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "lastReading" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "sensors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
