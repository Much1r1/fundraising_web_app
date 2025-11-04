-- Add trigger to automatically create user role on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Insert role for existing user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id
);