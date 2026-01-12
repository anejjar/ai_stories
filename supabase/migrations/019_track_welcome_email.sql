-- Track Welcome Email Sent Status
-- Adds a column to track when welcome email was sent to prevent duplicates

-- Add welcome_email_sent_at column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent_at 
ON public.users(welcome_email_sent_at) 
WHERE welcome_email_sent_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.users.welcome_email_sent_at IS 'Timestamp when welcome email was sent after email verification';
