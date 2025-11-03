-- CreateEnum
CREATE TYPE "FarmPartType" AS ENUM ('FIELD', 'GREENHOUSE', 'ORCHARD', 'PEN', 'OTHER');

-- CreateEnum
CREATE TYPE "InsightSeverity" AS ENUM ('INFO', 'WARN', 'CRITICAL');

-- CreateEnum
CREATE TYPE "InsightSource" AS ENUM ('AI', 'RULE');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "farmers" ADD COLUMN     "farmCountry" TEXT,
ADD COLUMN     "farmState" TEXT;

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "areaHa" DECIMAL(10,2),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_parts" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FarmPartType" NOT NULL DEFAULT 'FIELD',
    "geometry" JSONB NOT NULL,
    "soilType" TEXT,
    "irrigationType" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_sensors" (
    "id" TEXT NOT NULL,
    "farmPartId" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "position" JSONB,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "part_sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "farmPartId" TEXT NOT NULL,
    "modelKey" TEXT NOT NULL,
    "predictedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horizonMinutes" INTEGER,
    "payload" JSONB NOT NULL,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "farmPartId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" "InsightSeverity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "details" JSONB,
    "source" "InsightSource" NOT NULL DEFAULT 'AI',
    "tags" TEXT[],

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "part_sensors_farmPartId_sensorId_key" ON "part_sensors"("farmPartId", "sensorId");

-- CreateIndex
CREATE INDEX "predictions_farmPartId_predictedAt_idx" ON "predictions"("farmPartId", "predictedAt");

-- CreateIndex
CREATE INDEX "insights_farmPartId_generatedAt_idx" ON "insights"("farmPartId", "generatedAt");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_parts" ADD CONSTRAINT "farm_parts_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_sensors" ADD CONSTRAINT "part_sensors_farmPartId_fkey" FOREIGN KEY ("farmPartId") REFERENCES "farm_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_sensors" ADD CONSTRAINT "part_sensors_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "sensors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_farmPartId_fkey" FOREIGN KEY ("farmPartId") REFERENCES "farm_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_farmPartId_fkey" FOREIGN KEY ("farmPartId") REFERENCES "farm_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
