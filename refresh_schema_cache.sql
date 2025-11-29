-- Refresh Supabase Schema Cache
-- Run this in your Supabase SQL Editor after adding new columns
-- This forces PostgREST to refresh its schema cache

-- Method 1: Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Method 2: Query the table to force cache refresh
SELECT * FROM budget_items LIMIT 1;

-- Method 3: Check if columns exist (this also helps refresh cache)
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'budget_items' 
AND column_name IN ('weekly_added_week', 'monthly_added_month', 'monthly_added_year');

-- If the columns don't appear, run the ALTER TABLE again:
-- ALTER TABLE budget_items 
-- ADD COLUMN IF NOT EXISTS weekly_added_week TIMESTAMPTZ,
-- ADD COLUMN IF NOT EXISTS monthly_added_month INTEGER,
-- ADD COLUMN IF NOT EXISTS monthly_added_year INTEGER;



