
import { supabase } from '@/integrations/supabase/client';

export async function checkUserSetup(email: string) {
  try {
    console.log('=== Checking User Setup ===');
    console.log('Email:', email);

    // Get user from profiles table (client-side accessible)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { success: false, error: 'Could not fetch user profile' };
    }

    if (!profileData) {
      return { success: false, error: 'User not found' };
    }

    console.log('Found user:', { id: profileData.id, email: profileData.email });

    // Check user roles using the simplified_user_roles table
    const { data: roles, error: rolesError } = await supabase
      .from('simplified_user_roles')
      .select('*')
      .eq('user_id', profileData.id)
      .eq('is_active', true);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return { success: false, error: 'Could not fetch user roles' };
    }

    console.log('User roles:', roles);

    // Check venues
    if (roles && roles.length > 0) {
      const venueIds = roles.map(r => r.venue_id).filter(Boolean);
      
      if (venueIds.length > 0) {
        const { data: venues, error: venuesError } = await supabase
          .from('venues')
          .select('*')
          .in('id', venueIds);

        if (venuesError) {
          console.error('Error fetching venues:', venuesError);
          return { success: false, error: 'Could not fetch venues' };
        }

        console.log('User venues:', venues);

        // Check games for first venue
        if (venues && venues.length > 0) {
          const { data: machineGames, error: gamesError } = await supabase
            .from('machine_games')
            .select(`
              id,
              is_active,
              games(id, title, is_active)
            `)
            .eq('venue_id', venues[0].id);

          if (gamesError) {
            console.error('Error fetching machine games:', gamesError);
            return { success: false, error: 'Could not fetch games' };
          }

          console.log('Machine games:', machineGames?.length);

          return {
            success: true,
            user: { id: profileData.id, email: profileData.email },
            roles,
            venues,
            gamesCount: machineGames?.length || 0,
            activeGamesCount: machineGames?.filter(mg => mg.is_active && mg.games?.is_active).length || 0
          };
        }
      }
    }

    return {
      success: true,
      user: { id: profileData.id, email: profileData.email },
      roles: roles || [],
      venues: [],
      gamesCount: 0,
      activeGamesCount: 0
    };

  } catch (error) {
    console.error('Setup check error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function createUserVenueSetup(email: string) {
  try {
    console.log('=== Creating User Venue Setup ===');
    console.log('Email:', email);

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      return { success: false, error: 'User not found' };
    }

    // Check if user already has a venue
    const { data: existingRoles } = await supabase
      .from('simplified_user_roles')
      .select('venue_id')
      .eq('user_id', profileData.id)
      .eq('is_active', true);

    if (existingRoles && existingRoles.length > 0) {
      return { success: false, error: 'User already has venue setup' };
    }

    // Create new venue
    const venueName = `${email.split('@')[0]}'s VR Arcade`;
    const serialNumber = `VR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const { data: newVenue, error: venueError } = await supabase
      .from('venues')
      .insert({
        name: venueName,
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
      return { success: false, error: 'Failed to create venue' };
    }

    console.log('Created venue:', newVenue);

    // Assign machine admin role
    const { error: roleError } = await supabase
      .from('simplified_user_roles')
      .insert({
        user_id: profileData.id,
        role: 'machine_admin',
        venue_id: newVenue.id,
        is_active: true
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      return { success: false, error: 'Failed to assign machine admin role' };
    }

    // Get all active games
    const { data: allGames } = await supabase
      .from('games')
      .select('id')
      .eq('is_active', true);

    // Assign all games to venue
    if (allGames && allGames.length > 0) {
      const gameAssignments = allGames.map(game => ({
        venue_id: newVenue.id,
        game_id: game.id,
        is_active: true,
        assigned_by: 'admin-setup'
      }));

      const { error: gamesError } = await supabase
        .from('machine_games')
        .insert(gameAssignments);

      if (gamesError) {
        console.error('Error assigning games:', gamesError);
        return { success: false, error: 'Failed to assign games' };
      }
    }

    // Create venue settings
    await supabase
      .from('venue_settings')
      .insert({ venue_id: newVenue.id });

    // Create launch options
    await supabase
      .from('launch_options')
      .insert({ venue_id: newVenue.id });

    // Create machine auth
    await supabase
      .from('machine_auth')
      .insert({
        venue_id: newVenue.id,
        product_id: `NGA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        product_key: Math.random().toString(36).substring(2, 18),
        access_level: 'admin'
      });

    // Update onboarding status
    await supabase
      .from('user_onboarding_status')
      .upsert({
        user_id: profileData.id,
        status: 'completed',
        venue_id: newVenue.id,
        machine_serial_number: serialNumber,
        setup_progress: {
          venue_created: true,
          venue_name: venueName,
          games_assigned: allGames?.length || 0,
          settings_configured: true,
          role_assigned: true
        },
        completed_at: new Date().toISOString()
      });

    return {
      success: true,
      venue: newVenue,
      venueName,
      serialNumber,
      gamesAssigned: allGames?.length || 0,
      message: 'User setup completed successfully'
    };

  } catch (error) {
    console.error('Setup creation error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function ensureAllGamesAssigned(venueId: string) {
  try {
    console.log('=== Ensuring All Games Assigned ===');
    console.log('Venue ID:', venueId);

    // Get all active games
    const { data: allGames, error: gamesError } = await supabase
      .from('games')
      .select('id, title')
      .eq('is_active', true);

    if (gamesError) {
      console.error('Error fetching games:', gamesError);
      return { success: false, error: 'Could not fetch games' };
    }

    console.log('Total active games:', allGames?.length || 0);

    // Get currently assigned games
    const { data: assignedGames, error: assignedError } = await supabase
      .from('machine_games')
      .select('game_id')
      .eq('venue_id', venueId);

    if (assignedError) {
      console.error('Error fetching assigned games:', assignedError);
      return { success: false, error: 'Could not fetch assigned games' };
    }

    const assignedGameIds = new Set(assignedGames?.map(ag => ag.game_id) || []);
    console.log('Currently assigned games:', assignedGameIds.size);

    // Find missing games
    const missingGames = allGames?.filter(game => !assignedGameIds.has(game.id)) || [];
    console.log('Missing games:', missingGames.length);

    if (missingGames.length > 0) {
      // Assign missing games
      const assignments = missingGames.map(game => ({
        venue_id: venueId,
        game_id: game.id,
        is_active: true,
        assigned_by: 'admin-fix'
      }));

      const { error: assignError } = await supabase
        .from('machine_games')
        .insert(assignments);

      if (assignError) {
        console.error('Error assigning missing games:', assignError);
        return { success: false, error: 'Could not assign missing games' };
      }

      console.log('Assigned missing games:', missingGames.length);
    }

    return {
      success: true,
      totalGames: allGames?.length || 0,
      previouslyAssigned: assignedGameIds.size,
      newlyAssigned: missingGames.length
    };

  } catch (error) {
    console.error('Game assignment error:', error);
    return { success: false, error: (error as Error).message };
  }
}
