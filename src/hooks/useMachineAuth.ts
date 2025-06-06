
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MachineAuthResponse, MachineSession } from '@/types/machine';
import { Venue } from '@/types/business';

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

  const authenticateMachine = async (venueId: string, productKey: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('validate_machine_auth', {
        p_venue_id: venueId,
        p_product_key: productKey,
        p_ip_address: null, // Could be populated with actual IP
        p_user_agent: navigator.userAgent
      });

      if (error) throw error;

      // Parse the JSON response from the database function
      const response: MachineAuthResponse = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.success && response.venue && response.auth) {
        const session: MachineSession = {
          venue: response.venue,
          auth: response.auth,
          authenticated: true
        };

        setMachineSession(session);
        setIsAuthenticated(true);
        localStorage.setItem('machineSession', JSON.stringify(session));

        toast({
          title: "Authentication Successful",
          description: `Welcome to ${response.venue.name} admin panel`,
        });

        return true;
      } else {
        toast({
          title: "Authentication Failed",
          description: response.error || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
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
