-- Create function to increment campaign amount when donation is successful
CREATE OR REPLACE FUNCTION increment_campaign_amount(campaign_id UUID, amount_to_add NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE campaigns
  SET current_amount = current_amount + amount_to_add,
      updated_at = now()
  WHERE id = campaign_id;
END;
$$;