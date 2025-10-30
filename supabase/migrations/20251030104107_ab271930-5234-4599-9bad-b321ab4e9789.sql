-- Add approval workflow columns to campaigns table
ALTER TABLE campaigns 
  ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN approved_by uuid REFERENCES auth.users(id),
  ADD COLUMN approved_at timestamp with time zone,
  ADD COLUMN rejection_reason text;

-- Update existing campaigns to be approved (backward compatibility)
UPDATE campaigns 
SET approval_status = 'approved' 
WHERE approval_status IS NULL;

-- Create indexes for faster queries
CREATE INDEX idx_campaigns_approval_status ON campaigns(approval_status);
CREATE INDEX idx_campaigns_approved_by ON campaigns(approved_by);

-- Update RLS policies for approval workflow
DROP POLICY IF EXISTS "Public can view approved campaigns" ON campaigns;
DROP POLICY IF EXISTS "Owners can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;

-- Policy: Public can only view approved campaigns
CREATE POLICY "Public can view approved campaigns"
  ON campaigns FOR SELECT
  USING (
    approval_status = 'approved' 
    AND (visibility = 'public' OR campaign_status IN ('active', 'completed'))
  );

-- Policy: Owners can view their own campaigns regardless of status
CREATE POLICY "Owners can view own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all campaigns
CREATE POLICY "Admins can view all campaigns for management"
  ON campaigns FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Policy: Only admins can update approval_status
CREATE POLICY "Admins can manage campaign approval"
  ON campaigns FOR UPDATE
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));