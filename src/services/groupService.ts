
import { nanoid } from 'nanoid';
import { supabase } from "@/integrations/supabase/client";

export const createGroup = async (name: string) => {
  const inviteCode = nanoid(8);
  
  try {
    console.log('Creating group with name:', name, 'and invite code:', inviteCode);
    
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.error('User is not authenticated');
      throw new Error('User not authenticated');
    }
    
    const { data: group, error } = await supabase
      .from('groups')
      .insert({ 
        name, 
        invite_code: inviteCode,
        created_by: userId
      })
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error creating group:', error);
      throw error;
    }
    
    console.log('Group created successfully:', group);
    return group;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const joinGroup = async (inviteCode: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.error('User is not authenticated');
      throw new Error('No user ID found');
    }
    
    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select()
      .eq('invite_code', inviteCode)
      .single();
      
    if (groupError) {
      console.error('Error finding group with invite code:', inviteCode, groupError);
      throw groupError;
    }
    
    console.log('Found group to join:', group);
    
    // For now, we'll just return the group since we don't have a group_members table
    // In the future, this would insert a record into the group_members table
    return group;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const fetchUserGroups = async () => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.log('No user ID found, returning empty groups array');
      return [];
    }
    
    console.log('Fetching groups for user:', userId);
    
    // For now, just fetch groups created by the user
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .eq('created_by', userId);
      
    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      throw groupsError;
    }
    
    console.log('Fetched user groups:', groups);
    return groups || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

// The following functions are mocks since we don't have the actual tables yet
export const createWishItem = async (groupId: string, name: string, description?: string) => {
  try {
    // Mock implementation until we have the actual table
    console.log(`Creating wish item: ${name} for group: ${groupId}`);
    return {
      id: nanoid(),
      group_id: groupId,
      name,
      description,
      status: 'available',
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating wish item:', error);
    throw error;
  }
};

export const fetchGroupWishItems = async (groupId: string) => {
  try {
    // Mock implementation until we have the actual table
    console.log(`Fetching wish items for group: ${groupId}`);
    return [];
  } catch (error) {
    console.error('Error fetching wish items:', error);
    return [];
  }
};

export const claimWishItem = async (itemId: string) => {
  try {
    // Mock implementation until we have the actual table
    console.log(`Claiming wish item: ${itemId}`);
    return {
      id: itemId,
      status: 'claimed',
      claimed_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error claiming wish item:', error);
    throw error;
  }
};

export const unclaimWishItem = async (itemId: string) => {
  try {
    // Mock implementation until we have the actual table
    console.log(`Unclaiming wish item: ${itemId}`);
    return {
      id: itemId,
      status: 'available',
      claimed_at: null
    };
  } catch (error) {
    console.error('Error unclaiming wish item:', error);
    throw error;
  }
};

export const fetchGroupMembers = async (groupId: string) => {
  try {
    // For now, just fetch the creator of the group as a member
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select(`
        *,
        profiles:created_by(username, avatar_url, email)
      `)
      .eq('id', groupId)
      .single();
      
    if (groupError) throw groupError;
    
    // Return the creator as the only member for now
    return group ? [
      {
        user_id: group.created_by,
        group_id: group.id,
        profiles: group.profiles
      }
    ] : [];
  } catch (error) {
    console.error('Error fetching group members:', error);
    return [];
  }
};

export const createGroupList = async (groupId: string, name: string, date?: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
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
