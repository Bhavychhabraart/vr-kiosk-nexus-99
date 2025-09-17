
import { executeSetupForUser } from './completeUserSetup';
import { setupVrArcadiaUser } from './setupVrArcadia';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Auto-trigger setup when this module is imported
let setupExecuted = false;

export const triggerAutoSetup = async () => {
  if (setupExecuted) return;
  
  setupExecuted = true;
  console.log('Triggering auto-setup for both users...');
  
  try {
    // Setup original user
    const result1 = await executeSetupForUser();
    
    if (result1.success) {
      console.log('✅ Auto-setup completed successfully for Vrrealverse@gmail.com:', result1.message);
    } else {
      console.error('❌ Auto-setup failed for Vrrealverse@gmail.com:', result1.error);
    }

    // Setup VR Arcade user
    const result2 = await setupVrArcadiaUser();
    
    if (result2.success) {
      console.log('✅ Auto-setup completed successfully for vrarcadia003@gmail.com:', result2.message);
    } else {
      console.error('❌ Auto-setup failed for vrarcadia003@gmail.com:', result2.error);
    }

    // Mark setup as completed for both users using backend function
    if (result1.success && result1.venue_id) {
      try {
        await supabase.functions.invoke('mark-setup-completed', {
          body: { 
            email: 'Vrrealverse@gmail.com', 
            venueId: result1.venue_id 
          }
        });
        console.log('✅ Marked Vrrealverse@gmail.com setup as completed in backend');
      } catch (error) {
        console.error('❌ Failed to mark setup as completed for Vrrealverse@gmail.com:', error);
      }
    }

    if (result2.success && result2.venue_id) {
      try {
        await supabase.functions.invoke('mark-setup-completed', {
          body: { 
            email: 'vrarcadia003@gmail.com', 
            venueId: result2.venue_id 
          }
        });
        console.log('✅ Marked vrarcadia003@gmail.com setup as completed in backend');
      } catch (error) {
        console.error('❌ Failed to mark setup as completed for vrarcadia003@gmail.com:', error);
      }
    }

    // Show consolidated toast
    const successCount = (result1.success ? 1 : 0) + (result2.success ? 1 : 0);
    if (successCount > 0) {
      toast({
        title: "User Setup Complete",
        description: `${successCount} user(s) set up successfully`,
      });
    }
  } catch (error) {
    console.error('Auto-setup trigger error:', error);
  }
};

// Execute immediately
triggerAutoSetup();
