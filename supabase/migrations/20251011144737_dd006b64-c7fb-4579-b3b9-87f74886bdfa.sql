-- Allow public read access to published campaigns so the UI can display data
-- This policy lets anyone SELECT campaigns that are meant to be publicly visible
CREATE POLICY "Public can view published campaigns"
ON public.campaigns
FOR SELECT
USING (
  visibility = 'public'::visibility
  OR campaign_status IN ('active'::campaign_status, 'completed'::campaign_status)
);
