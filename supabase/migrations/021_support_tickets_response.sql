-- Add admin_response field (visible to user, unlike admin_notes which is internal)
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS admin_response TEXT;

-- Index for faster user ticket lookups
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_created
  ON support_tickets(user_id, created_at DESC);
