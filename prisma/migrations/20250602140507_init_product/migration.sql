/*
  Warnings:

  - You are about to drop the `cart_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `carts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cartId_fkey";

-- DropTable
DROP TABLE "cart_items";

-- DropTable
DROP TABLE "carts";

-- DropTable
DROP TABLE "customers";

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "farmerId" TEXT NOT NULL,
    "imageIds" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "minThreshold" INTEGER NOT NULL DEFAULT 10,
    "maxThreshold" INTEGER NOT NULL DEFAULT 100,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
