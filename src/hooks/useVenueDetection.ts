
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMachineAuth } from '@/hooks/useMachineAuth';
import { useMachineVenue } from '@/hooks/useMachineVenue';

export function useVenueDetection() {
  const { user } = useAuth();
  const { machineSession } = useMachineAuth();
  const { machineVenueData } = useMachineVenue();
  const [detectedVenueId, setDetectedVenueId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Venue detection - checking sources:', {
      user: !!user,
      machineSession: !!machineSession,
      machineVenueData: !!machineVenueData
    });

    // Priority 1: Machine session from machine auth
    if (machineSession?.venue?.id) {
      console.log('Using venue from machine session:', machineSession.venue.id);
      setDetectedVenueId(machineSession.venue.id);
      return;
    }

    // Priority 2: Authenticated user's venue from machine venue data
    if (machineVenueData?.venue?.id) {
      console.log('Using venue from machine venue data:', machineVenueData.venue.id);
      setDetectedVenueId(machineVenueData.venue.id);
      return;
    }

    // Priority 3: Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const venueParam = urlParams.get('venue');
    if (venueParam) {
      console.log('Using venue from URL parameter:', venueParam);
      setDetectedVenueId(venueParam);
      return;
    }

    // Priority 4: Check local storage
    const storedVenueId = localStorage.getItem('currentVenueId');
    if (storedVenueId) {
      console.log('Using venue from local storage:', storedVenueId);
      setDetectedVenueId(storedVenueId);
      return;
    }

    // No venue detected
    console.log('No venue detected, will show all active games');
    setDetectedVenueId(null);
  }, [user, machineSession, machineVenueData]);

  // Store detected venue in local storage for future visits
  useEffect(() => {
    if (detectedVenueId) {
      localStorage.setItem('currentVenueId', detectedVenueId);
    }
  }, [detectedVenueId]);

  return {
    venueId: detectedVenueId,
    hasVenue: !!detectedVenueId
  };
}
