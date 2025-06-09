
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMachineAuth } from '@/hooks/useMachineAuth';
import { useMachineVenue } from '@/hooks/useMachineVenue';
import { useUserRoles } from '@/hooks/useUserRoles';

export function useVenueDetection() {
  const { user } = useAuth();
  const { machineSession } = useMachineAuth();
  const { machineVenueData } = useMachineVenue();
  const { userVenues, isSuperAdmin, isMachineAdmin, isLoading: rolesLoading } = useUserRoles();
  const [detectedVenueId, setDetectedVenueId] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== Venue Detection Process ===');
    console.log('User:', { id: user?.id, email: user?.email });
    console.log('Machine session:', !!machineSession);
    console.log('Machine venue data:', !!machineVenueData);
    console.log('User venues:', userVenues?.length || 0);
    console.log('Is super admin:', isSuperAdmin);
    console.log('Is machine admin:', isMachineAdmin);
    console.log('Roles loading:', rolesLoading);

    // Don't proceed if roles are still loading
    if (rolesLoading) {
      console.log('Roles still loading, waiting...');
      return;
    }

    // **NEW PRIORITY 1: For machine admins, always use their assigned venue first**
    if (user && isMachineAdmin && userVenues && userVenues.length > 0) {
      // For machine admins, use their first (or only) assigned venue
      const assignedVenue = userVenues[0];
      console.log('✓ Machine admin detected - using assigned venue:', assignedVenue.id);
      setDetectedVenueId(assignedVenue.id);
      
      // Clear any conflicting URL parameters or machine session data
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('venue') && urlParams.get('venue') !== assignedVenue.id) {
        console.log('⚠️ Clearing conflicting venue URL parameter');
        urlParams.delete('venue');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
      }
      
      return;
    }

    // **PRIORITY 2: Machine session from machine auth (for kiosk mode only)**
    if (machineSession?.venue?.id) {
      // Validate that the user has access to this venue if they're authenticated
      if (user && userVenues && userVenues.length > 0) {
        const hasAccess = userVenues.some(venue => venue.id === machineSession.venue.id);
        if (!hasAccess) {
          console.log('⚠️ Machine session venue not accessible by user, ignoring');
        } else {
          console.log('✓ Using venue from machine session (validated):', machineSession.venue.id);
          setDetectedVenueId(machineSession.venue.id);
          return;
        }
      } else {
        console.log('✓ Using venue from machine session:', machineSession.venue.id);
        setDetectedVenueId(machineSession.venue.id);
        return;
      }
    }

    // **PRIORITY 3: Authenticated user's venue from machine venue data**
    if (machineVenueData?.venue?.id) {
      // Validate access for this venue too
      if (user && userVenues && userVenues.length > 0) {
        const hasAccess = userVenues.some(venue => venue.id === machineVenueData.venue.id);
        if (!hasAccess) {
          console.log('⚠️ Machine venue data not accessible by user, ignoring');
        } else {
          console.log('✓ Using venue from machine venue data (validated):', machineVenueData.venue.id);
          setDetectedVenueId(machineVenueData.venue.id);
          return;
        }
      } else {
        console.log('✓ Using venue from machine venue data:', machineVenueData.venue.id);
        setDetectedVenueId(machineVenueData.venue.id);
        return;
      }
    }

    // **PRIORITY 4: Check URL parameters for specific venue (with validation)**
    const urlParams = new URLSearchParams(window.location.search);
    const venueParam = urlParams.get('venue');
    if (venueParam) {
      // Validate that the user has access to this venue
      if (user && userVenues && userVenues.length > 0) {
        const hasAccess = userVenues.some(venue => venue.id === venueParam);
        if (!hasAccess) {
          console.log('⚠️ URL venue parameter not accessible by user, clearing and using assigned venue');
          urlParams.delete('venue');
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
          window.history.replaceState({}, '', newUrl);
          
          // Fall back to user's assigned venue
          if (userVenues.length > 0) {
            const assignedVenue = userVenues[0];
            console.log('✓ Using user assigned venue instead:', assignedVenue.id);
            setDetectedVenueId(assignedVenue.id);
            return;
          }
        } else {
          console.log('✓ Using venue from URL parameter (validated):', venueParam);
          setDetectedVenueId(venueParam);
          return;
        }
      } else {
        console.log('✓ Using venue from URL parameter:', venueParam);
        setDetectedVenueId(venueParam);
        return;
      }
    }

    // **PRIORITY 5: For authenticated users with venue roles**
    if (user && userVenues && userVenues.length > 0) {
      // If super admin, don't auto-select a venue (they should choose)
      if (isSuperAdmin) {
        console.log('Super admin detected - no auto venue selection');
        setDetectedVenueId(null);
        return;
      }
      
      // For other roles, use their first venue
      const firstVenue = userVenues[0];
      console.log('✓ Using first venue from user roles:', firstVenue.id);
      setDetectedVenueId(firstVenue.id);
      return;
    }

    // **PRIORITY 6: Check local storage (with validation)**
    const storedVenueId = localStorage.getItem('currentVenueId');
    if (storedVenueId) {
      // Validate stored venue against user access
      if (user && userVenues && userVenues.length > 0) {
        const hasAccess = userVenues.some(venue => venue.id === storedVenueId);
        if (!hasAccess) {
          console.log('⚠️ Stored venue not accessible by user, clearing storage');
          localStorage.removeItem('currentVenueId');
          
          // Use user's assigned venue instead
          const assignedVenue = userVenues[0];
          console.log('✓ Using user assigned venue instead of stored:', assignedVenue.id);
          setDetectedVenueId(assignedVenue.id);
          return;
        }
      }
      
      console.log('✓ Using venue from local storage (validated):', storedVenueId);
      setDetectedVenueId(storedVenueId);
      return;
    }

    // No venue detected
    console.log('✗ No venue detected');
    setDetectedVenueId(null);
  }, [user, machineSession, machineVenueData, userVenues, isSuperAdmin, isMachineAdmin, rolesLoading]);

  // Store detected venue in local storage for future visits (only if user has access)
  useEffect(() => {
    if (detectedVenueId) {
      // Double-check user has access before storing
      if (user && userVenues && userVenues.length > 0) {
        const hasAccess = userVenues.some(venue => venue.id === detectedVenueId);
        if (hasAccess) {
          localStorage.setItem('currentVenueId', detectedVenueId);
          console.log('Stored venue in localStorage (validated):', detectedVenueId);
        } else {
          console.log('⚠️ Not storing venue - user lacks access');
        }
      } else {
        localStorage.setItem('currentVenueId', detectedVenueId);
        console.log('Stored venue in localStorage:', detectedVenueId);
      }
    }
  }, [detectedVenueId, user, userVenues]);

  return {
    venueId: detectedVenueId,
    hasVenue: !!detectedVenueId,
    isLoading: rolesLoading
  };
}
