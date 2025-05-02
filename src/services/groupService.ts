
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

// Type guard to verify if a value is a Group
const isGroup = (value: any): value is Group => {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.invite_code === 'string'
  );
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
    
    // Use the RPC function to create the group
    const { data, error } = await supabase.rpc('create_group', {
      p_name: name,
      p_invite_code: inviteCode
    });
    
    if (error) {
      console.error('Error creating group with RPC:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create group');
    }
    
    // Convert the JSONB result to a properly typed Group
    const group: Group = {
      id: data.id,
      name: data.name,
      created_at: data.created_at,
      created_by: data.created_by,
      invite_code: data.invite_code
    };
    
    return group;
  } catch (error) {
    console.error('Error creating group:', error);
    // Create a mock group for development if needed
    const mockGroup: Group = {
      id: nanoid(),
      name,
      invite_code: inviteCode,
      created_by: 'mock-user-id',
      created_at: new Date().toISOString()
    };
    
    // In production, rethrow the error
    if (process.env.NODE_ENV !== 'development') {
      throw error;
    }
    
    console.warn('Using mock group data in development mode:', mockGroup);
    return mockGroup;
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
    
    // Use RPC function to join group
    const { data, error } = await supabase.rpc('join_group_by_invite_code', {
      p_invite_code: inviteCode,
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error joining group with RPC:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to join group');
    }
    
    // Convert the JSONB result to a properly typed Group
    const group: Group = {
      id: data.id,
      name: data.name,
      created_at: data.created_at,
      created_by: data.created_by,
      invite_code: data.invite_code
    };
    
    return group;
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
    
    // Use the RPC function to get user groups
    const { data, error } = await supabase.rpc('get_user_groups', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error fetching groups with RPC:', error);
      throw error;
    }
    
    // Process and return the groups with proper typing
    if (!data) {
      return [];
    }
    
    // Ensure we're returning an array of properly typed Group objects
    const typedGroups: Group[] = Array.isArray(data) ? data.map((g: any) => ({
      id: g.id,
      name: g.name,
      created_at: g.created_at,
      created_by: g.created_by,
      invite_code: g.invite_code
    })) : [];
    
    console.log('Fetched user groups successfully:', typedGroups.length);
    return typedGroups;
    
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
    
    // Get group members using the database function
    const { data, error } = await supabase.rpc('get_group_members', {
      p_group_id: groupId
    });
    
    if (error) {
      console.error('Error fetching group members with RPC:', error);
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    return data as GroupMember[];
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
    
    // Use RPC to add friend to group
    const { data, error } = await supabase.rpc('add_friend_to_group', {
      p_group_id: groupId,
      p_email: email,
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error adding friend to group with RPC:', error);
      throw error;
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
    
    // Use RPC to delete a group
    const { data, error } = await supabase.rpc('delete_group', {
      p_group_id: groupId,
      p_user_id: userId
    });
      
    if (error) {
      console.error('Error deleting group with RPC:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Mock functions for wishlist and messaging functionality which will be implemented later
export const fetchWishItems = async () => {
  return { data: [], error: null };
};

export const createWishItem = async () => {
  console.warn('Wishlist functionality is not implemented yet');
  return { data: [], error: null };
};

export const claimWishItem = async () => {
  console.warn('Wishlist functionality is not implemented yet');
  return { data: [], error: null };
};

export const unclaimWishItem = async () => {
  console.warn('Wishlist functionality is not implemented yet');
  return { data: [], error: null };
};

export const fetchGroupMessages = async () => {
  return { data: [], error: null };
};

export const sendGroupMessage = async () => {
  console.warn('Group messages functionality is not implemented yet');
  return { data: [], error: null };
};
