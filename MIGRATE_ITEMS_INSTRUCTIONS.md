# How to Transfer Items to Live App

If your items are not showing up in the live app, follow these steps:

## Step 1: Update Supabase Database Schema

Your Supabase database needs to have the latest columns. Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns for recurring items tracking
ALTER TABLE budget_items 
ADD COLUMN IF NOT EXISTS weekly_added_week TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS monthly_added_month INTEGER,
ADD COLUMN IF NOT EXISTS monthly_added_year INTEGER;
```

**How to run this:**
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the SQL above
5. Click "Run" (or press Ctrl+Enter)

## Step 2: Force Migration of Items

After updating the schema, the app will automatically try to migrate items from localStorage to Supabase when you log in. However, if items still don't appear:

1. **Open the live app** (https://oolab-budget.github.io)
2. **Log in** with your account
3. **Open the browser console** (Press F12, then click the "Console" tab)
4. **Run this command** in the console:
   ```javascript
   forceMigrateBudgetItems()
   ```

This will:
- Check for items in localStorage that aren't in Supabase
- Migrate them to Supabase
- Reload the items in the app

## Step 3: Verify Items Are Synced

After migration:
1. Check the console for messages like "Migrating X items to Supabase..."
2. Refresh the page
3. Your items should now appear in the Budget tab

## Troubleshooting

### If items still don't appear:

1. **Check the console for errors** - Look for red error messages
2. **Verify you're logged in** - Make sure you see your email in the top right
3. **Check localStorage** - Run this in the console:
   ```javascript
   JSON.parse(localStorage.getItem('budgetItems') || '[]').length
   ```
   This shows how many items are in localStorage.

4. **Check Supabase** - Run this in the console:
   ```javascript
   (async () => {
     const { data, error } = await supabase.from('budget_items').select('*');
     console.log('Items in Supabase:', data?.length || 0);
     if (error) console.error('Error:', error);
   })();
   ```
   This shows how many items are in Supabase.

### If you see "column does not exist" errors:

This means Step 1 wasn't completed. Go back and run the SQL script in Supabase.

### If migration fails:

1. Make sure you're logged into the correct Supabase account
2. Check that your Supabase project URL and API key are correct in the Settings tab
3. Try logging out and logging back in

## Manual Migration (Advanced)

If automatic migration doesn't work, you can manually copy items:

1. **Export from localStorage:**
   ```javascript
   const items = JSON.parse(localStorage.getItem('budgetItems') || '[]');
   console.log(JSON.stringify(items, null, 2));
   ```
   Copy the output.

2. **Import to Supabase:**
   - Go to Supabase Dashboard > Table Editor > budget_items
   - Manually add items or use the SQL Editor to insert them

---

**Note:** After migration, items will be synced automatically between localStorage and Supabase. You should see your items in both the local app and the live app.





