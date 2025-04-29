
import { supabase } from "@/integrations/supabase/client";

export const fetchUserGroups = async () => {
  try {
    console.log('Starting fetchUserGroups function');
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw sessionError;
    }
    
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.log('No user ID found, returning empty groups array');
      throw new Error('User ID not found. Please check if you are logged in.');
    }
    
    console.log('Fetching groups for user ID:', userId);
    
    // First check if the user exists in profiles
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.log('User profile not found. Error:', profileError);
      console.log('This might indicate the user profile needs to be created.');
      
      // Attempt to create profile if missing
      try {
        const email = sessionData.session?.user?.email;
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
      } catch (e) {
        console.error('Error creating user profile:', e);
      }
    }
    
    // Debug: Direct query to check all groups to see if RLS is working
    const { data: allGroups, error: allGroupsError } = await supabase
      .from('groups')
      .select('*')
      .limit(20);
      
    console.log('Direct groups query (check RLS):', { allGroups, allGroupsError });
    
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
        throw directError;
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
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
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
      throw error;
    }
    
    return members || [];
  } catch (error) {
    console.error('Error fetching group members:', error);
    return [];
  }
};
