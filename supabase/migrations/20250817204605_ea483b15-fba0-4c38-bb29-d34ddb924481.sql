-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create class_members table
CREATE TABLE public.class_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL,
  student_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, removed, pending
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Create student_invites table
CREATE TABLE public.student_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  class_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, used, expired
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Teachers can manage their own classes" 
ON public.classes 
FOR ALL 
USING (teacher_id = auth.uid());

CREATE POLICY "Students can view classes they're members of" 
ON public.classes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.class_members cm 
    JOIN public.profiles p ON p.user_id = cm.student_id 
    WHERE cm.class_id = classes.id 
    AND p.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- RLS Policies for class_members
CREATE POLICY "Teachers can manage their class members" 
ON public.class_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.classes c 
    WHERE c.id = class_members.class_id 
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own memberships" 
ON public.class_members 
FOR SELECT 
USING (student_id = auth.uid());

-- RLS Policies for student_invites
CREATE POLICY "Teachers can manage their own invites" 
ON public.student_invites 
FOR ALL 
USING (teacher_id = auth.uid());

CREATE POLICY "Anyone can view pending invites for validation" 
ON public.student_invites 
FOR SELECT 
USING (status = 'pending' AND expires_at > now());

-- Create indexes
CREATE INDEX idx_class_members_class_id ON public.class_members(class_id);
CREATE INDEX idx_class_members_student_id ON public.class_members(student_id);
CREATE INDEX idx_student_invites_code ON public.student_invites(code);
CREATE INDEX idx_student_invites_email ON public.student_invites(email);

-- Add foreign key constraints
ALTER TABLE public.class_members 
ADD CONSTRAINT fk_class_members_class_id 
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- Triggers for updated_at
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_members_updated_at
BEFORE UPDATE ON public.class_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RPC Functions
CREATE OR REPLACE FUNCTION public.create_invite_and_email(
  student_name_input TEXT,
  email_input TEXT,
  class_id_input UUID
)
RETURNS TABLE(code TEXT, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  invite_expires_at TIMESTAMP WITH TIME ZONE;
  existing_invite_id UUID;
BEGIN
  -- Check if teacher owns the class
  IF NOT EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = class_id_input AND teacher_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You can only invite students to your own classes';
  END IF;
  
  -- Check for existing pending invite
  SELECT id INTO existing_invite_id
  FROM public.student_invites 
  WHERE email = email_input 
    AND class_id = class_id_input 
    AND status = 'pending' 
    AND expires_at > now();
    
  IF existing_invite_id IS NOT NULL THEN
    RAISE EXCEPTION 'A pending invite already exists for this email and class';
  END IF;
  
  -- Generate unique code
  new_code := 'INV-' || upper(substr(gen_random_uuid()::text, 1, 8));
  invite_expires_at := now() + interval '30 days';
  
  -- Insert invite
  INSERT INTO public.student_invites (
    code, student_name, email, class_id, teacher_id, expires_at
  ) VALUES (
    new_code, student_name_input, email_input, class_id_input, auth.uid(), invite_expires_at
  );
  
  RETURN QUERY SELECT new_code, invite_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_student_from_class(
  student_id_input UUID,
  class_id_input UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if teacher owns the class
  IF NOT EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = class_id_input AND teacher_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You can only remove students from your own classes';
  END IF;
  
  -- Update class member status
  UPDATE public.class_members 
  SET status = 'removed', updated_at = now()
  WHERE student_id = student_id_input 
    AND class_id = class_id_input 
    AND status = 'active';
    
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.resend_invite(
  invite_code_input TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if invite exists and teacher owns it
  IF NOT EXISTS (
    SELECT 1 FROM public.student_invites 
    WHERE code = invite_code_input 
      AND teacher_id = auth.uid()
      AND status = 'pending' 
      AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Invalid invite code or unauthorized access';
  END IF;
  
  -- The actual email sending will be handled by the frontend calling the edge function
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.use_student_invite(
  invite_code_input TEXT,
  user_id_input UUID
)
RETURNS TABLE(class_id UUID, class_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  class_record RECORD;
BEGIN
  -- Get invite details
  SELECT * INTO invite_record
  FROM public.student_invites 
  WHERE code = invite_code_input 
    AND status = 'pending' 
    AND expires_at > now();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;
  
  -- Get class details
  SELECT * INTO class_record
  FROM public.classes 
  WHERE id = invite_record.class_id;
  
  -- Mark invite as used
  UPDATE public.student_invites 
  SET status = 'used', used_at = now()
  WHERE code = invite_code_input;
  
  -- Add student to class
  INSERT INTO public.class_members (class_id, student_id, status)
  VALUES (invite_record.class_id, user_id_input, 'active')
  ON CONFLICT (class_id, student_id) 
  DO UPDATE SET status = 'active', updated_at = now();
  
  RETURN QUERY SELECT class_record.id, class_record.name;
END;
$$;