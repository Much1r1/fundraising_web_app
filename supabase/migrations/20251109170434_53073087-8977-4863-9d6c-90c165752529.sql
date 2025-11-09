-- Add is_anonymous column to donations table if it doesn't exist
ALTER TABLE donations ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

-- Create recurring_subscriptions table
CREATE TABLE IF NOT EXISTS recurring_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  frequency text NOT NULL CHECK (frequency IN ('daily','weekly','monthly','yearly')),
  start_date timestamp with time zone DEFAULT now(),
  active boolean DEFAULT true,
  stripe_subscription_id text,
  payment_method text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create donor_reminders table
CREATE TABLE IF NOT EXISTS donor_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  amount numeric,
  frequency text CHECK (frequency IN ('daily','weekly','monthly','yearly')),
  next_due timestamp with time zone,
  enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  in_app_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add show_name_publicly column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_name_publicly boolean DEFAULT true;

-- Enable RLS on new tables
ALTER TABLE recurring_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recurring_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON recurring_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON recurring_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON recurring_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON recurring_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for donor_reminders
CREATE POLICY "Users can view their own reminders"
  ON donor_reminders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
  ON donor_reminders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON donor_reminders
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON donor_reminders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recurring_subscriptions_user_id ON recurring_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_subscriptions_active ON recurring_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_donor_reminders_user_id ON donor_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_donor_reminders_next_due ON donor_reminders(next_due) WHERE enabled = true;