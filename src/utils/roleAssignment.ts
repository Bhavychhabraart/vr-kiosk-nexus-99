
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
      return { success: false, error: 'User not found. They need to sign up first.' };
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

export async function assignMachineAdminRole(userEmail: string, venueId: string) {
  try {
    // First, get the user ID from the email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    if (profileError || !profiles) {
      console.error('Error finding user profile:', profileError);
      return { success: false, error: 'User not found. They need to sign up first.' };
    }

    console.log('Found user profile:', profiles);

    // Check if the user already has a machine admin role for this venue
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('simplified_user_roles')
      .select('*')
      .eq('user_id', profiles.id)
      .eq('role', 'machine_admin')
      .eq('venue_id', venueId)
      .eq('is_active', true)
      .maybeSingle();

    if (roleCheckError) {
      console.error('Error checking existing role:', roleCheckError);
      return { success: false, error: 'Error checking existing role' };
    }

    if (existingRole) {
      console.log('User already has machine admin role for this venue');
      return { success: true, message: 'User already has machine admin role for this venue' };
    }

    // Assign machine admin role
    const { data: newRole, error: assignError } = await supabase
      .from('simplified_user_roles')
      .insert({
        user_id: profiles.id,
        role: 'machine_admin',
        venue_id: venueId,
        is_active: true
      })
      .select()
      .single();

    if (assignError) {
      console.error('Error assigning role:', assignError);
      return { success: false, error: 'Error assigning role' };
    }

    console.log('Successfully assigned machine admin role:', newRole);
    return { success: true, message: 'Machine admin role assigned successfully' };

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

export async function createPendingRoleAssignment(userEmail: string, role: 'super_admin' | 'machine_admin', venueId?: string) {
  try {
    // Store pending role assignment in a simple way
    // This is a temporary solution - in production you might want a dedicated pending_roles table
    const pendingData = {
      email: userEmail,
      role: role,
      venue_id: venueId || null,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    // Store in localStorage for now (in production, use a database table)
    const existing = localStorage.getItem('pendingRoleAssignments');
    const pendingRoles = existing ? JSON.parse(existing) : [];
    
    // Check if already exists
    const existingIndex = pendingRoles.findIndex((p: any) => 
      p.email === userEmail && p.role === role && p.venue_id === venueId
    );
    
    if (existingIndex >= 0) {
      return { success: true, message: 'Role assignment already pending for this user' };
    }
    
    pendingRoles.push(pendingData);
    localStorage.setItem('pendingRoleAssignments', JSON.stringify(pendingRoles));
    
    return { success: true, message: `Pending ${role} role created for ${userEmail}. Role will be assigned when they sign up.` };
    
  } catch (error) {
    console.error('Error creating pending role assignment:', error);
    return { success: false, error: 'Error creating pending role assignment' };
  }
}

export async function processPendingRoleAssignments(userEmail: string) {
  try {
    const existing = localStorage.getItem('pendingRoleAssignments');
    if (!existing) return;
    
    const pendingRoles = JSON.parse(existing);
    const userPendingRoles = pendingRoles.filter((p: any) => p.email === userEmail);
    
    for (const pendingRole of userPendingRoles) {
      if (pendingRole.role === 'super_admin') {
        await assignSuperAdminRole(userEmail);
      } else if (pendingRole.role === 'machine_admin' && pendingRole.venue_id) {
        await assignMachineAdminRole(userEmail, pendingRole.venue_id);
      }
    }
    
    // Remove processed assignments
    const remainingRoles = pendingRoles.filter((p: any) => p.email !== userEmail);
    localStorage.setItem('pendingRoleAssignments', JSON.stringify(remainingRoles));
    
  } catch (error) {
    console.error('Error processing pending role assignments:', error);
  }
}
