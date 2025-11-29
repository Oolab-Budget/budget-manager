-- Add missing columns for recurring items tracking
-- Run this in your Supabase SQL Editor

ALTER TABLE budget_items 
ADD COLUMN IF NOT EXISTS weekly_added_week TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS monthly_added_month INTEGER,
ADD COLUMN IF NOT EXISTS monthly_added_year INTEGER;


