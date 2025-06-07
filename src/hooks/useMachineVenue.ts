
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';

export interface MachineVenueData {
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    machine_model: string;
    serial_number: string;
  };
  auth: {
    product_id: string;
    access_level: string;
    expires_at: string | null;
  };
}

export function useMachineVenue() {
  const { user } = useAuth();
  const { userVenues, isMachineAdmin, isLoading: rolesLoading } = useUserRoles();

  const { data: machineVenueData, isLoading, error } = useQuery({
    queryKey: ['machine-venue', user?.id],
    queryFn: async (): Promise<MachineVenueData | null> => {
      if (!user?.id || !isMachineAdmin || !userVenues || userVenues.length === 0) {
        return null;
      }

      // For machine admins, get the first venue (or primary venue)
      const primaryVenue = userVenues[0];

      // Get machine auth details for this venue
      const { data: machineAuth, error: authError } = await supabase
        .from('machine_auth')
        .select('product_id, access_level, expires_at')
        .eq('venue_id', primaryVenue.id)
        .eq('is_active', true)
        .maybeSingle();

      if (authError) {
        console.error('Error fetching machine auth:', authError);
        throw authError;
      }

      return {
        venue: {
          id: primaryVenue.id,
          name: primaryVenue.name,
          city: primaryVenue.city,
          state: primaryVenue.state,
          machine_model: 'VR-KIOSK-V1', // Default model
          serial_number: 'AUTO-DETECTED'
        },
        auth: {
          product_id: machineAuth?.product_id || 'AUTO',
          access_level: machineAuth?.access_level || 'admin',
          expires_at: machineAuth?.expires_at || null
        }
      };
    },
    enabled: !!user?.id && !rolesLoading && isMachineAdmin && !!userVenues && userVenues.length > 0
  });

  return {
    machineVenueData,
    isLoading: isLoading || rolesLoading,
    error,
    hasMultipleVenues: userVenues && userVenues.length > 1,
    userVenues
  };
}
