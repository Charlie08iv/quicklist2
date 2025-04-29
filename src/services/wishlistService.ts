
import { supabase } from "@/integrations/supabase/client";

// Create a wish item for a group
export const createWishItem = async (groupId: string, name: string, description?: string) => {
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
    
    // Use 'from' with type assertion to bypass TypeScript error
    const { data, error } = await (supabase
      .from('wish_items' as any)
      .insert({
        group_id: groupId,
        name: name,
        description: description || null,
        created_by: userId,
        status: 'available'
      })
      .select() as any);
    
    if (error) throw error;
    
    return data ? data[0] : null;
  } catch (error) {
    console.error('Error creating wish item:', error);
    throw error;
  }
};

// Fetch group wish items with type assertions
export const fetchGroupWishItems = async (groupId: string) => {
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
      .from('wish_items' as any)
      .select(`
        *,
        creator:created_by(username, avatar_url)
      `)
      .eq('group_id', groupId) as any);
    
    if (error) {
      console.error('Error fetching wish items:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching wish items:', error);
    return [];
  }
};

// Claim wish item with type assertions
export const claimWishItem = async (itemId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    // First get the item to check permissions
    const { data: item, error: getError } = await (supabase
      .from('wish_items' as any)
      .select('group_id, status')
      .eq('id', itemId)
      .single() as any);
    
    if (getError || !item) {
      throw new Error('Item not found');
    }
    
    if (item.status !== 'available') {
      throw new Error('Item is not available for claiming');
    }
    
    // Check if user is member of the group
    const { data: isMember, error: checkError } = await supabase
      .rpc('check_group_membership', {
        p_group_id: item.group_id,
        p_user_id: userId
      });
    
    if (checkError || !isMember) {
      throw new Error('You are not a member of this group');
    }
    
    // Update the item
    const { data, error } = await (supabase
      .from('wish_items' as any)
      .update({
        status: 'claimed',
        claimed_by: userId,
        claimed_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('status', 'available')
      .select() as any);
    
    if (error) throw error;
    
    return data ? data[0] : null;
  } catch (error) {
    console.error('Error claiming wish item:', error);
    throw error;
  }
};

// Unclaim wish item with type assertions
export const unclaimWishItem = async (itemId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    // Update the item
    const { data, error } = await (supabase
      .from('wish_items' as any)
      .update({
        status: 'available',
        claimed_by: null,
        claimed_at: null
      })
      .eq('id', itemId)
      .eq('claimed_by', userId)
      .select() as any);
    
    if (error) throw error;
    
    return data ? data[0] : null;
  } catch (error) {
    console.error('Error unclaiming wish item:', error);
    throw error;
  }
};
