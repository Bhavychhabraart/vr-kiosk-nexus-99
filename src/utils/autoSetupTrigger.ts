
import { setupVrRealverseUser } from './setupSpecificUser';

export async function executeSetupForUser() {
  try {
    console.log('Auto-executing user setup for vrrealverse@gmail.com...');
    
    // Execute setup for the specific user
    const result = await setupVrRealverseUser();
    
    if (result.success) {
      console.log('✅ Auto-setup completed successfully:', result.message);
      
      // Store success in localStorage for the notification component
      localStorage.setItem('autoSetupResult', JSON.stringify({
        success: true,
        message: result.message,
        venue_id: result.venue_id,
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
