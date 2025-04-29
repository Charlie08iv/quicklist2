
import { supabase } from "@/integrations/supabase/client";

export const fetchUserGroups = async () => {
  try {
    console.log('Starting fetchUserGroups function');
    
    // Get current session with fresh check
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw new Error(`Session error: ${sessionError.message}. Please try logging in again.`);
    }
    
    if (!sessionData.session) {
      console.log('No active session found, returning empty groups array');
      throw new Error('No active session found. Please log in to access your groups.');
    }
    
    const userId = sessionData.session.user.id;
    
    if (!userId) {
      console.log('No user ID found in session, returning empty groups array');
      throw new Error('User ID not found. Please try logging in again.');
    }
    
    console.log('Fetching groups for user ID:', userId);
    
    // Ensure user exists in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking profile:', profileError);
      // Continue anyway, we'll try to create the profile below if needed
    }
    
    if (!profileData) {
      console.log('User profile not found. Creating new profile.');
      // Create profile for the user
      const email = sessionData.session.user.email;
      if (email) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, email })
          .single();
          
        if (insertError) {
          console.error('Failed to create user profile:', insertError);
        } else {
          console.log('Created new user profile for:', userId);
        }
      }
    }
    
    // Get user's groups using the database function
    const { data: groups, error } = await supabase
      .rpc('get_user_groups', {
        p_user_id: userId
      });
    
    if (error) {
      // Try a direct query if the RPC fails
      console.error('Error fetching user groups with RPC:', error);
      console.log('Attempting direct query as fallback...');
      
      const { data: directGroups, error: directError } = await supabase
        .from('groups')
        .select('*')
        .or(`created_by.eq.${userId},id.in.(select group_id from group_members where user_id = '${userId}')`)
        .order('created_at', { ascending: false });
        
      if (directError) {
        console.error('Fallback query also failed:', directError);
        throw new Error(`Error fetching groups: ${directError.message}`);
      }
      
      console.log('Fallback query succeeded, found groups:', directGroups?.length || 0);
      return directGroups || [];
    }
    
    console.log('Fetched user groups successfully:', groups?.length || 0);
    return groups || [];
  } catch (error) {
    console.error('Error in fetchUserGroups:', error);
    throw error; // Let the component handle the error
  }
};

export const fetchGroupMembers = async (groupId: string) => {
  try {
    // Get current session with fresh check
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!sessionData.session) {
      console.error('No active session found');
      throw new Error('User not authenticated');
    }
    
    const userId = sessionData.session.user.id;
    
    if (!userId) {
      console.error('User is not authenticated');
      throw new Error('User not authenticated');
    }
    
    // Get group members using the database function
    const { data: members, error } = await supabase
      .rpc('get_group_members', {
        p_group_id: groupId
      });
    
    if (error) {
      console.error('Error fetching group members:', error);
      throw new Error(`Error fetching group members: ${error.message}`);
    }
    
    return members || [];
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
};
