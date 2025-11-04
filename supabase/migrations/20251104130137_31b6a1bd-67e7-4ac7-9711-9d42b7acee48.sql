-- Insert missing user profile from auth.users to public.users
INSERT INTO public.users (id, email, full_name, is_active, verification_status, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  true,
  'pending'::verification_status,
  created_at,
  now()
FROM auth.users
WHERE id = '8862e951-da4f-4556-9842-32c874c278b4'
ON CONFLICT (id) DO NOTHING;

-- Sync all auth users to public.users table (in case there are more)
INSERT INTO public.users (id, email, full_name, is_active, verification_status, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  true,
  'pending'::verification_status,
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;