
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
