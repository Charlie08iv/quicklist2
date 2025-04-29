
import { nanoid } from 'nanoid';
import { supabase } from "@/integrations/supabase/client";

export const createGroup = async (name: string) => {
  const inviteCode = nanoid(8);
  
  try {
    const { data: group, error } = await supabase
      .from('groups')
      .insert({ 
        name, 
        invite_code: inviteCode,
        created_by: (await supabase.auth.getSession()).data.session?.user.id 
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Add the creator as a member of the group
    if (group) {
      await addGroupMember(group.id, group.created_by);
    }
    
    return group;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const joinGroup = async (inviteCode: string) => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    if (!userId) throw new Error('No user ID found');
    
    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select()
      .eq('invite_code', inviteCode)
      .single();
      
    if (groupError) throw groupError;
    
    if (group) {
      // Add the user as a member
      await addGroupMember(group.id, userId);
    }
    
    return group;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const fetchUserGroups = async () => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    if (!userId) return [];
    
    // Get groups where user is a member
    const { data: groupMembers, error: membersError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
      
    if (membersError) throw membersError;
    
    if (!groupMembers || groupMembers.length === 0) {
      return [];
    }
    
    // Get all groups the user is a member of
    const groupIds = groupMembers.map(member => member.group_id);
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds);
      
    if (groupsError) throw groupsError;
    
    return groups || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export const addGroupMember = async (groupId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: userId })
      .select()
      .single();
      
    if (error) {
      // If the error is about unique violation, the user is already a member
      if (error.code === '23505') {
        return { alreadyMember: true };
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding group member:', error);
    throw error;
  }
};

export const createWishItem = async (groupId: string, name: string, description?: string) => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    if (!userId) throw new Error('No user ID found');
    
    const { data, error } = await supabase
      .from('wish_items')
      .insert({ 
        group_id: groupId,
        user_id: userId,
        name,
        description,
        status: 'available'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating wish item:', error);
    throw error;
  }
};

export const fetchGroupWishItems = async (groupId: string) => {
  try {
    const { data, error } = await supabase
      .from('wish_items')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching wish items:', error);
    return [];
  }
};

export const claimWishItem = async (itemId: string) => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    if (!userId) throw new Error('No user ID found');
    
    const { data, error } = await supabase
      .from('wish_items')
      .update({ 
        claimed_by: userId,
        status: 'claimed',
        claimed_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error claiming wish item:', error);
    throw error;
  }
};

export const unclaimWishItem = async (itemId: string) => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    if (!userId) throw new Error('No user ID found');
    
    const { data, error } = await supabase
      .from('wish_items')
      .update({ 
        claimed_by: null,
        status: 'available',
        claimed_at: null
      })
      .eq('id', itemId)
      .eq('claimed_by', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error unclaiming wish item:', error);
    throw error;
  }
};

export const fetchGroupMembers = async (groupId: string) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profiles:user_id (username, avatar_url, email)
      `)
      .eq('group_id', groupId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching group members:', error);
    return [];
  }
};

export const createGroupList = async (groupId: string, name: string, date?: string) => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    if (!userId) throw new Error('No user ID found');
    
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({ 
        name,
        user_id: userId,
        group_id: groupId,
        is_shared: true,
        date: date || null
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating group list:', error);
    throw error;
  }
};
