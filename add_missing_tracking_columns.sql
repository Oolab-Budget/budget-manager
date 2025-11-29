-- Add missing columns for UPS tracking and backorders
-- Run this in your Supabase SQL Editor

-- Add missing columns to canada_tracking_shipments
ALTER TABLE canada_tracking_shipments 
ADD COLUMN IF NOT EXISTS ups_last_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ups_last_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ups_status_code TEXT,
ADD COLUMN IF NOT EXISTS ups_last_location TEXT;

-- Add missing columns to canada_backorders
ALTER TABLE canada_backorders 
ADD COLUMN IF NOT EXISTS item_id TEXT,
ADD COLUMN IF NOT EXISTS reason TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'canada_tracking_shipments' 
AND column_name LIKE 'ups_%'
ORDER BY column_name;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'canada_backorders' 
AND column_name IN ('item_id', 'reason')
ORDER BY column_name;


