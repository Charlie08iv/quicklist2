
import { supabase } from "@/integrations/supabase/client";

export const joinGroup = async (inviteCode: string) => {
  try {
    // Get current session with fresh check
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Session error: Please try logging in again');
    }
    
    if (!sessionData.session) {
      console.error('No active session found');
      throw new Error('You need to be logged in to join a group');
    }
    
    const userId = sessionData.session.user.id;
    
    if (!userId) {
      console.error('User ID not found in session');
      throw new Error('User ID not found. Please try logging in again');
    }
    
    console.log('Joining group with invite code:', inviteCode, 'for user:', userId);
    
    // Ensure user exists in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking profile:', profileError);
      // Continue anyway, we'll try to create the profile if needed
    }
    
    if (!profileData) {
      console.log('Creating profile for user:', userId);
      // Try to create a profile for the user
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({ 
          id: userId,
          email: sessionData.session.user.email
        });
        
      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        // Continue anyway, the group join might still work
      }
    }
    
    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select()
      .eq('invite_code', inviteCode)
      .maybeSingle();
      
    if (groupError || !group) {
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
      
      // Specific error handling for RLS policy violations
      if (joinError.code === '42501') {
        throw new Error('Permission denied. Your session may have expired. Please refresh the page and try again.');
      }
      
      throw joinError;
    }
    
    console.log('Successfully joined group');
    return group;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};
