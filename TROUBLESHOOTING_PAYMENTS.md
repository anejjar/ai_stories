# Payment Checkout Troubleshooting Guide

## Error: "The related resource does not exist" (404)

### Symptoms
- Error log shows: `Lemon Squeezy API error (404 Not Found) on /checkouts: The related resource does not exist.`
- Error details show: `"source":{"pointer":"/data/relationships/variant"}`
- Checkout creation fails

### Root Cause
The variant ID configured in your environment variables doesn't exist in your Lemon Squeezy account. This typically happens when:
1. The variant ID is incorrect or has been deleted
2. The variant ID belongs to a different Lemon Squeezy store
3. The environment variables are not set correctly

### Solution

#### Step 1: Verify Environment Variables
Check that these are set in your environment:
- `LEMONSQUEEZY_PRO_VARIANT_ID` - For Pro tier subscriptions
- `LEMONSQUEEZY_FAMILY_VARIANT_ID` - For Family tier subscriptions

#### Step 2: Get Correct Variant IDs from Lemon Squeezy

1. **Log into Lemon Squeezy Dashboard**
   - Go to https://app.lemonsqueezy.com
   - Navigate to your store

2. **Find Your Products**
   - Go to **Products** in the sidebar
   - Click on your subscription product (Pro or Family)

3. **Get Variant ID**
   - Click on the variant you want to use
   - The variant ID is in the URL: `https://app.lemonsqueezy.com/products/[product-id]/variants/[variant-id]`
   - Or check the variant details page - the ID is displayed there

4. **Verify Store ID**
   - Make sure `LEMONSQUEEZY_STORE_ID` matches your store ID
   - Found in: Dashboard > Settings > Store

#### Step 3: Update Environment Variables

**For Local Development (.env.local):**
```env
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_PRO_VARIANT_ID=your-pro-variant-id
LEMONSQUEEZY_FAMILY_VARIANT_ID=your-family-variant-id
```

**For Production (Vercel/Deployment):**
1. Go to your deployment platform's environment variables
2. Update the variant IDs with the correct values
3. Redeploy your application

#### Step 4: Verify Configuration

After updating, test the checkout:
1. Try to create a checkout session for Pro tier
2. Try to create a checkout session for Family tier
3. Check the logs to ensure variant IDs are being used correctly

### Common Issues

#### Issue: Variant ID format
- **Problem**: Variant IDs should be numeric strings (e.g., "123456")
- **Solution**: Make sure you're using the variant ID, not the product ID

#### Issue: Wrong Store
- **Problem**: Variant belongs to a different store
- **Solution**: Verify `LEMONSQUEEZY_STORE_ID` matches the store where your variants exist

#### Issue: Variant Deleted
- **Problem**: Variant was deleted from Lemon Squeezy
- **Solution**: Create a new variant and update the environment variable

### Debugging

The improved error logging now shows:
- The tier being requested
- The variant ID being used
- More detailed error messages

Check your logs for entries like:
```
{
  "endpoint": "/api/payments/checkout",
  "userId": "...",
  "tier": "pro",
  "variantId": "123456",
  "errorMessage": "..."
}
```

### Testing Variant IDs

#### Option 1: Use the Validation Script

We've created a script to validate your variant IDs:

```bash
npx tsx scripts/validate-lemonsqueezy-variants.ts
```

This script will:
- Check if your variant IDs exist
- Show variant details (name, price, interval)
- Provide helpful error messages

#### Option 2: Manual API Test

You can test if a variant ID is valid by making a GET request to:
```
GET https://api.lemonsqueezy.com/v1/variants/{variant-id}
Authorization: Bearer {your-api-key}
```

If you get a 404, the variant doesn't exist or you don't have access to it.

#### Option 3: Check in Lemon Squeezy Dashboard

1. Go to https://app.lemonsqueezy.com
2. Navigate to **Products** > Your Product > **Variants**
3. Click on a variant
4. The variant ID is in the URL: `/variants/{variant-id}`
5. Compare this with your environment variable

### Prevention

1. **Document Variant IDs**: Keep a record of which variant IDs correspond to which tiers
2. **Use Environment-Specific IDs**: Use different variant IDs for development and production
3. **Validate on Startup**: Consider adding a startup check that validates variant IDs exist
4. **Monitor Logs**: Set up alerts for 404 errors on checkout creation
