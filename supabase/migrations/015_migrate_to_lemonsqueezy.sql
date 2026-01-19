-- Migration: Replace Stripe columns with Lemon Squeezy equivalents
-- This migration renames Stripe-related columns to Lemon Squeezy columns

-- =====================================================
-- USERS TABLE: Rename Stripe columns
-- =====================================================

-- Rename stripe_customer_id to lemonsqueezy_customer_id
ALTER TABLE users 
  RENAME COLUMN stripe_customer_id TO lemonsqueezy_customer_id;

-- Rename stripe_subscription_id to lemonsqueezy_subscription_id
ALTER TABLE users 
  RENAME COLUMN stripe_subscription_id TO lemonsqueezy_subscription_id;

-- =====================================================
-- PAYMENTS TABLE: Rename Stripe column
-- =====================================================

-- Rename stripe_payment_intent_id to lemonsqueezy_order_id
ALTER TABLE payments 
  RENAME COLUMN stripe_payment_intent_id TO lemonsqueezy_order_id;

-- =====================================================
-- COMMENTS
-- =====================================================
-- This migration assumes a fresh start with Lemon Squeezy
-- Existing Stripe data will be lost (as per plan: fresh_start approach)
