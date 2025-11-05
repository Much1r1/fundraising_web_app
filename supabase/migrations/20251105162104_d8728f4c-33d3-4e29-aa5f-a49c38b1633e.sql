-- Create a read-only view for public profile data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url
FROM public.users;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_invoker = on);

-- Create policy to allow anyone to read public profiles
CREATE POLICY "Anyone can view public profiles"
ON public.users
FOR SELECT
USING (true);