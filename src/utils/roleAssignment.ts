
import { supabase } from '@/integrations/supabase/client';

export async function assignSuperAdminRole(userEmail: string) {
  try {
    // First, get the user ID from the email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    if (profileError || !profiles) {
      console.error('Error finding user profile:', profileError);
      return { success: false, error: 'User not found' };
    }

    console.log('Found user profile:', profiles);

    // Check if the user already has a super admin role
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('simplified_user_roles')
      .select('*')
      .eq('user_id', profiles.id)
      .eq('role', 'super_admin')
      .eq('is_active', true)
      .maybeSingle();

    if (roleCheckError) {
      console.error('Error checking existing role:', roleCheckError);
      return { success: false, error: 'Error checking existing role' };
    }

    if (existingRole) {
      console.log('User already has super admin role');
      return { success: true, message: 'User already has super admin role' };
    }

    // Assign super admin role
    const { data: newRole, error: assignError } = await supabase
      .from('simplified_user_roles')
      .insert({
        user_id: profiles.id,
        role: 'super_admin',
        venue_id: null, // Super admin has access to all venues
        is_active: true
      })
      .select()
      .single();

    if (assignError) {
      console.error('Error assigning role:', assignError);
      return { success: false, error: 'Error assigning role' };
    }

    console.log('Successfully assigned super admin role:', newRole);
    return { success: true, message: 'Super admin role assigned successfully' };

  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function checkUserRoles(userEmail: string) {
  try {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    if (profileError || !profiles) {
      return { success: false, error: 'User not found' };
    }

    const { data: roles, error: rolesError } = await supabase
      .from('simplified_user_roles')
      .select('*')
      .eq('user_id', profiles.id)
      .eq('is_active', true);

    if (rolesError) {
      return { success: false, error: 'Error fetching roles' };
    }

    return { success: true, roles: roles || [] };

  } catch (error) {
    return { success: false, error: 'Unexpected error occurred' };
  }
}
