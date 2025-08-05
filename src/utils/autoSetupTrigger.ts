
import { completeUserSetup } from './completeUserSetup';

export async function executeSetupForUser() {
  try {
    console.log('Auto-executing user setup...');
    
    // Execute setup for the specific user
    const result = await completeUserSetup('Vrrealverse@gmail.com');
    
    if (result.success) {
      console.log('✅ Auto-setup completed successfully:', result.message);
      
      // Store success in localStorage for the notification component
      localStorage.setItem('autoSetupResult', JSON.stringify({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.log('❌ Auto-setup failed:', result.error);
      
      // Store failure in localStorage for retry
      localStorage.setItem('autoSetupResult', JSON.stringify({
        success: false,
        error: result.error || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }));
    }
    
    return result;
  } catch (error) {
    console.error('Auto-setup error:', error);
    
    localStorage.setItem('autoSetupResult', JSON.stringify({
      success: false,
      error: 'Unexpected error during auto-setup',
      timestamp: new Date().toISOString()
    }));
    
    return {
      success: false,
      error: 'Unexpected error during auto-setup'
    };
  }
}
