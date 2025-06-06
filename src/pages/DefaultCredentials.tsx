
import { DefaultCredentialsHelper } from '@/components/auth/DefaultCredentialsHelper';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const DefaultCredentials = () => {
  const navigate = useNavigate();

  const handleCredentialSelect = (email: string, password: string, serialNumber: string) => {
    // Navigate to auth page with pre-filled data
    navigate('/auth', { 
      state: { 
        prefillData: { email, password, serialNumber },
        defaultTab: 'machine-signup'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vr-primary/10 to-vr-secondary/10 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Default Machine Credentials</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pre-configured credentials for all active VR machines. Use these for initial setup, 
              testing, or as a reference for machine owners.
            </p>
          </div>
        </div>

        <DefaultCredentialsHelper onCredentialSelect={handleCredentialSelect} />
      </div>
    </div>
  );
};

export default DefaultCredentials;
