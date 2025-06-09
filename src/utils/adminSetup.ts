import { supabase } from '@/integrations/supabase/client';

export async function checkUserSetup(email: string) {
  try {
    console.log('=== Checking User Setup ===');
    console.log('Email:', email);

    // Get user from auth.users (this requires admin access)
    const { data, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { success: false, error: 'Could not fetch user data' };
    }

    const user = data.users.find(u => u.email === email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    console.log('Found user:', { id: user.id, email: user.email });

    // Check user roles
    const { data: roles, error: rolesError } = await supabase
      .from('simplified_user_roles')
      .select('*')
      .eq('user_id', user.id)
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
            user: { id: user.id, email: user.email },
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
      user: { id: user.id, email: user.email },
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
    return { success: false, error: error.message };
  }
}
