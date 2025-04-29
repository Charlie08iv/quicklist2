
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
    
    // No need to add creator as member separately - we'll use created_by field
    // to determine ownership and membership
    
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
    
    // Since we don't have a separate group_members table,
    // we'll need another approach to track membership
    // For now, we'll just return the group info
    // In the future, you might want to create a group_members table
    // and add the proper SQL migration
    
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
    
    // Only fetch groups that the user created
    // Without a group_members table, we can only reliably show
    // groups the user has created
    const { data: groups, error } = await supabase
      .from('groups')
      .select()
      .eq('created_by', userId);

    if (error) throw error;
    return groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};
