
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

-- Check if a user can manage a group (admin or creator)
CREATE OR REPLACE FUNCTION public.can_manage_group(p_group_id UUID, p_user_id UUID)
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
    WHERE group_id = p_group_id AND user_id = p_user_id AND role = 'admin'
  );
END;
$$;

-- Add a member to a group
CREATE OR REPLACE FUNCTION public.add_group_member(p_group_id UUID, p_user_id UUID, p_role TEXT DEFAULT 'member')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (p_group_id, p_user_id, p_role)
  ON CONFLICT (group_id, user_id) DO NOTHING;
END;
$$;

-- Get all groups a user is a member of
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

-- Get all members of a group with their profile information
CREATE OR REPLACE FUNCTION public.get_group_members(p_group_id UUID)
RETURNS TABLE(
  id UUID,
  group_id UUID,
  user_id UUID,
  role TEXT,
  created_at TIMESTAMPTZ,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  is_creator BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gm.id, 
    gm.group_id, 
    gm.user_id, 
    gm.role, 
    gm.created_at,
    p.username,
    p.email,
    p.avatar_url,
    g.created_by = gm.user_id AS is_creator
  FROM 
    public.group_members gm
  JOIN 
    public.profiles p ON gm.user_id = p.id
  JOIN
    public.groups g ON gm.group_id = g.id
  WHERE 
    gm.group_id = p_group_id
  UNION
  SELECT
    NULL AS id,
    g.id AS group_id,
    g.created_by AS user_id,
    'admin' AS role,
    g.created_at,
    p.username,
    p.email,
    p.avatar_url,
    TRUE AS is_creator
  FROM
    public.groups g
  JOIN
    public.profiles p ON g.created_by = p.id
  WHERE
    g.id = p_group_id
    AND NOT EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = g.id AND user_id = g.created_by
    );
END;
$$;

-- Create wish item (replacing direct table access)
CREATE OR REPLACE FUNCTION public.create_wish_item(
  p_group_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is member of the group
  IF NOT public.check_group_membership(p_group_id, v_user_id) THEN
    RAISE EXCEPTION 'You are not a member of this group';
  END IF;
  
  -- Insert the wish item
  INSERT INTO public.wish_items(
    group_id,
    name,
    description,
    created_by,
    status
  )
  VALUES (
    p_group_id,
    p_name,
    p_description,
    v_user_id,
    'available'
  )
  RETURNING jsonb_build_object(
    'id', id,
    'name', name,
    'description', description,
    'status', status,
    'created_by', created_by
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Get group wish items 
CREATE OR REPLACE FUNCTION public.get_group_wish_items(p_group_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_items JSONB;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is member of the group
  IF NOT public.check_group_membership(p_group_id, v_user_id) THEN
    RAISE EXCEPTION 'You are not a member of this group';
  END IF;
  
  -- Get wish items with profile information
  SELECT jsonb_agg(jsonb_build_object(
    'id', wi.id,
    'name', wi.name,
    'description', wi.description,
    'status', wi.status,
    'created_by', wi.created_by,
    'claimed_by', wi.claimed_by,
    'claimed_at', wi.claimed_at,
    'creator', jsonb_build_object(
      'username', p.username,
      'avatar_url', p.avatar_url
    )
  ))
  FROM public.wish_items wi
  JOIN public.profiles p ON p.id = wi.created_by
  WHERE wi.group_id = p_group_id
  INTO v_items;
  
  -- Handle case when no items exist
  IF v_items IS NULL THEN
    v_items := '[]'::jsonb;
  END IF;
  
  RETURN v_items;
END;
$$;

-- Claim a wish item
CREATE OR REPLACE FUNCTION public.claim_wish_item(
  p_item_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id UUID;
  v_result JSONB;
BEGIN
  -- Get the group id for the wish item
  SELECT group_id INTO v_group_id FROM public.wish_items WHERE id = p_item_id;
  
  -- Check if user is member of the group
  IF NOT public.check_group_membership(v_group_id, p_user_id) THEN
    RAISE EXCEPTION 'You are not a member of this group';
  END IF;
  
  -- Update the wish item to claimed status
  UPDATE public.wish_items
  SET 
    status = 'claimed',
    claimed_by = p_user_id,
    claimed_at = NOW()
  WHERE 
    id = p_item_id AND 
    status = 'available'
  RETURNING jsonb_build_object(
    'id', id,
    'status', status,
    'claimed_by', claimed_by,
    'claimed_at', claimed_at
  ) INTO v_result;
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Item is not available for claiming';
  END IF;
  
  RETURN v_result;
END;
$$;

-- Unclaim a wish item
CREATE OR REPLACE FUNCTION public.unclaim_wish_item(
  p_item_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update the wish item back to available status
  UPDATE public.wish_items
  SET 
    status = 'available',
    claimed_by = NULL,
    claimed_at = NULL
  WHERE 
    id = p_item_id AND 
    claimed_by = p_user_id
  RETURNING jsonb_build_object(
    'id', id,
    'status', status
  ) INTO v_result;
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'You did not claim this item or it does not exist';
  END IF;
  
  RETURN v_result;
END;
$$;

-- Send a group chat message
CREATE OR REPLACE FUNCTION public.send_group_message(
  p_group_id UUID,
  p_content TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is member of the group
  IF NOT public.check_group_membership(p_group_id, v_user_id) THEN
    RAISE EXCEPTION 'You are not a member of this group';
  END IF;
  
  -- Insert the message
  INSERT INTO public.group_messages(
    group_id,
    user_id,
    content
  )
  VALUES (
    p_group_id,
    v_user_id,
    p_content
  )
  RETURNING id INTO v_result;
  
  -- Get the message with profile info
  SELECT jsonb_build_object(
    'id', gm.id,
    'content', gm.content,
    'created_at', gm.created_at,
    'user_id', gm.user_id,
    'profile', jsonb_build_object(
      'username', p.username,
      'avatar_url', p.avatar_url
    )
  )
  FROM public.group_messages gm
  JOIN public.profiles p ON p.id = gm.user_id
  WHERE gm.id = (v_result->>'id')::uuid
  INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Get group chat messages
CREATE OR REPLACE FUNCTION public.get_group_messages(p_group_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_messages JSONB;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is member of the group
  IF NOT public.check_group_membership(p_group_id, v_user_id) THEN
    RAISE EXCEPTION 'You are not a member of this group';
  END IF;
  
  -- Get messages with profile information
  SELECT jsonb_agg(jsonb_build_object(
    'id', gm.id,
    'content', gm.content,
    'created_at', gm.created_at,
    'user_id', gm.user_id,
    'profile', jsonb_build_object(
      'username', p.username,
      'avatar_url', p.avatar_url
    )
  ) ORDER BY gm.created_at DESC)
  FROM public.group_messages gm
  JOIN public.profiles p ON p.id = gm.user_id
  WHERE gm.group_id = p_group_id
  INTO v_messages;
  
  -- Handle case when no messages exist
  IF v_messages IS NULL THEN
    v_messages := '[]'::jsonb;
  END IF;
  
  RETURN v_messages;
END;
$$;
