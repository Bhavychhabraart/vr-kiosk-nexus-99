
import { executeSetupForUser } from './completeUserSetup';
import { setupVrArcadiaUser } from './setupVrArcadia';
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
