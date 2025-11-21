-- Add RLS policy to allow public read access to completed donations for activity feed
CREATE POLICY "Anyone can view completed donations"
ON donations
FOR SELECT
USING (payment_status = 'completed');