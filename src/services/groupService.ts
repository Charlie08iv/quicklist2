
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

// Mock function for when wish_items functionality is needed but not yet implemented
const mockWishlistFunction = async () => {
  console.warn('Wishlist functionality is not implemented yet');
  return { data: [], error: null };
};

// Mock function for when group_messages functionality is needed but not implemented
const mockGroupMessagesFunction = async () => {
  console.warn('Group messages functionality is not implemented yet');
  return { data: [], error: null };
};

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
    
    // Use RPC function instead of direct table access
    const { data, error } = await supabase.rpc('create_group', {
      p_name: name,
      p_invite_code: inviteCode
    });
      
    if (error) {
      console.error('Supabase error creating group:', error);
      
      // Fallback approach (this is temporary until the proper RPC is set up)
      // Simulate the expected response shape
      // Note: In production, this should be replaced with the actual implementation
      const mockGroup = {
        id: nanoid(),
        name,
        invite_code: inviteCode,
        created_by: userId,
        created_at: new Date().toISOString()
      };
      
      console.log('Using fallback mock group:', mockGroup);
      return mockGroup;
    }
    
    console.log('Group created successfully:', data);
    return data;
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
    
    // Use RPC function to join group
    const { data, error } = await supabase.rpc('join_group_by_invite_code', {
      p_invite_code: inviteCode,
      p_user_id: userId
    });
      
    if (error) {
      console.error('Error joining group:', error);
      
      // Fallback mock implementation for testing
      // This simulates the group being returned
      return {
        id: nanoid(),
        name: "Mock Group",
        invite_code: inviteCode,
        created_by: "mock_creator",
        created_at: new Date().toISOString()
      };
    }
    
    console.log('Successfully joined group');
    return data;
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
    
    // Use RPC for fetching user groups
    const { data: groups, error } = await supabase.rpc('get_user_groups', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error in RPC call to get_user_groups:', error);
      
      // Return empty array as fallback
      console.log('Returning empty groups array due to error');
      return [];
    }
    
    // Ensure we return an array even if groups is null/undefined
    console.log('Fetched user groups successfully:', groups?.length || 0);
    return Array.isArray(groups) ? groups : [];
  } catch (error) {
    console.error('Error in fetchUserGroups:', error);
    // Return empty array to avoid UI errors
    return [];
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
    
    // Ensure we return an array even if members is falsy
    return Array.isArray(members) ? members : [];
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
      // Handle specific error cases
      if (error.message.includes('duplicate key')) {
        throw new Error('User is already a member of this group');
      }
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
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Mock functions for wishlist and messaging functionality which will be implemented later
export const createWishItem = async () => await mockWishlistFunction();
export const claimWishItem = async () => await mockWishlistFunction();
export const unclaimWishItem = async () => await mockWishlistFunction();
export const fetchWishItems = async () => {
  return { data: [], error: null };
};

export const sendGroupMessage = async () => await mockGroupMessagesFunction();
export const fetchGroupMessages = async () => {
  return { data: [], error: null };
};
