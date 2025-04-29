
import { nanoid } from 'nanoid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createGroup = async (name: string) => {
  const inviteCode = nanoid(8);
  
  try {
    console.log('Creating group with name:', name, 'and invite code:', inviteCode);
    
    // Get current session with fresh check
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Session error: Please try logging in again');
    }
    
    if (!sessionData.session) {
      console.error('No active session found');
      throw new Error('You need to be logged in to create a group');
    }
    
    const userId = sessionData.session.user.id;
    
    if (!userId) {
      console.error('User ID not found in session');
      throw new Error('User ID not found. Please try logging in again');
    }
    
    console.log('Creating group for user ID:', userId);
    
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
        // Continue anyway, the group creation might still work
      }
    }
    
    // Create the group
    const { data: group, error } = await supabase
      .from('groups')
      .insert({ 
        name, 
        invite_code: inviteCode,
        created_by: userId
      })
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error creating group:', error);
      
      // Specific error handling for RLS policy violations
      if (error.code === '42501') {
        throw new Error('Permission denied. Your session may have expired. Please refresh the page and try again.');
      }
      
      throw error;
    }
    
    // Add creator as a member of the group
    const { error: memberError } = await supabase
      .rpc('add_group_member', {
        p_group_id: group.id,
        p_user_id: userId,
        p_role: 'admin'
      });
      
    if (memberError) {
      console.error('Error adding creator as member:', memberError);
      // Don't throw here, the group was already created
    }
    
    console.log('Group created successfully:', group);
    return group;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};
