
import { supabase } from "@/integrations/supabase/client";

export const deleteGroup = async (groupId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Check if the current user is the creator of the group
    const { data: isCreator, error: checkError } = await supabase
      .rpc('user_is_creator_of_group', {
        group_id_param: groupId,
        user_id_param: userId
      });
    
    if (checkError || !isCreator) {
      throw new Error('You do not have permission to delete this group');
    }
    
    // Delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};
