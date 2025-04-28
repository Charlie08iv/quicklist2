
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
    
    // Add creator as a member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ 
        group_id: group.id, 
        user_id: group.created_by 
      });
      
    if (memberError) throw memberError;
    
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
    
    // Add user to group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ 
        group_id: group.id, 
        user_id: userId 
      });
      
    if (memberError) throw memberError;
    
    return group;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const fetchUserGroups = async () => {
  try {
    const { data: groups, error } = await supabase
      .from('groups')
      .select('*, group_members(user_id)')
      .or(`created_by.eq.${(await supabase.auth.getSession()).data.session?.user.id},group_members(user_id.eq.${(await supabase.auth.getSession()).data.session?.user.id})`);

    if (error) throw error;
    return groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};
