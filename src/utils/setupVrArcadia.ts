import { completeUserSetup } from './completeUserSetup';

// Setup function specifically for vrarcadia003@gmail.com
export async function setupVrArcadiaUser() {
  const email = 'vrarcadia003@gmail.com';
  console.log('Setting up VR Arcade user:', email);
  
  try {
    const result = await completeUserSetup(email);
    
    if (result.success) {
      console.log('✅ VR Arcade user setup completed successfully:', result.message);
      return result;
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