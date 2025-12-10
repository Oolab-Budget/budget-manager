# Budget Manager - Complete User Manual
## Mexico Operations - Bilingual Budget Management System

**Version:** 1.0  
**Last Updated:** December 2024

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Main Features Overview](#main-features-overview)
4. [Detailed Feature Guides](#detailed-feature-guides)
   - [Budget Tab](#budget-tab)
   - [Add Items Tab](#add-items-tab)
   - [Manage Items Tab](#manage-items-tab)
   - [Categories Tab](#categories-tab)
   - [Reports Tab](#reports-tab)
   - [Monitor Tab](#monitor-tab)
   - [Alerts Tab](#alerts-tab)
   - [Can/Mex Tab](#canmex-tab)
   - [Mex/Can Tab](#mexcan-tab)
   - [Settings Tab](#settings-tab)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Data Backup & Restore](#data-backup--restore)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

The Budget Manager is a comprehensive bilingual (English/Spanish) budget management system designed for Mexico Operations. It helps you track expenses, manage inventory, generate reports, handle cross-border requests, and monitor spending patterns.

### Key Features
- **Bilingual Interface**: Switch between English and Spanish
- **Budget Management**: Create, track, and manage weekly budgets
- **Item Management**: Organize items by categories with recurring options
- **Reporting**: Generate detailed reports and analytics
- **Cross-Border Requests**: Handle Can/Mex and Mex/Can shipping requests
- **UPS Tracking**: Real-time tracking for shipments
- **Data Backup**: Automatic and manual backup options

---

## Getting Started

### First Time Setup

1. **Access the Application**
   - Open the Budget Manager in your web browser
   - The application will load with default settings

2. **Language Selection**
   - Click the **ES / EN** button in the top-left corner to switch languages
   - All interface elements will update immediately

3. **User Roles**
   - **Admin**: Full access to all features
   - **Limited User**: Access to Budget, Can/Mex, Mex/Can, and Reports tabs only

4. **Initial Configuration**
   - Go to **Settings** tab
   - Configure EmailJS for email notifications
   - Set up UPS tracking credentials (if needed)
   - Configure DeepL API for translations (optional)

---

## Main Features Overview

### Available Tabs

1. **Budget** - Main budget management and item tracking
2. **Add Items** - Quick item addition to budget
3. **Manage Items** - Edit, delete, and organize items in database
4. **Categories** - Manage budget categories
5. **Reports** - View budget reports and Canada/Mexico reports
6. **Monitor** - Monitor dashboard and activity logs
7. **Alerts** - Set up low stock and budget alerts
8. **Can/Mex** - Canada requesting items from Mexico
9. **Mex/Can** - Mexico requesting items from Canada
10. **Settings** - Application configuration

---

## Detailed Feature Guides

## Budget Tab

### Overview
The Budget tab is your main workspace for managing weekly budgets, tracking expenses, and approving items.

### Key Functions

#### 1. Adding Items from Categories
1. Select a **Category** from the dropdown
2. Items in that category will appear below
3. Click **Add to Budget** next to any item
4. The item will be added to your current week's budget

#### 2. Managing Budget Items
- **View Items**: All items in your current week's budget are displayed in a table
- **Edit Quantity**: Click the quantity field and enter a new value
- **Edit Unit Price**: Click the unit price field and enter a new value
- **Remove Item**: Click the **Remove** button (red) next to any item
- **Add Receipt**: Click **Add Receipt** to upload an invoice photo

#### 3. Approval System
- **Approve Item**: Click **Approve** to mark an item as approved
- **Reject Item**: Click **Reject** to mark an item as rejected
- **Reset All Approvals**: Click **Reset All Approvals** to clear all approval statuses

#### 4. Budget Actions
- **Save Budget**: Click **Save Budget** to save the current week's budget
- **Save and Continue**: Click **Save and Continue** to save without clearing items
- **Clear Budget**: Click **Clear Budget** to remove all items (recurring items will be re-added)
- **Export to Excel**: Click **Export to Excel** to download budget as spreadsheet

#### 5. Recurring Items
- Items marked as "Recurring Weekly" will automatically appear each Monday
- If you manually remove a recurring item, it won't reappear until next week
- Recurring items are identified by the "Recurring Weekly" badge

#### 6. Partial Payments
- When saving a budget, you can mark it as a "Partial Payment"
- Partial payments allow you to save budgets that aren't fully paid yet
- These are tracked separately in reports

---

## Add Items Tab

### Overview
Quickly add new items directly to your budget without going through categories.

### How to Use

1. **Fill in Item Details**
   - **Name (English)**: Item name in English
   - **Name (Spanish)**: Item name in Spanish (optional, will auto-translate)
   - **Category**: Select from existing categories
   - **Unit Price**: Price per unit
   - **Quantity**: Number of units
   - **Priority**: High, Medium, or Low
   - **Supplier**: Supplier name (optional)
   - **Description**: Additional notes (optional)

2. **Add to Budget**
   - Click **Add to Budget** button
   - Item will be added to current week's budget
   - Form will clear for next item

3. **Add to Database**
   - Check **Also add to item database** if you want to save for future use
   - Item will be available in category selection

---

## Manage Items Tab

### Overview
Manage all items in your item database. Edit, delete, or organize items.

### Key Functions

#### 1. Viewing Items
- Select a **Category** to view items in that category
- Use **Search** to filter items by name
- Items are displayed in a table with all details

#### 2. Editing Items
1. Click **Edit** next to any item
2. Modify the item details in the popup form
3. Click **Save Changes**
4. Changes are saved to the database

#### 3. Deleting Items
1. Click **Delete** next to any item
2. Confirm deletion
3. Item is permanently removed from database

#### 4. Item Properties
- **Recurring Weekly**: Item will auto-add to budget every Monday
- **Recurring Monthly**: Item will auto-add on a specific day each month
- **Available for Canada Requests**: Item can be requested in Can/Mex tab
- **Available for Mexico Requests**: Item can be requested in Mex/Can tab

#### 5. Bulk Operations
- Use search to find multiple items
- Edit or delete items individually
- Export items to Excel for external editing

---

## Categories Tab

### Overview
Create and manage budget categories. Categories organize your items and can have special properties.

### Key Functions

#### 1. Creating Categories
1. Click **Add New Category**
2. Fill in category details:
   - **Category Key**: Unique identifier (lowercase, no spaces, e.g., "office_supplies")
   - **Name (English)**: Category name in English
   - **Name (Spanish)**: Category name in Spanish
   - **Description**: Optional description
3. Click **Add Category**

#### 2. Category Properties
- **Recurring Weekly**: All items in this category will auto-add weekly
- **Has Due Date**: Category has a payment due date
- **Due Date**: Set the due date for the category

#### 3. Managing Categories
- **Edit**: Click **Edit** to modify category details
- **Delete**: Click **Delete** to remove category (items will be moved to "Other")
- **View Items**: Click category name to see all items in that category

#### 4. Import/Export Categories
- **Import**: Click **Import Categories** to load from JSON file
- **Export**: Click **Export Categories** to save to JSON file

---

## Reports Tab

### Overview
Generate detailed reports on budgets, spending patterns, and Canada/Mexico requests.

### Budget Reports

#### 1. Budget Summary
- Overview of current week's budget
- Total amounts by category
- Approval status summary

#### 2. Saved Budgets
- View all previously saved budgets
- Filter by date range
- Click **View Details** to see full budget breakdown
- Add receipts to saved budget items

#### 3. Spending by Category
- Total spending per category over time
- Visual breakdown of expenses
- Date range filtering

#### 4. Spending by Supplier
- Track spending with each supplier
- Supplier performance analysis
- Date range filtering

#### 5. Spending by Priority
- Breakdown by priority level (High/Medium/Low)
- Identify high-priority spending patterns

#### 6. Historical Trends
- View spending trends over time
- Compare weeks/months
- Identify patterns

#### 7. Item Analysis
- Most frequently ordered items
- Item spending analysis
- Item usage patterns

### Canada Reports

#### 1. Request History
- View all Can/Mex requests
- Filter by date range or item
- **Item-Focused View**: When filtering by item, see a table with:
  - Date of each request
  - Request number
  - Quantity ordered
  - Unit type
  - Status
  - Total quantity for filtered period

#### 2. Shipping Status
- Track shipping status of all requests
- Filter by status (Pending, In Transit, Delivered)
- View UPS tracking information

#### 3. Backorders
- View all backordered items
- Track backorder quantities
- Dismiss backorders when resolved

#### 4. Duties & Taxes
- View requests with duties/taxes due
- Track payment status
- Filter by payment status

#### 5. Delivery Timeline
- Timeline view of deliveries
- Track delivery dates
- Identify delays

---

## Monitor Tab

### Overview
Monitor dashboard showing activity, changes, and system status.

### Key Features

#### 1. Activity Log
- View all system activities
- Filter by activity type
- Search by item name
- Export activity log

#### 2. Change History
- Track all changes to items and categories
- View modification history
- Filter by change type (Added/Updated/Deleted)
- Filter by item or category

#### 3. Dashboard Summary
- Quick overview of budget status
- Recent activities
- System statistics

---

## Alerts Tab

### Overview
Set up alerts for low stock, budget thresholds, and important dates.

### Key Functions

#### 1. Low Stock Alerts
- Set minimum quantity for items
- Receive alerts when stock is low
- Configure alert thresholds

#### 2. Budget Alerts
- Set budget limits
- Receive alerts when approaching limits
- Configure warning thresholds

#### 3. Due Date Alerts
- Set alerts for payment due dates
- Receive reminders before due dates
- Configure reminder timing

#### 4. Managing Alerts
- View all active alerts
- Dismiss alerts when resolved
- Edit alert settings
- Delete alerts

---

## Can/Mex Tab

### Overview
Handle requests from Canada requesting items to be shipped to Mexico.

### Key Functions

#### 1. Creating Requests
1. Select items from the available list
2. Items must be marked "Available for Canada Requests"
3. Set quantities for each item
4. Add tracking numbers (optional)
5. Click **Generate Request** to create PDF and send email

#### 2. Item Selection
- **Filter by Category**: Select a category to filter items
- **Search**: Search for specific items
- **Add to Request**: Click **Add** to add item to request
- **Remove**: Click **Remove** to remove from request

#### 3. Tracking Numbers
- **Add Tracking**: Enter UPS tracking number
- **Edit Quantity Sent**: Update quantity after shipping
- **Real-time Updates**: UPS status updates automatically
- **Multiple Shipments**: Add multiple tracking numbers per request

#### 4. Request History
- View all past requests
- Filter by status (All, Pending, Sent, Received)
- Filter by tracking status (Duties, Delays, In Transit, Delivered, Backorders)
- View detailed request information

#### 5. UPS Tracking Features
- **Real-time Status**: Automatic updates every hour
- **Status Indicators**:
  - 📦 Picked Up
  - 🚚 In Transit
  - ✅ Delivered
  - 💰 Duties/Taxes Due
  - ⚠️ Delays/Exceptions
- **Tracking Details**: Click tracking number to view on UPS website
- **Last Location**: See last known location
- **Status Updates**: View status change history

#### 6. Backorders
- **View Backorders**: See items that weren't fully shipped
- **Update Quantities**: Edit sent quantities to create backorders
- **Dismiss Backorders**: Mark backorders as resolved
- **Backorder Summary**: View all active backorders

#### 7. Email Configuration
- Configure EmailJS settings in Settings tab
- Set recipient email for Can/Mex requests
- PDF attachments are automatically included

---

## Mex/Can Tab

### Overview
Handle requests from Mexico requesting items to be shipped from Canada.

### Key Functions

#### 1. Creating Requests
1. Select items from the available list
2. Items must be marked "Available for Mexico Requests"
3. Set quantities (default unit: pieces, can change to pairs)
4. Add notes to items (optional)
5. Add tracking numbers (optional)
6. Click **Generate Request** to create PDF and send email

#### 2. Item Selection
- **Filter by Category**: Select Mexico category to see available items
- **Search**: Search for specific items
- **Add to Request**: Click **Add** to add item to request
- **Remove**: Click **Remove** to remove from request

#### 3. Item Notes
- **Add Note**: Click note icon to add item-specific notes
- **Edit Note**: Click note icon again to edit
- **View Note**: Notes appear in request PDF and email

#### 4. Units
- **Default**: Pieces
- **Alternative**: Pairs (for items like shoes, gloves, etc.)
- Change unit type when adding item to request

#### 5. Tracking Numbers
- **Add Tracking**: Enter UPS tracking number
- **Edit Quantity Sent**: Update quantity after shipping
- **Real-time Updates**: UPS status updates automatically
- **Multiple Shipments**: Add multiple tracking numbers per request

#### 6. Request History
- View all past requests
- Filter by status
- View detailed request information
- Track shipping status

#### 7. Email Configuration
- Configure separate EmailJS settings for Mex/Can
- Set recipient email for Mex/Can requests
- PDF attachments are automatically included

---

## Settings Tab

### Overview
Configure application settings, APIs, and preferences.

### Configuration Sections

#### 1. Email Configuration (EmailJS)

**Can/Mex Email Settings:**
- **Public Key**: EmailJS public key
- **Service ID**: EmailJS service ID
- **Template ID**: EmailJS template ID for Can/Mex requests
- **Recipient Email**: Email address for Can/Mex requests

**Mex/Can Email Settings:**
- **Public Key**: EmailJS public key (can be same or different)
- **Service ID**: EmailJS service ID
- **Template ID**: EmailJS template ID for Mex/Can requests
- **Recipient Email**: Email address for Mex/Can requests

**How to Configure:**
1. Sign up at [EmailJS.com](https://www.emailjs.com)
2. Create email service (Gmail, Outlook, etc.)
3. Create email template
4. Copy Public Key, Service ID, and Template ID
5. Paste into Settings tab
6. Click **Save Email Settings**

#### 2. Translation API (DeepL)

- **API Key**: DeepL API key for automatic translations
- **How to Get**: Sign up at [DeepL.com](https://www.deepl.com)
- **Manual Translation**: Click **Translate All Items** button to manually trigger translations

#### 3. UPS Tracking

- **Client ID**: UPS API client ID
- **Client Secret**: UPS API client secret
- **How to Get**: Register at [UPS Developer Portal](https://developer.ups.com)
- **Polling Interval**: How often to check for updates (default: 1 hour)

#### 4. Backup & Restore

**Automatic Backup:**
- Backups are saved to: `C:\Users\[YourName]\Desktop\budget manager\`
- Filename format: `budget-full-backup-with-supabase-YYYY-MM-DD_HH-MM-SS.json`
- Includes timestamp to prevent overwrites

**Manual Backup:**
1. Click **Backup All Data** button
2. Choose save location
3. File will be saved with timestamp

**Restore Backup:**
1. Click **Choose File** button
2. Select backup JSON file
3. Click **Restore Backup**
4. All data will be restored from backup

**Restore Without Login:**
- On login screen, use file input to restore backup
- Useful if you can't log in but have a backup

#### 5. Data Migration

**Migrate to Supabase:**
- If logged in, click **Migrate to Supabase** to upload local data
- All localStorage data will be uploaded to cloud database

**Migrate from Supabase:**
- If logged in, click **Download from Supabase** to sync cloud data locally

---

## User Roles & Permissions

### Admin Role
- **Full Access**: All tabs and features
- **Settings Access**: Can configure all settings
- **User Management**: Can manage other users (if implemented)
- **Data Management**: Full backup/restore access

### Limited User Role
- **Accessible Tabs**:
  - Budget
  - Can/Mex
  - Mex/Can
  - Reports
- **Restricted Tabs**:
  - Add Items (read-only)
  - Manage Items (read-only)
  - Categories (read-only)
  - Monitor (hidden)
  - Alerts (hidden)
  - Settings (hidden)

### Default Role
- New users default to **Limited User** role
- Admin must change role in Supabase dashboard

---

## Data Backup & Restore

### Automatic Backups
- Backups are created automatically when saving budgets
- Saved to desktop folder: `budget manager`
- Includes all data: items, categories, budgets, history, settings

### Manual Backups
1. Go to **Settings** tab
2. Click **Backup All Data**
3. Choose save location
4. File includes timestamp in filename

### Restore Process
1. Go to **Settings** tab (or login screen)
2. Click **Choose File** under Restore Backup
3. Select your backup JSON file
4. Click **Restore Backup**
5. Wait for confirmation message
6. Refresh page to see restored data

### What's Included in Backup
- All budget items
- All categories
- All items in database
- Saved budgets
- Canada request history
- Mexico request history
- Activity logs
- Change history
- Settings (except sensitive API keys)
- Alerts configuration

---

## Tips & Best Practices

### Budget Management
1. **Save Regularly**: Save your budget frequently to prevent data loss
2. **Use Recurring Items**: Mark frequently used items as recurring to save time
3. **Add Receipts**: Upload receipts immediately after purchase for better tracking
4. **Approve Items**: Use approval system to track what's been reviewed
5. **Partial Payments**: Use partial payment feature for budgets paid in installments

### Item Management
1. **Organize by Category**: Keep items well-organized in categories
2. **Use Descriptions**: Add descriptions to items for clarity
3. **Set Priorities**: Use priority levels to identify important items
4. **Mark Availability**: Mark items as available for Canada/Mexico requests appropriately

### Reports
1. **Regular Reviews**: Review reports weekly to track spending patterns
2. **Use Filters**: Use date range and item filters to focus on specific data
3. **Export Data**: Export reports to Excel for external analysis
4. **Compare Periods**: Use historical trends to compare spending

### Can/Mex & Mex/Can
1. **Add Tracking Early**: Add tracking numbers as soon as available
2. **Update Quantities**: Update sent quantities to track backorders accurately
3. **Monitor Status**: Check tracking status regularly for delays
4. **Handle Backorders**: Dismiss backorders when resolved

### Data Safety
1. **Regular Backups**: Create backups weekly or before major changes
2. **Multiple Backups**: Keep multiple backup files for safety
3. **Test Restores**: Periodically test restoring from backup
4. **Export Important Data**: Export critical reports to Excel

### Performance
1. **Clear Old Data**: Periodically clean up old activity logs
2. **Limit Items**: Don't add unnecessary items to database
3. **Use Search**: Use search instead of scrolling through long lists
4. **Close Unused Tabs**: Close browser tabs when not in use

---

## Troubleshooting

### Common Issues

#### Items Not Appearing
- **Check Category**: Make sure correct category is selected
- **Check Availability**: Verify item is marked as available for requests
- **Refresh Page**: Hard refresh (Ctrl+Shift+R) to reload data
- **Check Filters**: Clear any active filters

#### Recurring Items Not Adding
- **Check Day**: Recurring items add on Monday
- **Already Exists**: Item may already be in budget
- **Manually Removed**: If you removed it, it won't reappear until next week

#### Tracking Not Updating
- **Check Settings**: Verify UPS credentials in Settings
- **Check Internet**: Ensure internet connection is active
- **Wait for Polling**: Updates check every hour
- **Manual Refresh**: Refresh page to trigger update

#### Email Not Sending
- **Check EmailJS Settings**: Verify all EmailJS settings are correct
- **Check Template**: Ensure template ID matches
- **Check Recipient**: Verify recipient email is correct
- **Check Console**: Open browser console (F12) for error messages

#### Data Not Saving
- **Check localStorage**: Verify browser allows localStorage
- **Check Space**: Ensure sufficient browser storage space
- **Clear Cache**: Clear browser cache and try again
- **Check Console**: Look for error messages in console

#### Reports Not Showing
- **Check Filters**: Clear date range and item filters
- **Check Data**: Ensure you have data for selected period
- **Refresh Page**: Hard refresh to reload data
- **Check Tab**: Make sure you're on correct report type

#### Can't Login
- **Check Credentials**: Verify email and password
- **Check Email Confirmation**: Verify email if required
- **Clear Cache**: Clear browser cache and cookies
- **Try Incognito**: Try in incognito/private window
- **Restore Backup**: Use backup restore if needed

#### Lost Data
- **Check Backup**: Look for automatic backups on desktop
- **Restore Backup**: Use restore function to recover data
- **Check Supabase**: If logged in, data may be in cloud
- **Contact Admin**: If using cloud, contact admin for help

### Getting Help

1. **Check Console**: Open browser console (F12) for error messages
2. **Check Network**: Verify internet connection
3. **Try Refresh**: Hard refresh (Ctrl+Shift+R)
4. **Clear Cache**: Clear browser cache
5. **Restore Backup**: If data is lost, restore from backup
6. **Contact Support**: If issue persists, contact system administrator

---

## Keyboard Shortcuts

- **Ctrl+Shift+R**: Hard refresh page
- **F12**: Open browser developer console
- **Ctrl+F**: Search on page
- **Tab**: Navigate between form fields
- **Enter**: Submit forms

---

## Appendix

### File Locations
- **Backups**: `C:\Users\[YourName]\Desktop\budget manager\`
- **Logos**: `images/logo1.png`, `logo2.png`, `logo3.png`

### Data Storage
- **Local Storage**: All data stored in browser localStorage
- **Cloud Storage**: Optional Supabase cloud storage (if logged in)
- **Backups**: JSON files on desktop

### Browser Compatibility
- **Recommended**: Chrome, Firefox, Edge (latest versions)
- **Required**: JavaScript enabled, localStorage support
- **Not Supported**: Internet Explorer

### System Requirements
- Modern web browser
- Internet connection (for UPS tracking, emails, translations)
- JavaScript enabled
- localStorage enabled

---

## Version History

### Version 1.0 (December 2024)
- Initial release
- All core features implemented
- Bilingual support
- UPS tracking integration
- Can/Mex and Mex/Can request management
- Comprehensive reporting
- Backup and restore functionality

---

**End of Manual**

For additional support or questions, please contact your system administrator.


