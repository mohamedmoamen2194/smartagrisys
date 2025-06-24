/*
  Warnings:

  - You are about to drop the column `reportId` on the `disease_detections` table. All the data in the column will be lost.
  - Added the required column `farmerId` to the `disease_detections` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "disease_detections_reportId_key";

-- AlterTable
ALTER TABLE "disease_detections" DROP COLUMN "reportId",
ADD COLUMN     "farmerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "disease_detections" ADD CONSTRAINT "disease_detections_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
