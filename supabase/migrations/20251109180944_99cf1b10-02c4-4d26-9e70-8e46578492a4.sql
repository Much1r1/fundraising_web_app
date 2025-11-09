-- Create campaign analytics table for tracking views and shares
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('view', 'share')),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_event_type ON campaign_analytics(event_type);
CREATE INDEX idx_campaign_analytics_created_at ON campaign_analytics(created_at);

-- Enable RLS
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert analytics events
CREATE POLICY "Anyone can track campaign events"
  ON campaign_analytics
  FOR INSERT
  WITH CHECK (true);

-- Policy: Campaign owners can view their campaign analytics
CREATE POLICY "Campaign owners can view analytics"
  ON campaign_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Policy: Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
  ON campaign_analytics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));