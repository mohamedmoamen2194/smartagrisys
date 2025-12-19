-- Migration: Add bilingual fields to Product table
-- This migration adds nameEn, nameAr, descriptionEn, descriptionAr fields to support bilingual product names and descriptions

-- Add new columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "nameEn" TEXT,
ADD COLUMN IF NOT EXISTS "nameAr" TEXT,
ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT,
ADD COLUMN IF NOT EXISTS "descriptionAr" TEXT;

-- Migrate existing data: copy name to nameEn and description to descriptionEn
UPDATE products 
SET "nameEn" = name 
WHERE "nameEn" IS NULL;

UPDATE products 
SET "descriptionEn" = description 
WHERE "descriptionEn" IS NULL AND description IS NOT NULL;

-- Make nameEn NOT NULL after migration (optional, can be kept nullable for flexibility)
-- ALTER TABLE products ALTER COLUMN "nameEn" SET NOT NULL;

