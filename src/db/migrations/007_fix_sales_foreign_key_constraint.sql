-- Migration: 007_fix_sales_foreign_key_constraint
-- Created at: 2025-09-13
-- Description: Fix foreign key constraint in sales table to allow product deletion

USE beyou_db;

-- Check if the foreign key exists and drop it if it does
SET @fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_NAME = 'sales_ibfk_1'
    AND TABLE_NAME = 'sales'
    AND CONSTRAINT_SCHEMA = DATABASE()
);

-- Only drop the foreign key if it exists
SET @drop_fk_query = IF(@fk_exists > 0, 'ALTER TABLE sales DROP FOREIGN KEY sales_ibfk_1;', 'SELECT "No foreign key to drop";');
PREPARE stmt FROM @drop_fk_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- First, modify the product_id column to allow NULL values
ALTER TABLE sales MODIFY COLUMN product_id VARCHAR(36) NULL;

-- Clean up orphaned sales records (set product_id to NULL where the referenced product doesn't exist)
UPDATE sales 
SET product_id = NULL 
WHERE product_id IS NOT NULL 
  AND product_id NOT IN (SELECT id FROM products);

-- Add the foreign key constraint with ON DELETE SET NULL
ALTER TABLE sales ADD CONSTRAINT sales_product_fk 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Note: Using SET NULL instead of CASCADE to preserve sales history
-- The product_id will become NULL when a product is deleted
-- This maintains sales records for reporting while allowing product deletion