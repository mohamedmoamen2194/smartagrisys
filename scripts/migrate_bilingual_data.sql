-- Migrate existing product data to bilingual fields
-- Copy existing name to nameEn and description to descriptionEn
UPDATE products 
SET "nameEn" = name 
WHERE "nameEn" IS NULL AND name IS NOT NULL;

UPDATE products 
SET "descriptionEn" = description 
WHERE "descriptionEn" IS NULL AND description IS NOT NULL;

