
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SignupValidationResult {
  success: boolean;
  venue?: {
    id: string;
    name: string;
    city: string;
    state: string;
    machine_model: string;
    serial_number: string;
  };
  auth?: {
    product_id: string;
    access_level: string;
  };
  error?: string;
}

interface RoleAssignmentResult {
  success: boolean;
  error?: string;
  message?: string;
}

export function useAdminSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [validatedVenue, setValidatedVenue] = useState<SignupValidationResult['venue'] | null>(null);

  const validateProductKey = async (productKey: string): Promise<SignupValidationResult> => {
    try {
      console.log('Validating product key:', productKey);
      
      // Call the function using direct SQL execution approach
      const { data, error } = await supabase
        .from('machine_auth')
        .select(`
          id,
          product_id,
          access_level,
          venue_id,
          venues!inner (
            id,
            name,
            city,
            state,
            machine_model,
            serial_number,
            status
          )
        `)
        .eq('product_key', productKey)
        .eq('is_active', true)
        .eq('venues.status', 'active')
        .single();

      if (error || !data) {
        console.error('Product key validation error:', error);
        return {
          success: false,
          error: 'Invalid or expired product key'
        };
      }

      console.log('Product key validation successful:', data);

      // Check if machine already has an admin
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('venue_id', data.venue_id)
        .eq('role', 'machine_admin')
        .eq('is_active', true)
        .maybeSingle();

      if (existingRole) {
        console.log('Machine already has admin:', existingRole);
        return {
          success: false,
          error: 'This machine already has an assigned admin'
        };
      }

      const venue = {
        id: data.venues.id,
        name: data.venues.name,
        city: data.venues.city,
        state: data.venues.state,
        machine_model: data.venues.machine_model,
        serial_number: data.venues.serial_number
      };

      setValidatedVenue(venue);

      return {
        success: true,
        venue,
        auth: {
          product_id: data.product_id,
          access_level: data.access_level
        }
      };
    } catch (error) {
      console.error('Product key validation error:', error);
      return {
        success: false,
        error: 'Failed to validate product key. Please try again.'
      };
    }
  };

  const signUpAdmin = async (
    email: string, 
    password: string, 
    fullName: string, 
    productKey: string
  ) => {
    setIsLoading(true);
    try {
      console.log('Starting admin signup process for:', email);

      // Validate product key one more time to ensure it's still valid
      const validation = await validateProductKey(productKey);
      if (!validation.success) {
        console.error('Product key validation failed during signup:', validation.error);
        toast({
          variant: "destructive",
          title: "Invalid Product Key",
          description: validation.error,
        });
        return { error: validation.error };
      }

      console.log('Product key validated, creating user account...');

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/machine-admin`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: authError.message,
        });
        return { error: authError.message };
      }

      console.log('User account created successfully:', authData.user?.id);

      // If user was created successfully, assign the machine admin role
      if (authData.user && validation.venue) {
        console.log('Assigning machine admin role...');

        // Get the machine auth record to find venue_id
        const { data: machineAuth, error: machineAuthError } = await supabase
          .from('machine_auth')
          .select('venue_id')
          .eq('product_key', productKey)
          .single();

        if (machineAuthError || !machineAuth) {
          console.error('Failed to get machine auth record:', machineAuthError);
          toast({
            variant: "destructive",
            title: "Setup Error",
            description: "Failed to retrieve machine information. Please contact support.",
          });
          return { error: "Failed to retrieve machine information" };
        }

        console.log('Machine auth record found, venue_id:', machineAuth.venue_id);

        // Use the secure database function to assign the role
        const { data: roleResult, error: roleError } = await supabase.rpc(
          'assign_machine_admin_role',
          {
            p_user_id: authData.user.id,
            p_venue_id: machineAuth.venue_id,
            p_granted_by: authData.user.id
          }
        );

        if (roleError) {
          console.error('Role assignment RPC error:', roleError);
          toast({
            variant: "destructive",
            title: "Setup Incomplete",
            description: "Account created but admin role assignment failed. Please contact support.",
          });
          return { error: "Role assignment failed" };
        }

        console.log('Role assignment function response:', roleResult);

        // Check if the function returned an error
        try {
          const result = roleResult as unknown as RoleAssignmentResult;
          if (result && !result.success) {
            console.error('Role assignment function error:', result.error);
            toast({
              variant: "destructive",
              title: "Role Assignment Failed",
              description: result.error || "Failed to assign admin role",
            });
            return { error: result.error || "Role assignment failed" };
          }
        } catch (parseError) {
          console.error('Error parsing role assignment result:', parseError);
          // If we can't parse the result, assume success since no RPC error occurred
          console.log('Assuming role assignment succeeded due to no RPC error');
        }

        // Update last used time for the auth record
        const { error: updateError } = await supabase
          .from('machine_auth')
          .update({ last_used_at: new Date().toISOString() })
          .eq('product_key', productKey);

        if (updateError) {
          console.error('Failed to update last_used_at:', updateError);
          // Don't fail the signup for this
        }

        console.log('Admin signup completed successfully');

        toast({
          title: "Welcome!",
          description: `Admin account created successfully for ${validatedVenue?.name}. Please check your email to verify your account.`,
        });

        return { success: true, user: authData.user };
      }

      console.error('Missing user or venue data after signup');
      return { error: "Incomplete signup data" };
    } catch (error: any) {
      console.error('Admin signup error:', error);
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
    validatedVenue,
    validateProductKey,
    signUpAdmin,
    clearValidation: () => setValidatedVenue(null)
  };
}
