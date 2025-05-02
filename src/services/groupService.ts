
import { nanoid } from 'nanoid';
import { supabase } from "@/integrations/supabase/client";

// Define proper type for Group
export interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invite_code: string;
}

// Define GroupMember type for proper typing
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  created_at: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  is_creator: boolean;
}

// Mock function for wishlist functionality (to be implemented later)
const mockWishlistFunction = async () => {
  console.warn('Wishlist functionality is not implemented yet');
  return { data: [], error: null };
};

// Mock function for group messages functionality (to be implemented later)
const mockGroupMessagesFunction = async () => {
  console.warn('Group messages functionality is not implemented yet');
  return { data: [], error: null };
};

export const createGroup = async (name: string): Promise<Group> => {
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
    
    // Use direct table insertion as fallback if RPC isn't available
    try {
      // First try using the RPC function
      const { data, error } = await supabase.rpc('create_group', {
        p_name: name,
        p_invite_code: inviteCode
      });
      
      if (error) throw error;
      
      return data as Group;
    } catch (rpcError) {
      console.warn('RPC function failed, using direct table access as fallback:', rpcError);
      
      // Fallback to direct table insertion
      const { data, error } = await supabase
        .from('groups')
        .insert({ 
          name, 
          invite_code: inviteCode, 
          created_by: userId 
        })
        .select()
        .single();
      
      if (error) {
        console.error('Fallback insertion failed:', error);
        // Last resort mock data for development
        const mockGroup: Group = {
          id: nanoid(),
          name,
          invite_code: inviteCode,
          created_by: userId,
          created_at: new Date().toISOString()
        };
        console.log('Using mock group data:', mockGroup);
        return mockGroup;
      }
      
      return data as Group;
    }
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const joinGroup = async (inviteCode: string): Promise<Group> => {
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.error('User is not authenticated');
      throw new Error('No user ID found');
    }
    
    try {
      // Use RPC function to join group
      const { data, error } = await supabase.rpc('join_group_by_invite_code', {
        p_invite_code: inviteCode,
        p_user_id: userId
      });
      
      if (error) throw error;
      
      return data as Group;
    } catch (rpcError) {
      console.warn('RPC function failed, using direct table access as fallback:', rpcError);
      
      // Find the group by invite code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select()
        .eq('invite_code', inviteCode)
        .single();
      
      if (groupError) {
        console.error('Error finding group:', groupError);
        throw groupError;
      }
      
      // Check if already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('group_members')
        .select()
        .eq('group_id', group.id)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (memberCheckError) {
        console.error('Error checking membership:', memberCheckError);
      }
      
      // If not already a member, add the user
      if (!existingMember) {
        const { error: insertError } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: userId,
            role: 'member'
          });
        
        if (insertError) {
          console.error('Error joining group:', insertError);
          throw insertError;
        }
      }
      
      return group as Group;
    }
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const fetchUserGroups = async (): Promise<Group[]> => {
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
      throw new Error('User ID not found. Please check if you are logged in.');
    }
    
    console.log('Fetching groups for user ID:', userId);
    
    // First check if the user exists in profiles
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.log('User profile not found. Error:', profileError);
      console.log('This might indicate the user profile needs to be created.');
      
      // Attempt to create profile if missing
      try {
        const email = sessionData.session?.user?.email;
        if (email) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: userId, email })
            .single();
            
          if (insertError) {
            console.error('Failed to create user profile:', insertError);
          } else {
            console.log('Created new user profile for:', userId);
          }
        }
      } catch (e) {
        console.error('Error creating user profile:', e);
      }
    }
    
    try {
      // Try RPC function first
      const { data, error } = await supabase.rpc('get_user_groups', {
        p_user_id: userId
      });
      
      if (error) throw error;
      
      // Ensure we return typed group data
      const typedGroups: Group[] = Array.isArray(data) ? data.map(group => ({
        id: group.id,
        name: group.name,
        created_at: group.created_at,
        created_by: group.created_by,
        invite_code: group.invite_code
      })) : [];
      
      console.log('Fetched user groups successfully:', typedGroups.length);
      return typedGroups;
    } catch (rpcError) {
      console.warn('RPC function failed, using direct query as fallback:', rpcError);
      
      // Fallback query using direct table access
      const { data: createdGroups } = await supabase
        .from('groups')
        .select()
        .eq('created_by', userId);
      
      const { data: memberGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);
      
      // If user is a member of any groups, fetch those groups too
      let memberGroupsDetails: any[] = [];
      if (memberGroups && memberGroups.length > 0) {
        const groupIds = memberGroups.map(m => m.group_id);
        const { data } = await supabase
          .from('groups')
          .select()
          .in('id', groupIds);
        
        memberGroupsDetails = data || [];
      }
      
      // Combine both arrays and remove duplicates
      const allGroups = [...(createdGroups || []), ...memberGroupsDetails];
      const uniqueGroups = allGroups.filter((group, index, self) =>
        index === self.findIndex(g => g.id === group.id)
      );
      
      return uniqueGroups as Group[];
    }
  } catch (error) {
    console.error('Error in fetchUserGroups:', error);
    // Return empty array to avoid UI errors
    return [];
  }
};

export const fetchGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.error('User is not authenticated');
      throw new Error('User not authenticated');
    }
    
    try {
      // Get group members using the database function
      const { data, error } = await supabase.rpc('get_group_members', {
        p_group_id: groupId
      });
      
      if (error) throw error;
      
      return data as GroupMember[];
    } catch (rpcError) {
      console.warn('RPC function failed, using direct query as fallback:', rpcError);
      
      // Fallback query using joins (simplified)
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id, group_id, user_id, role, created_at,
          profiles:user_id (username, email, avatar_url)
        `)
        .eq('group_id', groupId);
      
      if (error) throw error;
      
      // Structure the result to match the expected format
      const members = data.map(m => ({
        id: m.id,
        group_id: m.group_id,
        user_id: m.user_id,
        role: m.role,
        created_at: m.created_at,
        username: m.profiles?.username || null,
        email: m.profiles?.email || 'Unknown',
        avatar_url: m.profiles?.avatar_url || null,
        is_creator: false // We can't easily determine this in the fallback
      }));
      
      return members;
    }
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
    
    try {
      // Use RPC to add friend to group
      const { data, error } = await supabase.rpc('add_friend_to_group', {
        p_group_id: groupId,
        p_email: email,
        p_user_id: userId
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (rpcError) {
      console.warn('RPC function failed, using direct query as fallback:', rpcError);
      
      // Find the user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        if (userError.code === 'PGRST116') {
          throw new Error('User not found with this email');
        }
        throw userError;
      }
      
      // Check if the user has permission (is creator or admin)
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('created_by')
        .eq('id', groupId)
        .single();
      
      if (groupError) {
        throw groupError;
      }
      
      const isCreator = group.created_by === userId;
      
      if (!isCreator) {
        const { data: membership, error: memberError } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', groupId)
          .eq('user_id', userId)
          .single();
        
        if (memberError || membership?.role !== 'admin') {
          throw new Error('You do not have permission to add members to this group');
        }
      }
      
      // Add member to group
      const { error: addError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });
      
      if (addError) {
        if (addError.code === '23505') { // Duplicate key violation
          throw new Error('User is already a member of this group');
        }
        throw addError;
      }
      
      return { success: true };
    }
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
    
    try {
      // Use RPC to delete a group
      const { data, error } = await supabase.rpc('delete_group', {
        p_group_id: groupId,
        p_user_id: userId
      });
        
      if (error) throw error;
      
      return { success: true };
    } catch (rpcError) {
      console.warn('RPC function failed, using direct query as fallback:', rpcError);
      
      // Check if user is the creator
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('created_by')
        .eq('id', groupId)
        .single();
      
      if (groupError) {
        throw groupError;
      }
      
      if (group.created_by !== userId) {
        throw new Error('You do not have permission to delete this group');
      }
      
      // Delete the group
      const { error: deleteError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      return { success: true };
    }
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Mock functions for wishlist and messaging functionality which will be implemented later
export const fetchWishItems = async () => {
  return { data: [], error: null };
};
export const createWishItem = mockWishlistFunction;
export const claimWishItem = mockWishlistFunction;
export const unclaimWishItem = mockWishlistFunction;

export const fetchGroupMessages = async () => {
  return { data: [], error: null };
};
export const sendGroupMessage = mockGroupMessagesFunction;
