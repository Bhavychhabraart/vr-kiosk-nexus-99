
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { 
  SetupStatus, 
  MachineSetupStatus, 
  OwnerRegistration,
  InitializeSetupResponse,
  ValidateTokenResponse
} from "@/types/setup";

export const useMachineSetup = () => {
  const queryClient = useQueryClient();
  const [setupToken, setSetupToken] = useState<string | null>(
    localStorage.getItem('machine_setup_token')
  );

  // Initialize machine setup
  const initializeSetup = useMutation({
    mutationFn: async (serialNumber: string) => {
      console.log('Initializing machine setup for:', serialNumber);
      
      const { data, error } = await supabase.rpc('initialize_machine_setup', {
        p_serial_number: serialNumber
      });

      if (error) {
        console.error('Setup initialization error:', error);
        throw error;
      }

      return data as unknown as InitializeSetupResponse;
    },
    onSuccess: (data) => {
      console.log('Setup initialized:', data);
      if (data.setup_token) {
        localStorage.setItem('machine_setup_token', data.setup_token);
        setSetupToken(data.setup_token);
      }
      queryClient.invalidateQueries({ queryKey: ['machineSetup'] });
      toast({
        title: "Setup Initialized",
        description: "Machine setup process has been started successfully.",
      });
    },
    onError: (error) => {
      console.error('Setup initialization failed:', error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: "Failed to initialize machine setup. Please try again.",
      });
    },
  });

  // Get current setup status
  const { data: setupStatus, isLoading, error } = useQuery({
    queryKey: ['machineSetup', setupToken],
    queryFn: async () => {
      if (!setupToken) return null;
      
      console.log('Validating setup token:', setupToken);
      
      const { data, error } = await supabase.rpc('validate_setup_token', {
        p_token: setupToken
      });

      if (error) {
        console.error('Token validation error:', error);
        throw error;
      }

      return data as unknown as ValidateTokenResponse;
    },
    enabled: !!setupToken,
    retry: 1,
  });

  // Update setup progress
  const updateProgress = useMutation({
    mutationFn: async ({ 
      serialNumber, 
      status, 
      stepData = {} 
    }: { 
      serialNumber: string; 
      status: SetupStatus; 
      stepData?: Record<string, any> 
    }) => {
      console.log('Updating setup progress:', { serialNumber, status, stepData });
      
      const { data, error } = await supabase.rpc('update_setup_progress', {
        p_serial_number: serialNumber,
        p_status: status,
        p_step_data: stepData
      });

      if (error) {
        console.error('Progress update error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Progress updated:', data);
      queryClient.invalidateQueries({ queryKey: ['machineSetup'] });
      
      if (variables.status === 'completed') {
        localStorage.removeItem('machine_setup_token');
        setSetupToken(null);
        toast({
          title: "Setup Complete!",
          description: "Your machine is now ready for operation.",
        });
      }
    },
    onError: (error) => {
      console.error('Progress update failed:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update setup progress. Please try again.",
      });
    },
  });

  // Save owner registration
  const saveOwnerRegistration = useMutation({
    mutationFn: async (ownerData: Omit<OwnerRegistration, 'id' | 'created_at' | 'updated_at' | 'verification_status' | 'email_verified_at' | 'phone_verified_at'>) => {
      console.log('Saving owner registration:', ownerData);
      
      const { data, error } = await supabase
        .from('owner_registration')
        .upsert(ownerData, {
          onConflict: 'machine_serial_number'
        })
        .select()
        .single();

      if (error) {
        console.error('Owner registration error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Owner registration saved:', data);
      queryClient.invalidateQueries({ queryKey: ['ownerRegistration'] });
      toast({
        title: "Information Saved",
        description: "Owner registration information saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Owner registration failed:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save owner information. Please try again.",
      });
    },
  });

  // Reset setup (for testing)
  const resetSetup = () => {
    localStorage.removeItem('machine_setup_token');
    setSetupToken(null);
    queryClient.invalidateQueries({ queryKey: ['machineSetup'] });
  };

  return {
    setupStatus,
    isLoading,
    error,
    setupToken,
    initializeSetup: initializeSetup.mutate,
    isInitializing: initializeSetup.isPending,
    updateProgress: updateProgress.mutate,
    isUpdating: updateProgress.isPending,
    saveOwnerRegistration: saveOwnerRegistration.mutate,
    isSaving: saveOwnerRegistration.isPending,
    resetSetup,
  };
};
