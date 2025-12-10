# UPS Track Alert API Integration - Setup Guide

## What's Been Implemented

### ✅ Proxy Server Endpoints

1. **Subscription Endpoint**: `POST /api/ups/track-alert/subscribe`
   - Subscribes tracking numbers to UPS Track Alert API
   - Handles batches of up to 100 tracking numbers
   - Returns subscription status

2. **Webhook Endpoint**: `POST /api/ups/track-alert/webhook`
   - Receives push notifications from UPS when tracking events occur
   - Responds quickly (within milliseconds) as required by UPS
   - Processes events asynchronously

### ✅ Frontend Integration

1. **Subscription Function**: `subscribeToTrackAlert(trackingNumbers)`
   - Automatically subscribes tracking numbers when they're saved
   - Handles batching (100 tracking numbers per request)
   - Logs success/failure

2. **Auto-Subscription**: 
   - When you save tracking numbers in the app, they're automatically subscribed
   - Happens in the background when you mark a request as "sent"

## How It Works

1. **When you add tracking numbers:**
   - You enter tracking numbers in the app
   - When you save/mark as "sent", the app automatically subscribes them to Track Alert API
   - UPS will send push notifications to your webhook URL when events occur

2. **When UPS sends an update:**
   - UPS POSTs to: `https://your-railway-url.railway.app/api/ups/track-alert/webhook`
   - The webhook receives the event and logs it
   - Events are processed asynchronously

3. **Current Status:**
   - Webhook events are logged to Railway logs
   - Frontend still uses polling for status checks (can be enhanced later)

## Next Steps (Optional Enhancements)

### Option 1: Store Webhook Events in Supabase
- Create a table to store webhook events
- Update webhook handler to save events to Supabase
- Frontend can query Supabase for latest events

### Option 2: Real-time Updates via Supabase Realtime
- Store events in Supabase
- Use Supabase Realtime subscriptions to push updates to frontend
- Frontend automatically updates when new events arrive

### Option 3: Poll Webhook Status Endpoint
- Add an endpoint to retrieve recent webhook events
- Frontend polls this endpoint periodically
- Updates status based on latest events

## Configuration

### Required Settings

1. **Proxy Server URL**: Set in Settings → UPS Tracking API
   - Example: `https://wholesome-generosity-production.up.railway.app`

2. **UPS Credentials**: Client ID and Client Secret
   - Get from UPS Developer Portal

3. **Environment**: 
   - Currently set to 'production' in code
   - Change to 'test' if using test credentials

### Webhook URL

The webhook URL is automatically built as:
```
{PROXY_URL}/api/ups/track-alert/webhook
```

Make sure your Railway deployment is accessible from the internet (it should be by default).

## Testing

### Test Tracking Numbers

UPS provides test tracking numbers:
- `1ZCIETST0111111114`
- `1ZCIETST0422222228`

These will send several test events when subscribed.

### Check Subscription Status

1. Open browser console (F12)
2. Save tracking numbers
3. Look for: "✓ Track Alert subscription successful"

### Check Webhook Events

1. Go to Railway dashboard
2. View logs
3. Look for: "=== POST /api/ups/track-alert/webhook - Webhook received ==="

## Important Notes

- **Subscription Duration**: Subscriptions last 14 days, then need to be renewed
- **Free Tier**: Under 100 requests/month is free
- **Webhook Response Time**: Must respond within milliseconds (currently handled)
- **Batch Size**: Maximum 100 tracking numbers per subscription request

## Troubleshooting

### Subscriptions Failing
- Check UPS credentials are correct
- Verify proxy URL is accessible
- Check Railway logs for errors
- Ensure you're using production credentials with production environment

### Webhook Not Receiving Events
- Verify webhook URL is accessible from internet
- Check Railway logs for incoming requests
- Ensure subscription was successful
- Test with UPS test tracking numbers first

### Events Not Updating Frontend
- Currently, webhook events are logged but don't automatically update frontend
- Frontend still uses polling (checkAllTrackingNumbers)
- To enable real-time updates, implement one of the enhancement options above


