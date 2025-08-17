-- Fix the security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.validate_invite_code(code_input TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  role user_role,
  track TEXT
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    TRUE as is_valid,
    ic.role,
    ic.track
  FROM public.invite_codes ic
  WHERE ic.code = code_input
    AND ic.is_active = true
    AND (ic.expires_at IS NULL OR ic.expires_at > now())
    AND ic.current_uses < ic.max_uses
  LIMIT 1;
$$;

-- Fix the search path for the use invite code function
CREATE OR REPLACE FUNCTION public.use_invite_code(code_input TEXT, user_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.invite_codes 
  SET current_uses = current_uses + 1
  WHERE code = code_input
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND current_uses < max_uses
    AND (email IS NULL OR email = user_email)
  RETURNING TRUE;
$$;

-- Fix the handle_new_user function search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')::user_role,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;