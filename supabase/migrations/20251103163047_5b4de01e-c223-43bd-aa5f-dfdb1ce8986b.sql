-- Drop old policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all donations" ON public.donations;

-- Allow admins to view all users
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to view all donations
CREATE POLICY "Admins can view all donations"
ON public.donations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));