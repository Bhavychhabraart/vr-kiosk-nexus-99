
import { supabase } from '@/integrations/supabase/client';

interface SetupResult {
  success: boolean;
  message: string;
  error?: string;
  venue_id?: string;
}

export async function setupVrRealverseUser(): Promise<SetupResult> {
  const email = 'vrrealverse@gmail.com';
  
  try {
    console.log('Setting up user:', email);

    // First, check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error('User not found:', profileError);
      return { 
        success: false, 
        message: 'User not found. They need to sign up first.',
        error: 'User not found' 
      };
    }

    console.log('Found user profile:', profile);

    // Check if user already has a venue
    const { data: existingRoles } = await supabase
      .from('simplified_user_roles')
      .select('venue_id')
      .eq('user_id', profile.id)
      .eq('is_active', true);

    let venueId: string;

    if (existingRoles && existingRoles.length > 0 && existingRoles[0].venue_id) {
      // User has a venue, use existing
      venueId = existingRoles[0].venue_id;
      console.log('Using existing venue:', venueId);
    } else {
      // Create new venue
      const venueName = 'VR Realverse Gaming Arcade';
      const serialNumber = `VR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      const { data: newVenue, error: venueError } = await supabase
        .from('venues')
        .insert({
          name: venueName,
          city: 'Mumbai',
          state: 'Maharashtra',
          address: '123 VR Gaming Street',
          pin_code: '400001',
          serial_number: serialNumber,
          machine_model: 'VR-KIOSK-V1',
          status: 'active'
        })
        .select()
        .single();

      if (venueError) {
        console.error('Error creating venue:', venueError);
        return { success: false, message: 'Failed to create venue', error: venueError.message };
      }

      venueId = newVenue.id;
      console.log('Created new venue:', newVenue);

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

      // Assign machine admin role
      await supabase
        .from('simplified_user_roles')
        .upsert({
          user_id: profile.id,
          role: 'machine_admin',
          venue_id: venueId,
          is_active: true
        });
    }

    // Get all active games
    const { data: activeGames, error: gamesError } = await supabase
      .from('games')
      .select('id')
      .eq('is_active', true);

    if (gamesError) {
      console.error('Error fetching games:', gamesError);
      return { success: false, message: 'Failed to fetch games', error: gamesError.message };
    }

    // Assign all games to the venue
    if (activeGames && activeGames.length > 0) {
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
        return { success: false, message: 'Failed to assign games', error: assignError.message };
      }

      console.log('Assigned games:', activeGames.length);
    }

    // Update onboarding status
    await supabase
      .from('user_onboarding_status')
      .upsert({
        user_id: profile.id,
        status: 'completed',
        venue_id: venueId,
        setup_progress: {
          venue_created: true,
          games_assigned: activeGames?.length || 0,
          settings_configured: true,
          role_assigned: true
        },
        completed_at: new Date().toISOString()
      });

    return {
      success: true,
      message: `User ${email} has been set up with venue and ${activeGames?.length || 0} games`,
      venue_id: venueId
    };

  } catch (error) {
    console.error('Setup error:', error);
    return { 
      success: false, 
      message: 'Unexpected error during setup',
      error: (error as Error).message 
    };
  }
}
