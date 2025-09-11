-- Migration: 002_add_is_best_seller
-- Created at: 2025-08-28
-- Description: Add is_best_seller column to products table

-- Note: This migration is now redundant as the initial schema (001) already includes the is_best_seller column
-- The products table was created with the is_best_seller column from the beginning
-- This migration is kept for historical consistency but performs no action

-- No-op migration - the column already exists in the initial schema
SELECT 'Migration 002: is_best_seller column already exists in initial schema - no action needed' as status;
