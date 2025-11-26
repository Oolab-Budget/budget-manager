# Supabase Migration Guide - Budget Manager

This guide will help you migrate your Budget Manager from localStorage to Supabase for multi-user support.

---

## Prerequisites

- ✅ Supabase account created
- ✅ Budget Manager `index.html` file
- ✅ Basic understanding of JavaScript and databases

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in
2. Click **"New Project"**
3. Fill in:
   - **Name:** Budget Manager (or your preferred name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

---

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon) → **API**
2. Copy and save these values (you'll need them):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key:** (keep this secret, only for server-side)

---

## Step 3: Install Supabase Client Library

Add this script tag to your `index.html` file, right after the EmailJS script (around line 13):

```html
<!-- Supabase client library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

## Step 4: Initialize Supabase Client

Add this code near the top of your JavaScript section (after line 1855, where you initialize variables):

```javascript
// Supabase initialization
const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE'; // Replace with your Project URL
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Replace with your anon key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check authentication status
let currentUser = null;
supabase.auth.getSession().then(({ data: { session } }) => {
    currentUser = session?.user || null;
    if (currentUser) {
        console.log('User logged in:', currentUser.email);
        loadUserData();
    } else {
        showLoginScreen();
    }
});

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    if (event === 'SIGNED_IN' && currentUser) {
        loadUserData();
    } else if (event === 'SIGNED_OUT') {
        showLoginScreen();
    }
});
```

**⚠️ Important:** Replace `YOUR_PROJECT_URL_HERE` and `YOUR_ANON_KEY_HERE` with your actual values from Step 2.

---

## Step 5: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste this SQL script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase handles this automatically, but we'll reference it)
-- The auth.users table is created automatically by Supabase

-- Budget Items table
CREATE TABLE budget_items (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Budgets table
CREATE TABLE saved_budgets (
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
CREATE TABLE saved_budget_items (
    id BIGSERIAL PRIMARY KEY,
    saved_budget_id BIGINT REFERENCES saved_budgets(id) ON DELETE CASCADE,
    item_data JSONB NOT NULL, -- Stores the full item object
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canada Request History table
CREATE TABLE canada_requests (
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
CREATE TABLE canada_request_items (
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
CREATE TABLE canada_tracking_shipments (
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
CREATE TABLE canada_backorders (
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
CREATE TABLE dismissed_backorders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL, -- Format: "nameEn_category"
    dismissed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_key)
);

-- Custom Categories table
CREATE TABLE custom_categories (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_key TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_es TEXT,
    pricing_type TEXT DEFAULT 'fixed',
    items JSONB, -- Array of category items
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_key)
);

-- Activity Log table
CREATE TABLE activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT,
    item_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change History table
CREATE TABLE change_history (
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

-- Canada Request Counter (per user)
CREATE TABLE canada_request_counters (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    counter INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX idx_budget_items_date_added ON budget_items(date_added);
CREATE INDEX idx_saved_budgets_user_id ON saved_budgets(user_id);
CREATE INDEX idx_canada_requests_user_id ON canada_requests(user_id);
CREATE INDEX idx_canada_requests_date ON canada_requests(date);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_change_history_user_id ON change_history(user_id);
```

4. Click **"Run"** to execute the SQL
5. Verify tables were created by going to **Table Editor** - you should see all the tables listed

---

## Step 6: Set Up Row Level Security (RLS)

RLS ensures users can only see/modify their own data. Run this SQL in the SQL Editor:

```sql
-- Enable RLS on all tables
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

-- Create policies: Users can only access their own data
CREATE POLICY "Users can view own budget items" ON budget_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget items" ON budget_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget items" ON budget_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget items" ON budget_items
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own saved budgets" ON saved_budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved budgets" ON saved_budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can view own canada requests" ON canada_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own canada requests" ON canada_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canada requests" ON canada_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canada requests" ON canada_requests
    FOR DELETE USING (auth.uid() = user_id);

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

CREATE POLICY "Users can view own tracking shipments" ON canada_tracking_shipments
    FOR SELECT USING (
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

CREATE POLICY "Users can view own backorders" ON canada_backorders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM canada_requests 
            WHERE canada_requests.id = canada_backorders.request_id 
            AND canada_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own dismissed backorders" ON dismissed_backorders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dismissed backorders" ON dismissed_backorders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dismissed backorders" ON dismissed_backorders
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own categories" ON custom_categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON custom_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON custom_categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON custom_categories
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity log" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity log" ON activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own change history" ON change_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own change history" ON change_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own request counter" ON canada_request_counters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own request counter" ON canada_request_counters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own request counter" ON canada_request_counters
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Step 7: Create Authentication UI

Add this HTML for the login screen. Add it right after the header section (around line 200, before the tab navigation):

```html
<!-- Login Screen (hidden by default) -->
<div id="loginScreen" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); z-index: 10000; display: flex; align-items: center; justify-content: center;">
    <div style="background: white; border-radius: 10px; padding: 40px; max-width: 400px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
        <h2 style="text-align: center; margin-bottom: 30px; color: #2c3e50;">Budget Manager</h2>
        <div id="loginForm">
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; color: #2c3e50; font-weight: 600;">Email</label>
                <input type="email" id="loginEmail" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;" placeholder="your@email.com">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; color: #2c3e50; font-weight: 600;">Password</label>
                <input type="password" id="loginPassword" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;" placeholder="••••••••">
            </div>
            <button onclick="handleLogin()" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px; margin-bottom: 15px;">Login</button>
            <button onclick="showSignupForm()" class="btn btn-secondary" style="width: 100%; padding: 12px; font-size: 16px;">Create Account</button>
            <div id="loginError" style="color: #e74c3c; margin-top: 15px; text-align: center; display: none;"></div>
        </div>
        <div id="signupForm" style="display: none;">
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; color: #2c3e50; font-weight: 600;">Email</label>
                <input type="email" id="signupEmail" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;" placeholder="your@email.com">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; color: #2c3e50; font-weight: 600;">Password</label>
                <input type="password" id="signupPassword" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;" placeholder="••••••••">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; color: #2c3e50; font-weight: 600;">Confirm Password</label>
                <input type="password" id="signupPasswordConfirm" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;" placeholder="••••••••">
            </div>
            <button onclick="handleSignup()" class="btn btn-success" style="width: 100%; padding: 12px; font-size: 16px; margin-bottom: 15px;">Create Account</button>
            <button onclick="showLoginForm()" class="btn btn-secondary" style="width: 100%; padding: 12px; font-size: 16px;">Back to Login</button>
            <div id="signupError" style="color: #e74c3c; margin-top: 15px; text-align: center; display: none;"></div>
        </div>
    </div>
</div>
```

---

## Step 8: Add Authentication Functions

Add these functions to your JavaScript section (after the Supabase initialization):

```javascript
// Authentication Functions
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
}

function hideLoginScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
}

function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    if (!email || !password) {
        errorDiv.textContent = 'Please enter email and password';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        currentUser = data.user;
        hideLoginScreen();
        await loadUserData();
    } catch (error) {
        errorDiv.textContent = error.message || 'Login failed';
        errorDiv.style.display = 'block';
    }
}

async function handleSignup() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const errorDiv = document.getElementById('signupError');

    if (!email || !password || !passwordConfirm) {
        errorDiv.textContent = 'Please fill in all fields';
        errorDiv.style.display = 'block';
        return;
    }

    if (password !== passwordConfirm) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) throw error;

        // Initialize request counter for new user
        await supabase.from('canada_request_counters').insert({
            user_id: data.user.id,
            counter: 0
        });

        errorDiv.style.color = '#27ae60';
        errorDiv.textContent = 'Account created! Please check your email to verify your account.';
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            showLoginForm();
        }, 3000);
    } catch (error) {
        errorDiv.textContent = error.message || 'Signup failed';
        errorDiv.style.display = 'block';
    }
}

function handleLogout() {
    supabase.auth.signOut();
    currentUser = null;
    items = [];
    saveItems(); // Clear local state
    showLoginScreen();
}

// Add logout button to header (optional)
// You can add this to your header HTML:
// <button onclick="handleLogout()" style="position: absolute; top: 20px; left: 20px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 20px; border-radius: 25px; cursor: pointer;">Logout</button>
```

---

## Step 9: Create Data Loading Function

Add this function to load user data when they log in:

```javascript
async function loadUserData() {
    if (!currentUser) return;

    try {
        // Load budget items
        const { data: budgetItems, error: itemsError } = await supabase
            .from('budget_items')
            .select('*')
            .order('date_added', { ascending: false });

        if (itemsError) throw itemsError;
        items = budgetItems.map(convertDbItemToAppItem);

        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('custom_categories')
            .select('*');

        if (categoriesError) throw categoriesError;
        
        // Convert categories to app format
        categories = {};
        categoriesData.forEach(cat => {
            categories[cat.category_key] = {
                nameEn: cat.name_en,
                nameEs: cat.name_es,
                pricingType: cat.pricing_type,
                items: cat.items || []
            };
        });

        // Load activity log
        const { data: activityData, error: activityError } = await supabase
            .from('activity_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (!activityError && activityData) {
            activityLog = activityData.map(convertDbActivityToApp);
        }

        // Load change history
        const { data: historyData, error: historyError } = await supabase
            .from('change_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (!historyError && historyData) {
            changeHistory = historyData.map(convertDbHistoryToApp);
        }

        // Render UI
        renderBudgetItems();
        loadCategoriesList();
        updateApprovalSummary();
        updateMonitorDashboard();
        refreshActivityLog();
        loadChangeHistory();
        loadCanadaHistory();
        updateCanadaRequestSummary();

    } catch (error) {
        console.error('Error loading user data:', error);
        showApprovalStatus('error', 'Failed to load data: ' + error.message);
    }
}

// Helper function to convert database item to app format
function convertDbItemToAppItem(dbItem) {
    return {
        id: dbItem.id,
        nameEn: dbItem.name_en,
        nameEs: dbItem.name_es,
        descriptionEn: dbItem.description_en,
        descriptionEs: dbItem.description_es,
        category: dbItem.category,
        pricingType: dbItem.pricing_type,
        unitPrice: parseFloat(dbItem.unit_price || 0),
        quantity: dbItem.quantity || 1,
        totalPrice: parseFloat(dbItem.total_price || 0),
        priority: dbItem.priority,
        approvalStatus: dbItem.approval_status,
        approvalReason: dbItem.approval_reason,
        invoicePhoto: dbItem.invoice_photo,
        receiptAmount: parseFloat(dbItem.receipt_amount || 0),
        notes: dbItem.notes,
        notesEn: dbItem.notes_en,
        notesEs: dbItem.notes_es,
        dateAdded: dbItem.date_added,
        recurringWeekly: dbItem.recurring_weekly,
        recurringMonthly: dbItem.recurring_monthly,
        monthlyDay: dbItem.monthly_day,
        hasDueDate: dbItem.has_due_date,
        dueDate: dbItem.due_date,
        forCanada: dbItem.for_canada,
        supplier: {
            name: dbItem.supplier_name || '',
            phone: dbItem.supplier_phone || '',
            email: dbItem.supplier_email || '',
            address: dbItem.supplier_address || ''
        }
    };
}

// Helper function to convert app item to database format
function convertAppItemToDbItem(appItem) {
    return {
        name_en: appItem.nameEn,
        name_es: appItem.nameEs,
        description_en: appItem.descriptionEn,
        description_es: appItem.descriptionEs,
        category: appItem.category,
        pricing_type: appItem.pricingType,
        unit_price: appItem.unitPrice,
        quantity: appItem.quantity || 1,
        total_price: appItem.totalPrice,
        priority: appItem.priority,
        approval_status: appItem.approvalStatus,
        approval_reason: appItem.approvalReason,
        invoice_photo: appItem.invoicePhoto,
        receipt_amount: appItem.receiptAmount,
        notes: appItem.notes,
        notes_en: appItem.notesEn,
        notes_es: appItem.notesEs,
        date_added: appItem.dateAdded || new Date().toISOString(),
        recurring_weekly: appItem.recurringWeekly || false,
        recurring_monthly: appItem.recurringMonthly || false,
        monthly_day: appItem.monthlyDay,
        has_due_date: appItem.hasDueDate || false,
        due_date: appItem.dueDate,
        for_canada: appItem.forCanada || false,
        supplier_name: appItem.supplier?.name || '',
        supplier_phone: appItem.supplier?.phone || '',
        supplier_email: appItem.supplier?.email || '',
        supplier_address: appItem.supplier?.address || ''
    };
}

function convertDbActivityToApp(dbActivity) {
    return {
        id: dbActivity.id,
        type: dbActivity.type,
        description: dbActivity.description,
        itemId: dbActivity.item_id,
        timestamp: dbActivity.created_at
    };
}

function convertDbHistoryToApp(dbHistory) {
    return {
        id: dbHistory.id,
        type: dbHistory.type,
        itemId: dbHistory.item_id,
        itemName: dbHistory.item_name,
        oldValue: dbHistory.old_value,
        newValue: dbHistory.new_value,
        field: dbHistory.field,
        timestamp: dbHistory.created_at
    };
}
```

---

## Step 10: Replace saveItems() Function

Replace your existing `saveItems()` function with this Supabase version:

```javascript
async function saveItems() {
    if (!currentUser) {
        console.error('No user logged in');
        return;
    }

    try {
        // Get all current items from database
        const { data: existingItems } = await supabase
            .from('budget_items')
            .select('id')
            .eq('user_id', currentUser.id);

        const existingIds = new Set(existingItems?.map(item => item.id) || []);
        const currentIds = new Set(items.map(item => item.id));

        // Delete items that are no longer in the current items array
        const toDelete = Array.from(existingIds).filter(id => !currentIds.has(id));
        if (toDelete.length > 0) {
            await supabase
                .from('budget_items')
                .delete()
                .in('id', toDelete);
        }

        // Upsert (insert or update) all current items
        for (const item of items) {
            const dbItem = convertAppItemToDbItem(item);
            
            if (item.id && existingIds.has(item.id)) {
                // Update existing
                await supabase
                    .from('budget_items')
                    .update(dbItem)
                    .eq('id', item.id)
                    .eq('user_id', currentUser.id);
            } else {
                // Insert new
                const { data, error } = await supabase
                    .from('budget_items')
                    .insert([dbItem])
                    .select()
                    .single();
                
                if (!error && data) {
                    // Update the item ID in the local array
                    item.id = data.id;
                }
            }
        }
    } catch (error) {
        console.error('Error saving items:', error);
        showApprovalStatus('error', 'Failed to save items: ' + error.message);
    }
}
```

---

## Step 11: Update addItem() Function

Modify your `addItem()` function to use Supabase. Find the function and update it to call `saveItems()` at the end (which now saves to Supabase):

```javascript
// In your addItem() function, after items.push(newItem), replace:
// saveItems(); // Old localStorage version

// With:
await saveItems(); // New Supabase version
```

Do the same for `editItem()`, `removeItem()`, and other functions that modify items.

---

## Step 12: Update Canada Request Functions

Update your Canada request functions. Here's an example for creating a request:

```javascript
async function createCanadaRequest() {
    if (!currentUser) {
        showApprovalStatus('error', 'Please log in to create requests');
        return;
    }

    // ... your existing code to collect request items ...

    try {
        // Get or create request counter
        let { data: counterData } = await supabase
            .from('canada_request_counters')
            .select('counter')
            .eq('user_id', currentUser.id)
            .single();

        if (!counterData) {
            // Initialize counter
            await supabase.from('canada_request_counters').insert({
                user_id: currentUser.id,
                counter: 0
            });
            counterData = { counter: 0 };
        }

        const requestNumber = counterData.counter;

        // Create request
        const { data: request, error: requestError } = await supabase
            .from('canada_requests')
            .insert([{
                user_id: currentUser.id,
                request_number: requestNumber,
                date: new Date().toISOString(),
                status: 'pending'
            }])
            .select()
            .single();

        if (requestError) throw requestError;

        // Insert request items
        const requestItems = requestItems.map(item => ({
            request_id: request.id,
            name_en: item.nameEn,
            name_es: item.nameEs,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit || 'sheet',
            unit_price: item.unitPrice,
            total_price: item.totalPrice
        }));

        await supabase.from('canada_request_items').insert(requestItems);

        // Increment counter
        await supabase
            .from('canada_request_counters')
            .update({ counter: requestNumber + 1 })
            .eq('user_id', currentUser.id);

        // Reload history
        await loadCanadaHistory();
        showApprovalStatus('success', 'Request created successfully');
    } catch (error) {
        console.error('Error creating request:', error);
        showApprovalStatus('error', 'Failed to create request: ' + error.message);
    }
}
```

---

## Step 13: Update Activity Logging

Replace your `logActivity()` function:

```javascript
async function logActivity(type, description, itemId = null) {
    if (!currentUser) return;

    try {
        await supabase.from('activity_log').insert([{
            user_id: currentUser.id,
            type: type,
            description: description,
            item_id: itemId
        }]);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}
```

Replace your `logChange()` function:

```javascript
async function logChange(type, itemId, itemName, oldValue = null, newValue = null, field = null) {
    if (!currentUser) return;

    try {
        await supabase.from('change_history').insert([{
            user_id: currentUser.id,
            type: type,
            item_id: itemId,
            item_name: itemName,
            old_value: oldValue,
            new_value: newValue,
            field: field
        }]);
    } catch (error) {
        console.error('Error logging change:', error);
    }
}
```

---

## Step 14: Update Saved Budgets

Update your `saveBudgetSnapshot()` function:

```javascript
async function saveBudgetSnapshot() {
    if (!currentUser) return;

    try {
        const now = new Date();
        const weekStart = getWeekStart(now);
        
        // Create saved budget record
        const { data: savedBudget, error: budgetError } = await supabase
            .from('saved_budgets')
            .insert([{
                user_id: currentUser.id,
                saved_date: now.toISOString(),
                week_start: weekStart.toISOString(),
                week_label: getWeekLabel(weekStart),
                total: items.reduce((sum, item) => sum + item.totalPrice, 0),
                item_count: items.length,
                approved_count: items.filter(item => item.approvalStatus === 'approved').length,
                pending_count: items.filter(item => !item.approvalStatus || item.approvalStatus === 'pending').length,
                language: currentLanguage
            }])
            .select()
            .single();

        if (budgetError) throw budgetError;

        // Save budget items
        const budgetItems = items.map(item => ({
            saved_budget_id: savedBudget.id,
            item_data: item
        }));

        await supabase.from('saved_budget_items').insert(budgetItems);

        showApprovalStatus('success', 'Budget saved successfully');
    } catch (error) {
        console.error('Error saving budget:', error);
        showApprovalStatus('error', 'Failed to save budget: ' + error.message);
    }
}
```

---

## Step 15: Testing Checklist

1. ✅ **Create test account** - Sign up with a test email
2. ✅ **Login** - Verify login works
3. ✅ **Add budget item** - Create a new item and verify it saves
4. ✅ **Edit item** - Modify an item and verify update
5. ✅ **Delete item** - Remove an item and verify deletion
6. ✅ **Create Canada request** - Test request creation
7. ✅ **View reports** - Verify reports load correctly
8. ✅ **Logout/Login** - Verify data persists after logout
9. ✅ **Multiple users** - Test with 2-3 different accounts to verify data isolation

---

## Step 16: Optional - Email Verification

By default, Supabase requires email verification. To disable it (for testing):

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle off **"Confirm email"**
3. Click **Save**

**⚠️ For production, keep email verification enabled for security.**

---

## Troubleshooting

### Issue: "Row Level Security policy violation"
**Solution:** Make sure you ran all the RLS policies in Step 6, and the user is logged in.

### Issue: "relation does not exist"
**Solution:** Make sure you ran the table creation SQL in Step 5.

### Issue: Data not loading
**Solution:** 
- Check browser console for errors
- Verify Supabase URL and keys are correct
- Check that user is logged in (`currentUser` is not null)

### Issue: "Failed to fetch"
**Solution:**
- Check your Supabase project is active (not paused)
- Verify CORS settings in Supabase (should work by default)
- Check network tab in browser DevTools

---

## Next Steps After Migration

1. **Test thoroughly** with all 3 users
2. **Migrate existing data** (if you have localStorage data to import)
3. **Set up backups** (Supabase free tier includes daily backups)
4. **Monitor usage** (check Supabase dashboard for storage/bandwidth)
5. **Add user roles** (if you need admin/manager/user permissions)

---

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check browser console for detailed error messages

---

**Good luck with your migration! 🚀**




