-- Ensure the admin user has the admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'muchirielvis375@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add is_featured column to campaigns if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'campaigns' AND column_name = 'is_featured') THEN
    ALTER TABLE public.campaigns ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- Update RLS policies for campaigns to allow admin to manage featured status
DROP POLICY IF EXISTS "Admins can manage featured campaigns" ON public.campaigns;
CREATE POLICY "Admins can manage featured campaigns"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));