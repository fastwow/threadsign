-- Create email_deliveries table for tracking email deliveries to subscribers
-- This table tracks when emails were sent, which ideas were included, and Resend message IDs

CREATE TABLE IF NOT EXISTS email_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES email_subscriptions(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ideas_included JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of idea IDs that were included in the email
  resend_message_id TEXT -- Message ID from Resend API for delivery status tracking
);

-- Create index for efficient querying by subscription
CREATE INDEX IF NOT EXISTS idx_email_deliveries_subscription_id ON email_deliveries(subscription_id);

-- Create index for efficient querying by sent_at timestamp
CREATE INDEX IF NOT EXISTS idx_email_deliveries_sent_at ON email_deliveries(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE email_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own email deliveries
CREATE POLICY "Users can view own email deliveries" ON email_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM email_subscriptions
      WHERE email_subscriptions.id = email_deliveries.subscription_id
      AND email_subscriptions.user_id = auth.uid()
    )
  );

-- Note: Insert/Update/Delete operations are only done by service role (background jobs)
-- Users cannot modify their delivery history directly

