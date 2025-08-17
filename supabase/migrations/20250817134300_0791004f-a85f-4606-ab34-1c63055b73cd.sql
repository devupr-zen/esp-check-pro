-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Superadmins can manage invite codes" ON public.invite_codes;

-- Create a secure function to validate invite codes without exposing email addresses
CREATE OR REPLACE FUNCTION public.validate_invite_code(code_input TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  role user_role,
  track TEXT
) 
LANGUAGE SQL
SECURITY DEFINER
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

-- Create a function to use an invite code (increment usage)
CREATE OR REPLACE FUNCTION public.use_invite_code(code_input TEXT, user_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
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

-- Create restrictive policies - no public read access to the table
CREATE POLICY "Invite codes are private" 
ON public.invite_codes 
FOR SELECT 
USING (false);

-- Allow superadmins full access to manage invite codes
CREATE POLICY "Superadmins can manage invite codes" 
ON public.invite_codes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'superadmin'::user_role
));