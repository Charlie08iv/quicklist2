
-- Check if RLS is enabled on the groups table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'groups';

-- Enable RLS on the groups table if not already enabled
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to see all groups they created
CREATE POLICY IF NOT EXISTS "Users can view groups they created"
ON public.groups
FOR SELECT
USING (auth.uid() = created_by);

-- Create policy that allows users to see groups they are members of
CREATE POLICY IF NOT EXISTS "Users can view groups they are members of"
ON public.groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = id AND user_id = auth.uid()
  )
);

-- Create policy that allows users to create new groups
CREATE POLICY IF NOT EXISTS "Users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Create policy that allows users to update groups they created
CREATE POLICY IF NOT EXISTS "Users can update groups they created"
ON public.groups
FOR UPDATE
USING (auth.uid() = created_by);

-- Create policy that allows users to delete groups they created
CREATE POLICY IF NOT EXISTS "Users can delete groups they created"
ON public.groups
FOR DELETE
USING (auth.uid() = created_by);

-- Check if the get_user_groups function exists and create it if not
CREATE OR REPLACE FUNCTION public.get_user_groups(p_user_id UUID)
RETURNS SETOF public.groups
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT g.* FROM public.groups g
  LEFT JOIN public.group_members gm ON g.id = gm.group_id
  WHERE g.created_by = p_user_id OR gm.user_id = p_user_id
  ORDER BY g.created_at DESC;
END;
$$;

-- Make sure profiles table exists and user is in it
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone."
ON public.profiles
FOR SELECT
USING (true);

-- Check if the current user exists in profiles and add if not
DO $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = current_user_id) THEN
    SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
    
    IF current_user_email IS NOT NULL THEN
      INSERT INTO public.profiles (id, email)
      VALUES (current_user_id, current_user_email);
    END IF;
  END IF;
END
$$;
