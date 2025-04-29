
import { supabase } from "@/integrations/supabase/client";

export const addFriendToGroup = async (groupId: string, email: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Check if current user has permission to add members
    const { data: hasPermission, error: permError } = await supabase
      .rpc('can_manage_group', {
        p_group_id: groupId,
        p_user_id: userId
      });
    
    if (permError || !hasPermission) {
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
    
    // Add the user to the group
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
  } catch (error) {
    console.error('Error adding friend to group:', error);
    throw error;
  }
};
