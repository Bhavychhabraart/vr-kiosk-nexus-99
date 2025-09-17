import { completeUserSetup } from './completeUserSetup';
import { supabase } from '@/integrations/supabase/client';

// Setup function specifically for vrarcadia003@gmail.com
export async function setupVrArcadiaUser() {
  const email = 'vrarcadia003@gmail.com';
  console.log('Setting up VR Arcade user:', email);
  
  try {
    const result = await completeUserSetup(email);
    
    if (result.success && result.venue_id) {
      console.log('✅ VR Arcade user setup completed successfully:', result.message);
      
      // Ensure all games are assigned to the venue
      console.log('Assigning all active games to venue:', result.venue_id);
      const { data: gamesResult, error: gamesError } = await supabase
        .rpc('assign_all_games_to_venue', {
          venue_id_param: result.venue_id
        });

      if (gamesError) {
        console.error('❌ Error assigning games:', gamesError);
        return {
          success: true,
          message: result.message + ' (Warning: Some games may not be assigned)',
          venue_id: result.venue_id
        };
      }

      console.log('✅ All games assigned successfully:', gamesResult);
      const assignedCount = (gamesResult as any)?.games_assigned || 'all available';
      return {
        success: true,
        message: result.message + ` - ${assignedCount} games assigned`,
        venue_id: result.venue_id
      };
    } else {
      console.error('❌ VR Arcade user setup failed:', result.error);
      return result;
    }
  } catch (error) {
    console.error('VR Arcade setup trigger error:', error);
    return {
      success: false,
      message: 'Setup failed',
      error: 'An unexpected error occurred during setup'
    };
  }
}