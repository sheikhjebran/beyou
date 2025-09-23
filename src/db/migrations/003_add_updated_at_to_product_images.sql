-- Migration: 003_add_updated_at_to_product_images
-- Created at: 2025-08-28
-- Description: Add updated_at column to product_images table

-- Note: This migration is now redundant as the initial schema (001) already includes the updated_at column
-- The product_images table was created with the updated_at column from the beginning
-- This migration is kept for historical consistency but performs no action

-- No-op migration - the column already exists in the initial schema
SELECT 'Migration 003: updated_at column already exists in initial schema - no action needed' as status;
