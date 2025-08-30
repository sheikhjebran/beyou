-- Migration: 003_add_updated_at_to_product_images
-- Created at: 2025-08-28
-- Description: Add updated_at column to product_images table

USE beyou_db;

-- Add updated_at column to product_images table
ALTER TABLE product_images
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
