/**
 * Script to validate Lemon Squeezy variant IDs
 * Run with: npx tsx scripts/validate-lemonsqueezy-variants.ts
 * 
 * This script checks if your configured variant IDs exist in your Lemon Squeezy account
 */

import { validateVariantId, getVariantIdForTier, getVariantDetails } from '../lib/payments/lemonsqueezy'

async function main() {
  console.log('🔍 Validating Lemon Squeezy Variant IDs...\n')

  // Check environment variables
  if (!process.env.LEMONSQUEEZY_API_KEY) {
    console.error('❌ LEMONSQUEEZY_API_KEY is not set')
    process.exit(1)
  }

  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    console.error('❌ LEMONSQUEEZY_STORE_ID is not set')
    process.exit(1)
  }

  console.log(`✅ Store ID: ${process.env.LEMONSQUEEZY_STORE_ID}\n`)

  // Validate Pro variant
  const proVariantId = getVariantIdForTier('pro')
  if (proVariantId) {
    console.log(`📦 Checking Pro variant: ${proVariantId}`)
    const proValidation = await validateVariantId(proVariantId)
    if (proValidation.valid) {
      console.log(`   ✅ Pro variant exists`)
      try {
        const details = await getVariantDetails(proVariantId)
        const variant = details.data
        console.log(`   📝 Name: ${variant.attributes.name}`)
        console.log(`   💰 Price: ${variant.attributes.price / 100} ${variant.attributes.currency}`)
        console.log(`   🔄 Interval: ${variant.attributes.interval} (${variant.attributes.interval_count}x)`)
      } catch (err) {
        console.log(`   ⚠️  Could not fetch details`)
      }
    } else {
      console.log(`   ❌ Pro variant NOT FOUND: ${proValidation.error}`)
      console.log(`   💡 Update LEMONSQUEEZY_PRO_VARIANT_ID in your environment variables`)
    }
  } else {
    console.log(`⚠️  Pro variant ID not configured (LEMONSQUEEZY_PRO_VARIANT_ID)`)
  }

  console.log('')

  // Validate Family variant
  const familyVariantId = getVariantIdForTier('family')
  if (familyVariantId) {
    console.log(`📦 Checking Family variant: ${familyVariantId}`)
    const familyValidation = await validateVariantId(familyVariantId)
    if (familyValidation.valid) {
      console.log(`   ✅ Family variant exists`)
      try {
        const details = await getVariantDetails(familyVariantId)
        const variant = details.data
        console.log(`   📝 Name: ${variant.attributes.name}`)
        console.log(`   💰 Price: ${variant.attributes.price / 100} ${variant.attributes.currency}`)
        console.log(`   🔄 Interval: ${variant.attributes.interval} (${variant.attributes.interval_count}x)`)
      } catch (err) {
        console.log(`   ⚠️  Could not fetch details`)
      }
    } else {
      console.log(`   ❌ Family variant NOT FOUND: ${familyValidation.error}`)
      console.log(`   💡 Update LEMONSQUEEZY_FAMILY_VARIANT_ID in your environment variables`)
    }
  } else {
    console.log(`⚠️  Family variant ID not configured (LEMONSQUEEZY_FAMILY_VARIANT_ID)`)
  }

  console.log('\n📋 How to find correct variant IDs:')
  console.log('1. Go to https://app.lemonsqueezy.com')
  console.log('2. Navigate to Products > Your Product > Variants')
  console.log('3. Click on a variant to see its ID in the URL')
  console.log('4. Update your environment variables with the correct IDs')
  console.log('5. Redeploy your application\n')
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
