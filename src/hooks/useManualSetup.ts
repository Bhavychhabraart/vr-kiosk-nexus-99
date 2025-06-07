
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useManualSetup = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);

  const setupUser = async (email: string) => {
    try {
      setIsSettingUp(true);
      
      console.log('Triggering manual setup for:', email);
      
      const { data, error } = await supabase.functions.invoke('manual-setup-user', {
        body: { email }
      });

      if (error) {
        console.error('Setup error:', error);
        throw error;
      }

      console.log('Setup response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Setup failed');
      }

      toast({
        title: "Setup Successful",
        description: `Venue has been assigned to ${email}`,
      });

      return data;
    } catch (error) {
      console.error('Manual setup failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsSettingUp(false);
    }
  };

  return {
    setupUser,
    isSettingUp
  };
};
