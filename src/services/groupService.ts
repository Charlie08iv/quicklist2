
import { nanoid } from 'nanoid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invite_code: string;
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: 'owner' | 'member';
}

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
    if (!group) throw new Error('Group not found');
    
    return group;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const fetchUserGroups = async (): Promise<Group[]> => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    if (!userId) return [];
    
    // Fetch groups created by the user
    const { data: groups, error } = await supabase
      .from('groups')
      .select()
      .eq('created_by', userId);

    if (error) throw error;
    return groups || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export const getGroupById = async (groupId: string): Promise<Group | null> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select()
      .eq('id', groupId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching group details:', error);
    return null;
  }
};

export const deleteGroup = async (groupId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting group:', error);
    return false;
  }
};
