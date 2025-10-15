-- Grant admin role to muchirielvis375@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('28d37233-b3d9-4ffa-bd2e-9ab042d184d5', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;