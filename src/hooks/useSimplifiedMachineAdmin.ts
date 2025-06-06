
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface MachineSignupData {
  email: string;
  password: string;
  fullName: string;
  machineSerialNumber: string;
}

export function useSimplifiedMachineAdmin() {
  const [isLoading, setIsLoading] = useState(false);

  const signUpMachineAdmin = async (data: MachineSignupData) => {
    setIsLoading(true);
    try {
      console.log('Starting machine admin signup for:', data.email);

      // First, verify the machine exists and is available
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('id, name, city, state, status')
        .eq('serial_number', data.machineSerialNumber.toUpperCase())
        .eq('status', 'active')
        .maybeSingle();

      if (venueError) {
        console.error('Error checking venue:', venueError);
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: "Error verifying machine. Please try again.",
        });
        return { error: 'Database error' };
      }

      if (!venueData) {
        toast({
          variant: "destructive",
          title: "Invalid Machine",
          description: "Machine serial number not found or inactive. Please check your serial number.",
        });
        return { error: 'Machine not found' };
      }

      // Check if machine already has an admin
      const { data: existingAdmin, error: adminError } = await supabase
        .from('simplified_user_roles')
        .select('id')
        .eq('venue_id', venueData.id)
        .eq('role', 'machine_admin')
        .eq('is_active', true)
        .maybeSingle();

      if (adminError) {
        console.error('Error checking existing admin:', adminError);
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: "Error checking machine admin status.",
        });
        return { error: 'Database error' };
      }

      if (existingAdmin) {
        toast({
          variant: "destructive",
          title: "Machine Already Has Admin",
          description: "This machine already has an assigned admin. Contact support if you need help.",
        });
        return { error: 'Admin already exists' };
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/machine-admin`,
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: authError.message,
        });
        return { error: authError.message };
      }

      if (authData.user) {
        // Assign machine admin role
        const { error: roleError } = await supabase
          .from('simplified_user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'machine_admin',
            venue_id: venueData.id,
            is_active: true
          });

        if (roleError) {
          console.error('Role assignment error:', roleError);
          toast({
            variant: "destructive",
            title: "Setup Incomplete",
            description: "Account created but admin role assignment failed. Please contact support.",
          });
          return { error: "Role assignment failed" };
        }

        console.log('Machine admin signup completed successfully');

        toast({
          title: "Welcome!",
          description: `Admin account created for ${venueData.name}. Please check your email to verify your account.`,
        });

        return { success: true, user: authData.user, venue: venueData };
      }

      return { error: "Account creation failed" };
    } catch (error: any) {
      console.error('Machine admin signup error:', error);
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
      });
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    signUpMachineAdmin
  };
}
