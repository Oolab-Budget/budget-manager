# Supabase Update Checklist

Since you're working locally, you need to ensure your Supabase database has all the required columns and policies. Here's what you need to check and update:

## ✅ Required Updates

### 1. **Recurring Items Tracking Columns** (for weekly/monthly items)
   - **File**: `add_weekly_monthly_columns.sql`
   - **What it does**: Adds columns to track when recurring items were added
   - **Columns added**:
     - `weekly_added_week` (TIMESTAMPTZ)
     - `monthly_added_month` (INTEGER)
     - `monthly_added_year` (INTEGER)
   - **Status**: ⚠️ **REQUIRED** - Without these, recurring items will be added again every time you reload

### 2. **RLS Policies for Tracking Shipments and Backorders**
   - **File**: `fix_rls_policies.sql`
   - **What it does**: Adds missing INSERT and DELETE policies
   - **Status**: ⚠️ **REQUIRED** - Without these, you'll get "row-level security policy" errors when saving tracking numbers

### 3. **Missing UPS Tracking Columns** (NEW - just created)
   - **File**: `add_missing_tracking_columns.sql`
   - **What it does**: Adds columns for detailed UPS tracking information
   - **Columns added to `canada_tracking_shipments`**:
     - `ups_last_update` (TIMESTAMPTZ)
     - `ups_last_date` (TIMESTAMPTZ)
     - `ups_status_code` (TEXT)
     - `ups_last_location` (TEXT)
   - **Columns added to `canada_backorders`**:
     - `item_id` (TEXT)
     - `reason` (TEXT)
   - **Status**: ⚠️ **REQUIRED** - Without these, some tracking data won't be saved properly

## 📋 How to Apply Updates

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click on "SQL Editor" in the left sidebar

2. **Run Each SQL File in Order**:
   ```sql
   -- 1. First, add recurring item tracking columns
   -- Copy and paste contents of: add_weekly_monthly_columns.sql
   
   -- 2. Then, fix RLS policies
   -- Copy and paste contents of: fix_rls_policies.sql
   
   -- 3. Finally, add missing tracking columns
   -- Copy and paste contents of: add_missing_tracking_columns.sql
   ```

3. **Verify Updates**:
   - Each script includes verification queries at the end
   - Check that all columns were added successfully
   - Check that all policies exist

## 🔍 How to Check if Updates Are Needed

### Check for recurring item columns:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'budget_items' 
AND column_name IN ('weekly_added_week', 'monthly_added_month', 'monthly_added_year');
```
**Expected**: Should return 3 rows. If it returns 0, you need to run `add_weekly_monthly_columns.sql`.

### Check for RLS policies:
```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename IN ('canada_tracking_shipments', 'canada_backorders')
AND cmd IN ('INSERT', 'DELETE');
```
**Expected**: Should return at least 4 rows (2 INSERT + 2 DELETE). If less, you need to run `fix_rls_policies.sql`.

### Check for tracking columns:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'canada_tracking_shipments' 
AND column_name IN ('ups_last_update', 'ups_last_date', 'ups_status_code', 'ups_last_location');
```
**Expected**: Should return 4 rows. If less, you need to run `add_missing_tracking_columns.sql`.

## ⚠️ Important Notes

- **All scripts use `IF NOT EXISTS`** - Safe to run multiple times
- **No data loss** - These are additive changes only
- **Run in order** - Some scripts depend on previous ones
- **Test after each update** - Make sure your app still works

## 🚨 Common Errors Without These Updates

1. **Recurring items added multiple times**: Missing `weekly_added_week` columns
2. **"row-level security policy" errors**: Missing RLS policies
3. **Tracking data not saving**: Missing tracking columns
4. **400 errors from Supabase**: Column doesn't exist errors

## ✅ After Running All Updates

Your Supabase database will be fully up-to-date and compatible with your local code. All features should work correctly:
- ✅ Recurring weekly/monthly items
- ✅ Canada request tracking
- ✅ UPS tracking status
- ✅ Backorders
- ✅ All CRUD operations


