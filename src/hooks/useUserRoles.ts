
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
}

export function useUserRoles() {
  const { user } = useAuth();

  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async (): Promise<UserRole[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('simplified_user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: userVenues, isLoading: venuesLoading } = useQuery({
    queryKey: ['user-venues', user?.id],
    queryFn: async (): Promise<UserVenue[]> => {
      if (!user?.id) return [];

      // Get venue IDs for this user
      const { data: roleData, error: roleError } = await supabase
        .from('simplified_user_roles')
        .select('venue_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .not('venue_id', 'is', null);

      if (roleError) throw roleError;

      const venueIds = roleData?.map(r => r.venue_id).filter(Boolean) || [];
      
      if (venueIds.length === 0) {
        // If user has super_admin role, they can see all venues
        const isSuperAdmin = userRoles?.some(role => role.role === 'super_admin');
        if (isSuperAdmin) {
          const { data: allVenues, error: venuesError } = await supabase
            .from('venues')
            .select('id, name, city, state, status')
            .eq('status', 'active');

          if (venuesError) throw venuesError;
          return allVenues || [];
        }
        return [];
      }

      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select('id, name, city, state, status')
        .in('id', venueIds)
        .eq('status', 'active');

      if (venuesError) throw venuesError;
      return venues || [];
    },
    enabled: !!user?.id && !!userRoles
  });

  const isSuperAdmin = userRoles?.some(role => role.role === 'super_admin') || false;
  const isMachineAdmin = userRoles?.some(role => role.role === 'machine_admin') || false;

  return {
    userRoles,
    userVenues,
    isSuperAdmin,
    isMachineAdmin,
    isLoading: rolesLoading || venuesLoading
  };
}
