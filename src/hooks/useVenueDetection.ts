
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMachineAuth } from '@/hooks/useMachineAuth';
import { useMachineVenue } from '@/hooks/useMachineVenue';
import { useUserRoles } from '@/hooks/useUserRoles';

export function useVenueDetection() {
  const { user } = useAuth();
  const { machineSession } = useMachineAuth();
  const { machineVenueData } = useMachineVenue();
  const { userVenues, isSuperAdmin, isLoading: rolesLoading } = useUserRoles();
  const [detectedVenueId, setDetectedVenueId] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== Venue Detection Process ===');
    console.log('User:', { id: user?.id, email: user?.email });
    console.log('Machine session:', !!machineSession);
    console.log('Machine venue data:', !!machineVenueData);
    console.log('User venues:', userVenues?.length || 0);
    console.log('Is super admin:', isSuperAdmin);
    console.log('Roles loading:', rolesLoading);

    // Don't proceed if roles are still loading
    if (rolesLoading) {
      console.log('Roles still loading, waiting...');
      return;
    }

    // Priority 1: Machine session from machine auth (highest priority for kiosk mode)
    if (machineSession?.venue?.id) {
      console.log('✓ Using venue from machine session:', machineSession.venue.id);
      setDetectedVenueId(machineSession.venue.id);
      return;
    }

    // Priority 2: Authenticated user's venue from machine venue data
    if (machineVenueData?.venue?.id) {
      console.log('✓ Using venue from machine venue data:', machineVenueData.venue.id);
      setDetectedVenueId(machineVenueData.venue.id);
      return;
    }

    // Priority 3: Check URL parameters for specific venue
    const urlParams = new URLSearchParams(window.location.search);
    const venueParam = urlParams.get('venue');
    if (venueParam) {
      console.log('✓ Using venue from URL parameter:', venueParam);
      setDetectedVenueId(venueParam);
      return;
    }

    // Priority 4: For authenticated users with venue roles
    if (user && userVenues && userVenues.length > 0) {
      // If super admin, don't auto-select a venue (they should choose)
      if (isSuperAdmin) {
        console.log('Super admin detected - no auto venue selection');
        setDetectedVenueId(null);
        return;
      }
      
      // For machine admins or other roles, use their first venue
      const firstVenue = userVenues[0];
      console.log('✓ Using first venue from user roles:', firstVenue.id);
      setDetectedVenueId(firstVenue.id);
      return;
    }

    // Priority 5: Check local storage
    const storedVenueId = localStorage.getItem('currentVenueId');
    if (storedVenueId) {
      console.log('✓ Using venue from local storage:', storedVenueId);
      setDetectedVenueId(storedVenueId);
      return;
    }

    // No venue detected
    console.log('✗ No venue detected');
    setDetectedVenueId(null);
  }, [user, machineSession, machineVenueData, userVenues, isSuperAdmin, rolesLoading]);

  // Store detected venue in local storage for future visits
  useEffect(() => {
    if (detectedVenueId) {
      localStorage.setItem('currentVenueId', detectedVenueId);
      console.log('Stored venue in localStorage:', detectedVenueId);
    }
  }, [detectedVenueId]);

  return {
    venueId: detectedVenueId,
    hasVenue: !!detectedVenueId,
    isLoading: rolesLoading
  };
}
