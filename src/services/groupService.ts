
import { nanoid } from 'nanoid';
import { supabase } from "@/integrations/supabase/client";

export const createGroup = async (name: string) => {
  const inviteCode = nanoid(8);
  
  try {
    console.log('Creating group with name:', name, 'and invite code:', inviteCode);
    
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw sessionError;
    }
    
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
    
    // Add creator as a member of the group
    const { error: memberError } = await supabase
      .rpc('add_group_member', {
        p_group_id: group.id,
        p_user_id: userId,
        p_role: 'admin'
      });
      
    if (memberError) {
      console.error('Error adding creator as member:', memberError);
      // Don't throw here, the group was already created
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
    // Get current session
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
      throw new Error('Invalid invite code');
    }
    
    console.log('Found group to join:', group);
    
    // Check if the user is already a member of this group
    const { data: isMember, error: checkError } = await supabase
      .rpc('check_group_membership', {
        p_group_id: group.id,
        p_user_id: userId
      });
    
    if (checkError) {
      console.error('Error checking membership:', checkError);
      throw checkError;
    }
    
    if (isMember) {
      console.log('User is already a member of this group');
      return group;
    }
    
    // Add user to group
    const { error: joinError } = await supabase
      .rpc('add_group_member', {
        p_group_id: group.id,
        p_user_id: userId,
        p_role: 'member'
      });
      
    if (joinError) {
      console.error('Error joining group:', joinError);
      throw joinError;
    }
    
    console.log('Successfully joined group');
    return group;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const fetchUserGroups = async () => {
  try {
    console.log('Starting fetchUserGroups function');
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw sessionError;
    }
    
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.log('No user ID found, returning empty groups array');
      return [];
    }
    
    console.log('Fetching groups for user ID:', userId);
    
    // First check if the user exists in profiles
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.log('User profile not found, they might need to be added to profiles table');
    }
    
    // Debug: Direct query to check all groups to see if RLS is working
    const { data: allGroups, error: allGroupsError } = await supabase
      .from('groups')
      .select('*')
      .limit(20);
      
    console.log('Direct groups query (check RLS):', { allGroups, allGroupsError });
    
    // Get user's groups using the database function
    const { data: groups, error } = await supabase
      .rpc('get_user_groups', {
        p_user_id: userId
      });
    
    if (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
    
    console.log('Fetched user groups:', groups || []);
    return groups || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error; // Let the component handle the error
  }
};

export const fetchGroupMembers = async (groupId: string) => {
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.error('User is not authenticated');
      throw new Error('User not authenticated');
    }
    
    // Get group members using the database function
    const { data: members, error } = await supabase
      .rpc('get_group_members', {
        p_group_id: groupId
      });
    
    if (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }
    
    return members || [];
  } catch (error) {
    console.error('Error fetching group members:', error);
    return [];
  }
};

export const addFriendToGroup = async (groupId: string, email: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Check if current user has permission to add members
    const { data: hasPermission, error: permError } = await supabase
      .rpc('can_manage_group', {
        p_group_id: groupId,
        p_user_id: userId
      });
    
    if (permError || !hasPermission) {
      throw new Error('You do not have permission to add members to this group');
    }
    
    // Find the user by email
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (profileError || !userProfile) {
      throw new Error('User not found with this email');
    }
    
    // Add the user to the group
    const { error: addError } = await supabase
      .rpc('add_group_member', {
        p_group_id: groupId,
        p_user_id: userProfile.id,
        p_role: 'member'
      });
    
    if (addError) {
      if (addError.message.includes('duplicate key')) {
        throw new Error('User is already a member of this group');
      }
      throw addError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding friend to group:', error);
    throw error;
  }
};

export const createGroupList = async (groupId: string, name: string, date?: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) throw new Error('No user ID found');
    
    const { data: listData, error } = await supabase
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
    
    return listData;
  } catch (error) {
    console.error('Error creating group list:', error);
    throw error;
  }
};

// Delete a group (only for group creators)
export const deleteGroup = async (groupId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Check if the current user is the creator of the group
    const { data: isCreator, error: checkError } = await supabase
      .rpc('user_is_creator_of_group', {
        group_id_param: groupId,
        user_id_param: userId
      });
    
    if (checkError || !isCreator) {
      throw new Error('You do not have permission to delete this group');
    }
    
    // Delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};
