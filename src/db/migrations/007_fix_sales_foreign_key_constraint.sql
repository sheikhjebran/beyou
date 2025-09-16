-- Migration: 007_fix_sales_foreign_key_constraint
-- Created at: 2025-09-13
-- Description: Fix foreign key constraint in sales table to allow product deletion

USE beyou_db;

-- Check if the foreign key exists before attempting to drop it
SET @fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_NAME = 'sales_ibfk_1'
    AND TABLE_NAME = 'sales'
    AND TABLE_SCHEMA = DATABASE()
);

IF @fk_exists THEN
  -- Drop the existing foreign key constraint
  ALTER TABLE sales DROP FOREIGN KEY sales_ibfk_1;
END IF;

-- Add the foreign key constraint with CASCADE DELETE
-- This allows products to be deleted even if they have sales records
-- The sales records will be preserved for historical data
ALTER TABLE sales ADD CONSTRAINT sales_product_fk 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Note: Using SET NULL instead of CASCADE to preserve sales history
-- The product_id will become NULL when a product is deleted
-- This maintains sales records for reporting while allowing product deletion