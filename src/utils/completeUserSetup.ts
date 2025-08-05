
import { supabase } from '@/integrations/supabase/client';

interface SetupResult {
  success: boolean;
  message: string;
  error?: string;
  venue_id?: string;
}

export async function completeUserSetup(email: string): Promise<SetupResult> {
  try {
    console.log('Starting complete user setup for:', email);

    // First, check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error('User not found:', profileError);
      return { 
        success: false, 
        error: 'User not found. They need to sign up first.' 
      };
    }

    console.log('Found user profile:', profile);

    // Check if user already has machine admin role
    const { data: existingRole, error: roleError } = await supabase
      .from('simplified_user_roles')
      .select('*')
      .eq('user_id', profile.id)
      .eq('role', 'machine_admin')
      .eq('is_active', true);

    if (roleError) {
      console.error('Error checking existing roles:', roleError);
      return { 
        success: false, 
        error: 'Error checking existing roles' 
      };
    }

    if (existingRole && existingRole.length > 0) {
      console.log('User already has machine admin role');
      return { 
        success: true, 
        message: 'User already has machine admin role and venue setup',
        venue_id: existingRole[0].venue_id 
      };
    }

    // Call the manual setup user function
    console.log('Calling manual setup function...');
    const { data: setupData, error: setupError } = await supabase.functions.invoke('manual-setup-user', {
      body: { email: email }
    });

    if (setupError) {
      console.error('Setup function error:', setupError);
      return { 
        success: false, 
        error: setupError.message || 'Setup function failed' 
      };
    }

    console.log('Setup function result:', setupData);

    if (setupData.success) {
      return {
        success: true,
        message: setupData.message || 'User setup completed successfully',
        venue_id: setupData.data?.venue_id
      };
    } else {
      return {
        success: false,
        error: setupData.error || 'Setup failed'
      };
    }

  } catch (error) {
    console.error('Unexpected error during setup:', error);
    return { 
      success: false, 
      error: 'Unexpected error occurred during setup' 
    };
  }
}
