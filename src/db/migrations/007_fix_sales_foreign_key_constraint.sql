-- Migration: 007_fix_sales_foreign_key_constraint
-- Created at: 2025-09-13
-- Description: Fix foreign key constraint in sales table to allow product deletion

USE beyou_db;

-- Drop the existing foreign key constraint
ALTER TABLE sales DROP FOREIGN KEY sales_ibfk_1;

-- Add the foreign key constraint with CASCADE DELETE
-- This allows products to be deleted even if they have sales records
-- The sales records will be preserved for historical data
ALTER TABLE sales ADD CONSTRAINT sales_product_fk 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Note: Using SET NULL instead of CASCADE to preserve sales history
-- The product_id will become NULL when a product is deleted
-- This maintains sales records for reporting while allowing product deletion