-- Supabase Database Setup Script for Budget Manager
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Budget Items table
CREATE TABLE IF NOT EXISTS budget_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_es TEXT,
    description_en TEXT,
    description_es TEXT,
    category TEXT,
    pricing_type TEXT DEFAULT 'fixed',
    unit_price DECIMAL(10, 2),
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2),
    priority TEXT DEFAULT 'medium',
    approval_status TEXT DEFAULT 'pending',
    approval_reason TEXT,
    invoice_photo TEXT,
    invoice_file_name TEXT,
    invoice_file_type TEXT,
    receipt_amount DECIMAL(10, 2),
    notes TEXT,
    notes_en TEXT,
    notes_es TEXT,
    date_added TIMESTAMPTZ DEFAULT NOW(),
    recurring_weekly BOOLEAN DEFAULT FALSE,
    recurring_monthly BOOLEAN DEFAULT FALSE,
    monthly_day INTEGER,
    has_due_date BOOLEAN DEFAULT FALSE,
    due_date DATE,
    for_canada BOOLEAN DEFAULT FALSE,
    supplier_name TEXT,
    supplier_phone TEXT,
    supplier_email TEXT,
    supplier_address TEXT,
    price_adjustment_note TEXT,
    has_price_adjustment BOOLEAN DEFAULT FALSE,
    adjustment_applied BOOLEAN DEFAULT FALSE,
    weekly_added_week TIMESTAMPTZ,
    monthly_added_month INTEGER,
    monthly_added_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Budgets table
CREATE TABLE IF NOT EXISTS saved_budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    saved_date TIMESTAMPTZ DEFAULT NOW(),
    week_start TIMESTAMPTZ,
    week_label TEXT,
    total DECIMAL(10, 2),
    item_count INTEGER,
    approved_count INTEGER,
    pending_count INTEGER,
    language TEXT DEFAULT 'en',
    is_partial_payment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Budget Items (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS saved_budget_items (
    id BIGSERIAL PRIMARY KEY,
    saved_budget_id BIGINT REFERENCES saved_budgets(id) ON DELETE CASCADE,
    item_data JSONB NOT NULL, -- Stores the full item object
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Categories table
CREATE TABLE IF NOT EXISTS custom_categories (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_key TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_es TEXT,
    description_en TEXT,
    description_es TEXT,
    pricing_type TEXT DEFAULT 'fixed',
    recurring_weekly BOOLEAN DEFAULT FALSE,
    recurring_monthly BOOLEAN DEFAULT FALSE,
    monthly_day INTEGER,
    has_due_date BOOLEAN DEFAULT FALSE,
    due_date DATE,
    items JSONB, -- Array of category items
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_key)
);

-- Category Items (stored within categories JSONB, but we can also have a separate table if needed)
-- For now, items are stored in the items JSONB field of custom_categories

-- Activity Log table
CREATE TABLE IF NOT EXISTS activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT,
    item_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change History table
CREATE TABLE IF NOT EXISTS change_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    item_id BIGINT,
    item_name TEXT,
    old_value JSONB,
    new_value JSONB,
    field TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canada Request History table
CREATE TABLE IF NOT EXISTS canada_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_number INTEGER NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    sent_date TIMESTAMPTZ,
    received_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, request_number)
);

-- Canada Request Items table
CREATE TABLE IF NOT EXISTS canada_request_items (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT REFERENCES canada_requests(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_es TEXT,
    category TEXT,
    quantity INTEGER,
    unit TEXT DEFAULT 'sheet',
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canada Tracking Shipments table
CREATE TABLE IF NOT EXISTS canada_tracking_shipments (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT REFERENCES canada_requests(id) ON DELETE CASCADE,
    tracking_number TEXT NOT NULL,
    ups_status TEXT,
    ups_picked_up BOOLEAN DEFAULT FALSE,
    ups_in_transit BOOLEAN DEFAULT FALSE,
    ups_duties_paid BOOLEAN DEFAULT FALSE,
    ups_has_duties_due BOOLEAN DEFAULT FALSE,
    ups_duties_amount TEXT,
    ups_has_delay BOOLEAN DEFAULT FALSE,
    shipment_items JSONB, -- Array of item references
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canada Backorders table
CREATE TABLE IF NOT EXISTS canada_backorders (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT REFERENCES canada_requests(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_es TEXT,
    category TEXT,
    requested_qty INTEGER,
    sent_qty INTEGER,
    backorder_qty INTEGER,
    unit TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dismissed Backorders table
CREATE TABLE IF NOT EXISTS dismissed_backorders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL, -- Format: "nameEn_category"
    dismissed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_key)
);

-- Canada Request Counter (per user)
CREATE TABLE IF NOT EXISTS canada_request_counters (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    counter INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pushed Items table (for items pushed to next week)
CREATE TABLE IF NOT EXISTS pushed_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_data JSONB NOT NULL, -- Stores the full item object
    pushed_date TIMESTAMPTZ DEFAULT NOW(),
    target_week_start TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_date_added ON budget_items(date_added);
CREATE INDEX IF NOT EXISTS idx_saved_budgets_user_id ON saved_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_budgets_saved_date ON saved_budgets(saved_date);
CREATE INDEX IF NOT EXISTS idx_canada_requests_user_id ON canada_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_canada_requests_date ON canada_requests(date);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_change_history_user_id ON change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_categories_user_id ON custom_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_pushed_items_user_id ON pushed_items(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE canada_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE canada_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE canada_tracking_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE canada_backorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dismissed_backorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE canada_request_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pushed_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies: Users can only access their own data

-- Budget Items policies
CREATE POLICY "Users can view own budget items" ON budget_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget items" ON budget_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget items" ON budget_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget items" ON budget_items
    FOR DELETE USING (auth.uid() = user_id);

-- Saved Budgets policies
CREATE POLICY "Users can view own saved budgets" ON saved_budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved budgets" ON saved_budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved budgets" ON saved_budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved budgets" ON saved_budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Saved Budget Items policies
CREATE POLICY "Users can view own saved budget items" ON saved_budget_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM saved_budgets 
            WHERE saved_budgets.id = saved_budget_items.saved_budget_id 
            AND saved_budgets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own saved budget items" ON saved_budget_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM saved_budgets 
            WHERE saved_budgets.id = saved_budget_items.saved_budget_id 
            AND saved_budgets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own saved budget items" ON saved_budget_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM saved_budgets 
            WHERE saved_budgets.id = saved_budget_items.saved_budget_id 
            AND saved_budgets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own saved budget items" ON saved_budget_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM saved_budgets 
            WHERE saved_budgets.id = saved_budget_items.saved_budget_id 
            AND saved_budgets.user_id = auth.uid()
        )
    );

-- Custom Categories policies
CREATE POLICY "Users can view own categories" ON custom_categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON custom_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON custom_categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON custom_categories
    FOR DELETE USING (auth.uid() = user_id);

-- Activity Log policies
CREATE POLICY "Users can view own activity log" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity log" ON activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Change History policies
CREATE POLICY "Users can view own change history" ON change_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own change history" ON change_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Canada Requests policies
CREATE POLICY "Users can view own canada requests" ON canada_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own canada requests" ON canada_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canada requests" ON canada_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canada requests" ON canada_requests
    FOR DELETE USING (auth.uid() = user_id);

-- Canada Request Items policies
CREATE POLICY "Users can view own canada request items" ON canada_request_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_request_items.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own canada request items" ON canada_request_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_request_items.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

-- Canada Tracking Shipments policies
CREATE POLICY "Users can view own tracking shipments" ON canada_tracking_shipments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_tracking_shipments.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own tracking shipments" ON canada_tracking_shipments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_tracking_shipments.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own tracking shipments" ON canada_tracking_shipments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_tracking_shipments.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own tracking shipments" ON canada_tracking_shipments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_tracking_shipments.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

-- Canada Backorders policies
CREATE POLICY "Users can view own backorders" ON canada_backorders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_backorders.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own backorders" ON canada_backorders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_backorders.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own backorders" ON canada_backorders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_backorders.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

-- Dismissed Backorders policies
CREATE POLICY "Users can view own dismissed backorders" ON dismissed_backorders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dismissed backorders" ON dismissed_backorders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dismissed backorders" ON dismissed_backorders
    FOR DELETE USING (auth.uid() = user_id);

-- Canada Request Counters policies
CREATE POLICY "Users can view own request counter" ON canada_request_counters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own request counter" ON canada_request_counters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own request counter" ON canada_request_counters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pushed Items policies
CREATE POLICY "Users can view own pushed items" ON pushed_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pushed items" ON pushed_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pushed items" ON pushed_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pushed items" ON pushed_items
    FOR DELETE USING (auth.uid() = user_id);




