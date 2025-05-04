
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

// Helper function to parse JSON response from RPC functions
const parseJsonResponse = (data: any): any => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  return data;
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
    
    // Call the create_group RPC function with the current parameters
    const { data, error } = await supabase.rpc(
      'create_group', 
      { 
        p_name: name,
        p_invite_code: inviteCode
      }
    );
    
    if (error) {
      console.error('Error creating group with RPC:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create group');
    }
    
    // Parse the JSON result returned by the RPC function
    const parsedData = parseJsonResponse(data);
    
    // Convert the result to a properly typed Group
    const group: Group = {
      id: parsedData.id,
      name: parsedData.name,
      created_at: parsedData.created_at,
      created_by: parsedData.created_by,
      invite_code: parsedData.invite_code
    };
    
    return group;
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
    
    // Use RPC function to join group
    const { data, error } = await supabase.rpc(
      'join_group_by_invite_code', 
      {
        p_invite_code: inviteCode,
        p_user_id: userId
      }
    );
    
    if (error) {
      console.error('Error joining group with RPC:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to join group');
    }
    
    // Parse the JSON result returned by the RPC function
    const parsedData = parseJsonResponse(data);
    
    // Convert the result to a properly typed Group
    const group: Group = {
      id: parsedData.id,
      name: parsedData.name,
      created_at: parsedData.created_at,
      created_by: parsedData.created_by,
      invite_code: parsedData.invite_code
    };
    
    return group;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const fetchUserGroups = async (): Promise<Group[]> => {
  try {
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
    
    // Use the RPC function to get user groups
    const { data, error } = await supabase.rpc(
      'get_user_groups', 
      {
        p_user_id: userId
      }
    );
    
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
    
    return typedGroups;
    
  } catch (error) {
    console.error('Error in fetchUserGroups:', error);
    throw error;
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
    const { data, error } = await supabase.rpc(
      'get_group_members', 
      {
        p_group_id: groupId
      }
    );
    
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
    const { data, error } = await supabase.rpc(
      'add_friend_to_group', 
      {
        p_group_id: groupId,
        p_email: email,
        p_user_id: userId
      }
    );
    
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
    const { data, error } = await supabase.rpc(
      'delete_group', 
      {
        p_group_id: groupId,
        p_user_id: userId
      }
    );
      
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
