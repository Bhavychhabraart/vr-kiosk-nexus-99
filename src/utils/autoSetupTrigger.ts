
import { executeSetupForUser } from './completeUserSetup';
import { toast } from '@/components/ui/use-toast';

// Auto-trigger setup when this module is imported
let setupExecuted = false;

export const triggerAutoSetup = async () => {
  if (setupExecuted) return;
  
  setupExecuted = true;
  console.log('Triggering auto-setup for Vrrealverse@gmail.com...');
  
  try {
    const result = await executeSetupForUser();
    
    if (result.success) {
      console.log('✅ Auto-setup completed successfully:', result.message);
      toast({
        title: "User Setup Complete",
        description: `Setup completed for Vrrealverse@gmail.com: ${result.message}`,
      });
    } else {
      console.error('❌ Auto-setup failed:', result.error);
      toast({
        title: "Setup Failed",
        description: result.error || 'Unknown error occurred',
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Auto-setup trigger error:', error);
  }
};

// Execute immediately
triggerAutoSetup();
