
import { supabase } from "@/integrations/supabase/client";

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
