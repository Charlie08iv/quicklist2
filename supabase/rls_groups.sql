
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

-- Create tables if they don't exist yet
-- Create groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  invite_code TEXT UNIQUE NOT NULL
);

-- Create group_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (group_id, user_id)
);

-- Enable RLS on group_members table
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins and creators to view members
CREATE POLICY IF NOT EXISTS "Group admins can view members"
ON public.group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = group_id AND created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_id AND user_id = auth.uid() AND role = 'admin'
  )
);

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
