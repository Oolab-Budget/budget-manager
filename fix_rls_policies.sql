-- Fix RLS Policies for Canada Tracking Shipments and Backorders
-- Run this in your Supabase SQL Editor if you're getting RLS policy errors

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert own tracking shipments" ON canada_tracking_shipments;
DROP POLICY IF EXISTS "Users can delete own tracking shipments" ON canada_tracking_shipments;
DROP POLICY IF EXISTS "Users can insert own backorders" ON canada_backorders;
DROP POLICY IF EXISTS "Users can delete own backorders" ON canada_backorders;

-- Recreate INSERT policy for tracking shipments
CREATE POLICY "Users can insert own tracking shipments" ON canada_tracking_shipments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_tracking_shipments.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

-- Recreate DELETE policy for tracking shipments
CREATE POLICY "Users can delete own tracking shipments" ON canada_tracking_shipments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_tracking_shipments.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

-- Recreate INSERT policy for backorders
CREATE POLICY "Users can insert own backorders" ON canada_backorders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_backorders.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

-- Recreate DELETE policy for backorders
CREATE POLICY "Users can delete own backorders" ON canada_backorders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_backorders.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

-- Verify policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('canada_tracking_shipments', 'canada_backorders')
ORDER BY tablename, policyname;

