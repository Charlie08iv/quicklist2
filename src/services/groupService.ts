
import { nanoid } from 'nanoid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createGroup = async (name: string) => {
  const inviteCode = nanoid(8);
  
  try {
    console.log('Creating group with name:', name, 'and invite code:', inviteCode);
    
    // Get current session
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
    
    // Add creator as a member of the group with a custom function call
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
    
    // Check if the user is already a member of this group (using stored function)
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
    
    // Add user to group (using stored function)
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
  } catch (error: any) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const fetchUserGroups = async () => {
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.log('No user ID found, returning empty groups array');
      return [];
    }
    
    console.log('Fetching groups for user:', userId);
    
    // Get user's groups (using a stored procedure)
    const { data: groups, error } = await supabase
      .rpc('get_user_groups', {
        p_user_id: userId
      });
    
    if (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
    
    console.log('Fetched user groups:', groups);
    return groups || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

// Wishlist functions - We'll use edge functions for this

// Create a wish item using edge function
export const createWishItem = async (groupId: string, name: string, description?: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const userId = sessionData.session?.user?.id;
    
    if (!token || !userId) throw new Error('User not authenticated');
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create_wish_item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        group_id: groupId,
        name,
        description: description || null,
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create wish item');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating wish item:', error);
    throw error;
  }
};

// Fetch group wish items using edge function
export const fetchGroupWishItems = async (groupId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const userId = sessionData.session?.user?.id;
    
    if (!token || !userId) return [];
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get_group_wish_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        group_id: groupId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error in response:', errorData);
      return [];
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching wish items:', error);
    return [];
  }
};

// Claim wish item using edge function
export const claimWishItem = async (itemId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const userId = sessionData.session?.user?.id;
    
    if (!token || !userId) throw new Error('User not authenticated');
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claim_wish_item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        item_id: itemId,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to claim wish item');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error claiming wish item:', error);
    throw error;
  }
};

// Unclaim wish item using edge function
export const unclaimWishItem = async (itemId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const userId = sessionData.session?.user?.id;
    
    if (!token || !userId) throw new Error('User not authenticated');
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unclaim_wish_item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        item_id: itemId,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to unclaim wish item');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unclaiming wish item:', error);
    throw error;
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
    
    // Check if user is a member of this group (using stored function)
    const { data: isMember, error: checkError } = await supabase
      .rpc('check_group_membership', {
        p_group_id: groupId,
        p_user_id: userId
      });
    
    if (checkError) {
      console.error('Error checking membership:', checkError);
      throw checkError;
    }
    
    if (!isMember) {
      throw new Error('You are not a member of this group');
    }
    
    // Get group members (using stored function)
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

// New function to add friend to group
export const addFriendToGroup = async (groupId: string, email: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.error('User is not authenticated');
      throw new Error('User not authenticated');
    }
    
    // Check if the current user has permission to add members to this group
    const { data: hasPermission, error: permError } = await supabase
      .rpc('can_manage_group', {
        p_group_id: groupId,
        p_user_id: userId
      });
    
    if (permError) {
      console.error('Error checking permissions:', permError);
      throw permError;
    }
    
    if (!hasPermission) {
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
    
    // Add the user to the group (using stored function)
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
  } catch (error: any) {
    console.error('Error adding friend to group:', error);
    throw error;
  }
};

// Group chat functionality using edge function
export const sendGroupChatMessage = async (groupId: string, content: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const userId = sessionData.session?.user?.id;
    
    if (!token || !userId) throw new Error('User not authenticated');
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send_group_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        group_id: groupId,
        content: content
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Function for fetching group chat messages with edge function
export const fetchGroupChatMessages = async (groupId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const userId = sessionData.session?.user?.id;
    
    if (!token || !userId) return [];
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get_group_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        group_id: groupId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error in response:', errorData);
      return [];
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};
