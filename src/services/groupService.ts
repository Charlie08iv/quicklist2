
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
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select()
      .eq('group_id', group.id)
      .eq('user_id', userId)
      .single();
    
    if (!memberCheckError && existingMember) {
      console.log('User is already a member of this group');
      return group;
    }
    
    // Add user to group_members
    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        role: 'member'
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
    
    // Get groups the user is a member of
    const { data: memberGroups, error: memberGroupsError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
    
    if (memberGroupsError) {
      console.error('Error fetching group memberships:', memberGroupsError);
      throw memberGroupsError;
    }
    
    const groupIds = memberGroups?.map(membership => membership.group_id) || [];
    
    // Also include groups created by the user
    const { data: createdGroups, error: createdGroupsError } = await supabase
      .from('groups')
      .select('*')
      .eq('created_by', userId);
      
    if (createdGroupsError) {
      console.error('Error fetching created groups:', createdGroupsError);
      throw createdGroupsError;
    }
    
    // If user has no created groups and is not a member of any groups
    if ((!createdGroups || createdGroups.length === 0) && groupIds.length === 0) {
      console.log('User has no groups');
      return [];
    }
    
    // If user has memberships, fetch those groups too
    let membershipGroups = [];
    if (groupIds.length > 0) {
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);
        
      if (groupsError) {
        console.error('Error fetching membership groups:', groupsError);
      } else {
        membershipGroups = groups || [];
      }
    }
    
    // Combine and deduplicate groups
    const allGroups = [...(createdGroups || []), ...membershipGroups];
    const uniqueGroups = allGroups.filter((group, index, self) =>
      index === self.findIndex((g) => g.id === group.id)
    );
    
    console.log('Fetched user groups:', uniqueGroups);
    return uniqueGroups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export const createWishItem = async (groupId: string, name: string, description?: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const { data: item, error } = await supabase
      .from('wish_items')
      .insert({ 
        group_id: groupId,
        name,
        description,
        created_by: userId,
        status: 'available'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return item;
  } catch (error) {
    console.error('Error creating wish item:', error);
    throw error;
  }
};

export const fetchGroupWishItems = async (groupId: string) => {
  try {
    const { data: items, error } = await supabase
      .from('wish_items')
      .select('*, profiles:claimed_by(username, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return items || [];
  } catch (error) {
    console.error('Error fetching wish items:', error);
    return [];
  }
};

export const claimWishItem = async (itemId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const { data: item, error } = await supabase
      .from('wish_items')
      .update({ 
        status: 'claimed',
        claimed_by: userId,
        claimed_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();
      
    if (error) throw error;
    
    return item;
  } catch (error) {
    console.error('Error claiming wish item:', error);
    throw error;
  }
};

export const unclaimWishItem = async (itemId: string) => {
  try {
    const { data: item, error } = await supabase
      .from('wish_items')
      .update({ 
        status: 'available',
        claimed_by: null,
        claimed_at: null
      })
      .eq('id', itemId)
      .select()
      .single();
      
    if (error) throw error;
    
    return item;
  } catch (error) {
    console.error('Error unclaiming wish item:', error);
    throw error;
  }
};

export const fetchGroupMembers = async (groupId: string) => {
  try {
    const { data: members, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profiles:user_id(id, username, avatar_url, email)
      `)
      .eq('group_id', groupId);
      
    if (error) throw error;
    
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
    // First, find the user by email
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (profileError) {
      throw new Error('User not found');
    }
    
    if (!userProfile) {
      throw new Error('No user found with this email');
    }
    
    // Check if already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select()
      .eq('group_id', groupId)
      .eq('user_id', userProfile.id)
      .single();
    
    if (!memberCheckError && existingMember) {
      throw new Error('User is already a member of this group');
    }
    
    // Add user to group
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userProfile.id,
        role: 'member'
      })
      .select()
      .single();
      
    if (memberError) throw memberError;
    
    return member;
  } catch (error: any) {
    console.error('Error adding friend to group:', error);
    throw error;
  }
};

// Create a group chat message
export const sendGroupChatMessage = async (groupId: string, content: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const { data: message, error } = await supabase
      .from('group_messages')
      .insert({ 
        group_id: groupId,
        user_id: userId,
        content
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get group chat messages
export const fetchGroupChatMessages = async (groupId: string) => {
  try {
    const { data: messages, error } = await supabase
      .from('group_messages')
      .select(`
        *,
        profiles:user_id(username, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) throw error;
    
    return messages || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};
