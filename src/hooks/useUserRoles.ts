
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserRole {
  id: string;
  role: string;
  venue_id: string | null;
  is_active: boolean;
}

export interface UserVenue {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  machine_model?: string;
  serial_number?: string;
}

export function useUserRoles() {
  const { user } = useAuth();

  console.log('useUserRoles hook - user:', { id: user?.id, email: user?.email });

  // First query: Get user roles
  const { data: userRoles, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async (): Promise<UserRole[]> => {
      if (!user?.id) {
        console.log('useUserRoles: No user ID, returning empty array');
        return [];
      }

      console.log('Fetching user roles for:', user.id);
      
      const { data, error } = await supabase
        .from('simplified_user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }
      
      console.log('User roles fetched:', data);
      console.log('User roles count:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Check if user is super admin
  const isSuperAdmin = userRoles?.some(role => role.role === 'super_admin') || false;
  const isMachineAdmin = userRoles?.some(role => role.role === 'machine_admin') || false;

  console.log('Role check results:', { 
    isSuperAdmin, 
    isMachineAdmin, 
    rolesFound: userRoles?.map(r => r.role) 
  });

  // Second query: Get user venues (independent of first query)
  const { data: userVenues, isLoading: venuesLoading, error: venuesError } = useQuery({
    queryKey: ['user-venues', user?.id, isSuperAdmin],
    queryFn: async (): Promise<UserVenue[]> => {
      if (!user?.id) {
        console.log('useUserRoles venues: No user ID');
        return [];
      }

      console.log('Fetching user venues. Is super admin:', isSuperAdmin);

      // If user is super admin, get all venues
      if (isSuperAdmin) {
        console.log('Fetching all venues for super admin');
        const { data: allVenues, error: venuesError } = await supabase
          .from('venues')
          .select('id, name, city, state, status, machine_model, serial_number')
          .eq('status', 'active');

        if (venuesError) {
          console.error('Error fetching all venues:', venuesError);
          throw venuesError;
        }
        
        console.log('All venues fetched:', allVenues?.length || 0);
        return allVenues || [];
      }

      // For non-super admins, get venue IDs from roles
      const venueIds = userRoles?.map(r => r.venue_id).filter(Boolean) || [];
      
      console.log('Venue IDs from roles:', venueIds);
      
      if (venueIds.length === 0) {
        console.log('No venue IDs found, returning empty array');
        return [];
      }

      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select('id, name, city, state, status, machine_model, serial_number')
        .in('id', venueIds)
        .eq('status', 'active');

      if (venuesError) {
        console.error('Error fetching user venues:', venuesError);
        throw venuesError;
      }
      
      console.log('User venues fetched:', venues?.length || 0);
      return venues || [];
    },
    enabled: !!user?.id && rolesLoading === false // Only run after roles are loaded
  });

  const isLoading = rolesLoading || venuesLoading;
  const error = rolesError || venuesError;

  console.log('useUserRoles final state:', {
    isLoading,
    userRoles: userRoles?.length || 0,
    userVenues: userVenues?.length || 0,
    isSuperAdmin,
    isMachineAdmin,
    error: error?.message
  });

  return {
    userRoles,
    userVenues,
    isSuperAdmin,
    isMachineAdmin,
    isLoading,
    error
  };
}
