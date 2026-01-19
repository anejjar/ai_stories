-- Support Tickets Table
-- Stores user support requests with tracking

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  ticket_number TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('bug_report', 'account_issue', 'billing_payment', 'general_inquiry')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_support_tickets_status ON support_tickets(status, created_at DESC);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority, created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Superadmins can do everything
CREATE POLICY "Superadmins have full access to tickets"
  ON support_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'superadmin'
    )
  );

COMMENT ON TABLE support_tickets IS 'User support requests and tickets';
