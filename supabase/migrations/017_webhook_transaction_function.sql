-- Webhook Transaction Function
-- Processes subscription webhooks atomically to prevent partial updates

CREATE OR REPLACE FUNCTION process_subscription_webhook(
  p_event_id TEXT,
  p_event_type TEXT,
  p_user_email TEXT DEFAULT NULL,
  p_customer_id TEXT DEFAULT NULL,
  p_subscription_id TEXT DEFAULT NULL,
  p_variant_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_tier TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_tier TEXT;
  v_result JSONB;
BEGIN
  -- Use tier from parameter if provided, otherwise default to trial
  v_tier := COALESCE(p_tier, 'trial');

  -- Find user by email or customer ID
  IF p_user_email IS NOT NULL THEN
    SELECT id INTO v_user_id
    FROM users
    WHERE email = p_user_email
    LIMIT 1;
  ELSIF p_customer_id IS NOT NULL THEN
    SELECT id INTO v_user_id
    FROM users
    WHERE lemonsqueezy_customer_id = p_customer_id
    LIMIT 1;
  END IF;

  -- If user not found, return error
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found',
      'user_email', p_user_email,
      'customer_id', p_customer_id
    );
  END IF;

  -- Process based on event type
  IF p_event_type IN ('subscription_created', 'subscription_updated', 'subscription_payment_success') THEN
    -- Update user subscription
    UPDATE users
    SET
      subscription_tier = v_tier,
      lemonsqueezy_subscription_id = COALESCE(p_subscription_id, lemonsqueezy_subscription_id),
      lemonsqueezy_customer_id = COALESCE(p_customer_id, lemonsqueezy_customer_id),
      updated_at = NOW()
    WHERE id = v_user_id;

    v_result := jsonb_build_object(
      'success', true,
      'user_id', v_user_id,
      'tier', v_tier,
      'action', 'subscription_updated'
    );

  ELSIF p_event_type IN ('subscription_cancelled', 'subscription_expired') THEN
    -- Downgrade to trial
    UPDATE users
    SET
      subscription_tier = 'trial',
      lemonsqueezy_subscription_id = NULL,
      updated_at = NOW()
    WHERE id = v_user_id;

    v_result := jsonb_build_object(
      'success', true,
      'user_id', v_user_id,
      'tier', 'trial',
      'action', 'subscription_cancelled'
    );
  ELSE
    v_result := jsonb_build_object(
      'success', false,
      'error', 'Unhandled event type',
      'event_type', p_event_type
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION process_subscription_webhook TO service_role;

-- Add comment
COMMENT ON FUNCTION process_subscription_webhook IS 'Processes subscription webhooks atomically to prevent partial updates';
