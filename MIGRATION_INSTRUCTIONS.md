# Migration Instructions

## Bilingual Fields Migration

The database migration has been applied successfully. The following columns have been added to the `products` table:
- `nameEn` (TEXT)
- `nameAr` (TEXT)  
- `descriptionEn` (TEXT)
- `descriptionAr` (TEXT)

## Next Steps

1. **Stop your development server** (Ctrl+C)

2. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Migrate existing data (optional):**
   If you have existing products, you can copy their current `name` and `description` to the new bilingual fields:
   ```sql
   UPDATE products 
   SET "nameEn" = name 
   WHERE "nameEn" IS NULL AND name IS NOT NULL;

   UPDATE products 
   SET "descriptionEn" = description 
   WHERE "descriptionEn" IS NULL AND description IS NOT NULL;
   ```

4. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Notes

- The API code is backward compatible - it will use `nameEn` if available, otherwise fall back to `name`
- New products can be created with bilingual fields
- The inventory form now supports entering both English and Arabic names/descriptions

