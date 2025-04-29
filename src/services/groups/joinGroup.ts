
import { supabase } from "@/integrations/supabase/client";

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
