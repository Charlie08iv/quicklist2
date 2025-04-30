
import { supabase } from "@/integrations/supabase/client";

// Send a message in the group chat
export const sendGroupChatMessage = async (groupId: string, content: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    // Check if user is member of the group
    const { data: isMember, error: checkError } = await supabase
      .rpc('check_group_membership', {
        p_group_id: groupId,
        p_user_id: userId
      });
    
    if (checkError || !isMember) {
      throw new Error('You are not a member of this group');
    }
    
    // Use type assertion to bypass TypeScript error
    const { data, error } = await (supabase
      .from('group_messages' as any)
      .insert({
        group_id: groupId,
        user_id: userId,
        content: content
      })
      .select(`
        *,
        profile:user_id(username, avatar_url)
      `) as any);
    
    if (error) throw error;
    
    return data ? data[0] : null;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Fetch group chat messages
export const fetchGroupChatMessages = async (groupId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) return [];
    
    // Check if user is member of the group
    const { data: isMember, error: checkError } = await supabase
      .rpc('check_group_membership', {
        p_group_id: groupId,
        p_user_id: userId
      });
    
    if (checkError || !isMember) {
      console.error('You are not a member of this group');
      return [];
    }
    
    // Use type assertion to bypass TypeScript error
    const { data, error } = await (supabase
      .from('group_messages' as any)
      .select(`
        *,
        profile:user_id(username, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false }) as any);
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};
