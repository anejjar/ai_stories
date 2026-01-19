-- Webhook Events Table for Idempotency
-- This table tracks processed webhook events to prevent duplicate processing

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'lemonsqueezy' CHECK (provider IN ('lemonsqueezy', 'stripe')),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  payload JSONB NOT NULL,
  error_message TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups by event_id
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);

-- Index for monitoring and cleanup
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status) WHERE status = 'failed';

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhook_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row updates
DROP TRIGGER IF EXISTS trigger_update_webhook_events_updated_at ON webhook_events;
CREATE TRIGGER trigger_update_webhook_events_updated_at
  BEFORE UPDATE ON webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_events_updated_at();

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook events (no user access needed)
-- Admin users can read for debugging
DROP POLICY IF EXISTS "Admins can read webhook events" ON webhook_events;
CREATE POLICY "Admins can read webhook events"
  ON webhook_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'superadmin'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE webhook_events IS 'Tracks processed webhook events for idempotency and debugging';
COMMENT ON COLUMN webhook_events.event_id IS 'Unique identifier from the webhook provider';
COMMENT ON COLUMN webhook_events.payload IS 'Full webhook payload for debugging';
