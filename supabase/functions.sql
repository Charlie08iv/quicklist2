
-- Only add this function if it doesn't exist already
-- Check if a user is a member of a group
CREATE OR REPLACE FUNCTION public.check_group_membership(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = p_group_id AND created_by = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = p_group_id AND user_id = p_user_id
  );
END;
$$;

-- Create group function (helper for creating groups)
CREATE OR REPLACE FUNCTION public.create_group(p_name TEXT, p_invite_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_result jsonb;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Insert the new group
  INSERT INTO public.groups (name, invite_code, created_by)
  VALUES (p_name, p_invite_code, v_user_id)
  RETURNING id INTO v_group_id;
  
  -- Add the creator as an admin member
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'admin');
  
  -- Return the created group
  SELECT jsonb_build_object(
    'id', g.id,
    'name', g.name,
    'created_at', g.created_at,
    'created_by', g.created_by,
    'invite_code', g.invite_code
  ) INTO v_result
  FROM public.groups g
  WHERE g.id = v_group_id;
  
  RETURN v_result;
END;
$$;

-- Join group by invite code function
CREATE OR REPLACE FUNCTION public.join_group_by_invite_code(p_invite_code TEXT, p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id UUID;
  v_result jsonb;
BEGIN
  -- Find the group by invite code
  SELECT id INTO v_group_id
  FROM public.groups
  WHERE invite_code = p_invite_code;
  
  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = v_group_id AND user_id = p_user_id
  ) THEN
    -- Already a member, just return the group
    SELECT jsonb_build_object(
      'id', g.id,
      'name', g.name,
      'created_at', g.created_at,
      'created_by', g.created_by,
      'invite_code', g.invite_code
    ) INTO v_result
    FROM public.groups g
    WHERE g.id = v_group_id;
    
    RETURN v_result;
  END IF;
  
  -- Add user to group
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, p_user_id, 'member');
  
  -- Return the joined group
  SELECT jsonb_build_object(
    'id', g.id,
    'name', g.name,
    'created_at', g.created_at, 
    'created_by', g.created_by,
    'invite_code', g.invite_code
  ) INTO v_result
  FROM public.groups g
  WHERE g.id = v_group_id;
  
  RETURN v_result;
END;
$$;

-- Delete group function
CREATE OR REPLACE FUNCTION public.delete_group(p_group_id UUID, p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is the creator of the group
  IF NOT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = p_group_id AND created_by = p_user_id
  ) THEN
    RAISE EXCEPTION 'You do not have permission to delete this group';
  END IF;
  
  -- Delete the group
  DELETE FROM public.groups
  WHERE id = p_group_id;
  
  RETURN TRUE;
END;
$$;

-- Add friend to group function
CREATE OR REPLACE FUNCTION public.add_friend_to_group(p_group_id UUID, p_email TEXT, p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_friend_id UUID;
BEGIN
  -- Check if current user has permission to add members
  IF NOT EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = p_group_id AND created_by = p_user_id
  ) AND NOT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = p_group_id AND user_id = p_user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'You do not have permission to add members to this group';
  END IF;
  
  -- Find the user by email
  SELECT id INTO v_friend_id
  FROM public.profiles
  WHERE email = p_email;
  
  IF v_friend_id IS NULL THEN
    RAISE EXCEPTION 'User not found with this email';
  END IF;
  
  -- Add the user to the group
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (p_group_id, v_friend_id, 'member');
  
  RETURN TRUE;
END;
$$;
