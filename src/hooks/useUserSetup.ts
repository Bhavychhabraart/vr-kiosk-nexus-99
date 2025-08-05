
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SetupUserParams {
  email: string;
  assignAllGames?: boolean;
  createVenue?: boolean;
  venueName?: string;
  role?: 'super_admin' | 'machine_admin';
}

interface SetupResult {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    venueId?: string;
    venueName?: string;
    gamesAssigned: number;
    roleAssigned: string;
  };
}

export function useUserSetup() {
  const queryClient = useQueryClient();

  const setupUser = useMutation({
    mutationFn: async (params: SetupUserParams): Promise<SetupResult> => {
      console.log('=== Starting User Setup ===');
      console.log('Setup parameters:', params);

      const { email, assignAllGames = true, createVenue = true, venueName, role = 'machine_admin' } = params;

      // Step 1: Get or verify user exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        throw new Error('User not found. They need to sign up first.');
      }

      console.log('Found user profile:', profile);

      // Step 2: Check if user already has roles
      const { data: existingRoles } = await supabase
        .from('simplified_user_roles')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_active', true);

      let venueId: string | undefined;
      let createdVenueName: string | undefined;

      // Step 3: Create venue if requested
      if (createVenue) {
        const defaultVenueName = venueName || `${email.split('@')[0]}'s VR Arcade`;
        const serialNumber = `VR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const { data: newVenue, error: venueError } = await supabase
          .from('venues')
          .insert({
            name: defaultVenueName,
            city: 'Mumbai',
            state: 'Maharashtra',
            address: '123 VR Street',
            pin_code: '400001',
            serial_number: serialNumber,
            machine_model: 'VR-KIOSK-V1',
            status: 'active'
          })
          .select()
          .single();

        if (venueError) {
          console.error('Error creating venue:', venueError);
          throw new Error('Failed to create venue');
        }

        venueId = newVenue.id;
        createdVenueName = defaultVenueName;
        console.log('Created venue:', newVenue);

        // Create venue settings
        await supabase
          .from('venue_settings')
          .insert({
            venue_id: venueId,
            rfid_enabled: true,
            upi_enabled: true,
            theme: 'light',
            brightness: 100,
            volume: 50,
            sound_effects_enabled: true,
            password_protection_enabled: false
          });

        // Create launch options
        await supabase
          .from('launch_options')
          .insert({
            venue_id: venueId,
            tap_to_start_enabled: true,
            rfid_enabled: true,
            qr_payment_enabled: false,
            default_duration_minutes: 10,
            price_per_minute: 15.0
          });

        // Create machine auth
        await supabase
          .from('machine_auth')
          .insert({
            venue_id: venueId,
            product_id: `NGA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            product_key: Math.random().toString(36).substring(2, 18),
            access_level: 'admin'
          });
      }

      // Step 4: Assign role
      if (role && !existingRoles?.some(r => r.role === role)) {
        const { error: roleError } = await supabase
          .from('simplified_user_roles')
          .insert({
            user_id: profile.id,
            role: role,
            venue_id: venueId || null,
            is_active: true
          });

        if (roleError) {
          console.error('Error assigning role:', roleError);
          throw new Error('Failed to assign role');
        }

        console.log('Assigned role:', role);
      }

      // Step 5: Assign all games if requested
      let gamesAssigned = 0;
      if (assignAllGames && venueId) {
        const { data: activeGames, error: gamesError } = await supabase
          .from('games')
          .select('id')
          .eq('is_active', true);

        if (gamesError) {
          console.error('Error fetching games:', gamesError);
        } else if (activeGames && activeGames.length > 0) {
          const gameAssignments = activeGames.map(game => ({
            venue_id: venueId,
            game_id: game.id,
            is_active: true,
            assigned_by: 'admin-setup'
          }));

          const { error: assignError } = await supabase
            .from('machine_games')
            .upsert(gameAssignments, {
              onConflict: 'venue_id,game_id'
            });

          if (assignError) {
            console.error('Error assigning games:', assignError);
          } else {
            gamesAssigned = activeGames.length;
            console.log('Assigned games:', gamesAssigned);
          }
        }
      }

      // Step 6: Update onboarding status
      await supabase
        .from('user_onboarding_status')
        .upsert({
          user_id: profile.id,
          status: 'completed',
          venue_id: venueId,
          setup_progress: {
            venue_created: createVenue,
            venue_name: createdVenueName,
            games_assigned: gamesAssigned,
            settings_configured: true,
            role_assigned: true
          },
          completed_at: new Date().toISOString()
        });

      return {
        success: true,
        message: 'User setup completed successfully',
        data: {
          userId: profile.id,
          venueId,
          venueName: createdVenueName,
          gamesAssigned,
          roleAssigned: role
        }
      };
    },
    onSuccess: (result) => {
      console.log('User setup completed:', result);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['machine-games'] });
      
      toast({
        title: "Setup Complete",
        description: result.message,
      });
    },
    onError: (error) => {
      console.error('User setup failed:', error);
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    setupUser: (params: SetupUserParams) => setupUser.mutate(params),
    isSetupPending: setupUser.isPending
  };
}
