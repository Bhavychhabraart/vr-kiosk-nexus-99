
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MachineAuthResponse, MachineSession } from '@/types/machine';
import { Venue } from '@/types/business';

// Define access keys for each machine
const MACHINE_ACCESS_KEYS: Record<string, string> = {
  'VRX001DEL': 'VRX001-ADMIN-KEY',
  'VRX002MUM': 'VRX002-ADMIN-KEY', 
  'VRX003BLR': 'VRX003-ADMIN-KEY',
  'VRX004CHE': 'VRX004-ADMIN-KEY',
  'VRX005HYD': 'VRX005-ADMIN-KEY',
  'VRX008CHN': 'VRX008-ADMIN-KEY',
  'VRX009BLR': 'VRX009-ADMIN-KEY'
};

export function useMachineAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [machineSession, setMachineSession] = useState<MachineSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('machineSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setMachineSession(session);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('machineSession');
      }
    }
  }, []);

  const authenticateMachine = async (venueId: string, accessKey: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Fetch venue details
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (venueError || !venueData) {
        throw new Error('Venue not found');
      }

      // Validate access key
      const expectedKey = MACHINE_ACCESS_KEYS[venueData.serial_number];
      if (!expectedKey || accessKey !== expectedKey) {
        toast({
          title: "Authentication Failed",
          description: "Invalid access key for this machine",
          variant: "destructive",
        });
        return false;
      }

      // Create machine session
      const session: MachineSession = {
        venue: venueData,
        auth: {
          product_id: venueData.serial_number,
          access_level: 'machine_admin',
          expires_at: null,
          is_active: true
        },
        authenticated: true
      };

      setMachineSession(session);
      setIsAuthenticated(true);
      localStorage.setItem('machineSession', JSON.stringify(session));

      toast({
        title: "Authentication Successful",
        description: `Welcome to ${venueData.name} admin panel`,
      });

      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setMachineSession(null);
    setIsAuthenticated(false);
    localStorage.removeItem('machineSession');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const fetchActiveVenues = async (): Promise<Venue[]> => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching venues:', error);
      return [];
    }

    return data || [];
  };

  return {
    isAuthenticated,
    machineSession,
    isLoading,
    authenticateMachine,
    logout,
    fetchActiveVenues
  };
}
