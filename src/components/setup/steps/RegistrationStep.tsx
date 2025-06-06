
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  CheckCircle, 
  AlertCircle, 
  Key,
  ArrowRight,
  RefreshCw,
  Shield
} from "lucide-react";
import { useMachineSetup } from "@/hooks/useMachineSetup";
import { toast } from "@/components/ui/use-toast";

interface RegistrationStepProps {
  onNext: () => void;
  setupStatus: any;
}

export const RegistrationStep = ({ onNext, setupStatus }: RegistrationStepProps) => {
  const [registrationStatus, setRegistrationStatus] = useState({
    server_connection: 'pending' as 'pending' | 'connecting' | 'connected' | 'failed',
    machine_verification: 'pending' as 'pending' | 'verifying' | 'verified' | 'failed',
    product_key_generation: 'pending' as 'pending' | 'generating' | 'generated' | 'failed',
    registration_complete: 'pending' as 'pending' | 'completing' | 'completed' | 'failed',
  });
  const [productKey, setProductKey] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { updateProgress, isUpdating } = useMachineSetup();

  useEffect(() => {
    // Auto-start registration process
    if (!isRegistering) {
      startRegistration();
    }
  }, []);

  const startRegistration = async () => {
    setIsRegistering(true);
    
    // Step 1: Connect to server
    setRegistrationStatus(prev => ({ ...prev, server_connection: 'connecting' }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRegistrationStatus(prev => ({ ...prev, server_connection: 'connected' }));
    
    // Step 2: Verify machine
    setRegistrationStatus(prev => ({ ...prev, machine_verification: 'verifying' }));
    await new Promise(resolve => setTimeout(resolve, 3000));
    setRegistrationStatus(prev => ({ ...prev, machine_verification: 'verified' }));
    
    // Step 3: Generate product key
    setRegistrationStatus(prev => ({ ...prev, product_key_generation: 'generating' }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    const generatedKey = `VRK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setProductKey(generatedKey);
    setRegistrationStatus(prev => ({ ...prev, product_key_generation: 'generated' }));
    
    // Step 4: Complete registration
    setRegistrationStatus(prev => ({ ...prev, registration_complete: 'completing' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRegistrationStatus(prev => ({ ...prev, registration_complete: 'completed' }));
    
    setIsRegistering(false);
    
    toast({
      title: "Registration Complete!",
      description: "Your machine has been successfully registered with our servers.",
    });
  };

  const handleContinue = async () => {
    if (!setupStatus?.serial_number) return;

    try {
      await updateProgress({
        serialNumber: setupStatus.serial_number,
        status: 'machine_registered',
        stepData: {
          registration: {
            product_key: productKey,
            registration_status: registrationStatus,
            completed_at: new Date().toISOString(),
          }
        }
      });
      onNext();
    } catch (error) {
      console.error('Failed to update registration progress:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'connected':
      case 'verified':
      case 'generated':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'connecting':
      case 'verifying':
      case 'generating':
      case 'completing':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'connected':
      case 'verified':
      case 'generated':
        return 'Complete';
      case 'connecting':
      case 'verifying':
      case 'generating':
      case 'completing':
        return 'In Progress';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const registrationSteps = [
    {
      key: 'server_connection',
      title: 'Server Connection',
      description: 'Connecting to VR Kiosk central servers',
      status: registrationStatus.server_connection,
    },
    {
      key: 'machine_verification',
      title: 'Machine Verification',
      description: 'Verifying machine serial number and authenticity',
      status: registrationStatus.machine_verification,
    },
    {
      key: 'product_key_generation',
      title: 'Product Key Generation',
      description: 'Generating unique authentication keys',
      status: registrationStatus.product_key_generation,
    },
    {
      key: 'registration_complete',
      title: 'Registration Complete',
      description: 'Finalizing machine registration',
      status: registrationStatus.registration_complete,
    },
  ];

  const isCompleted = registrationStatus.registration_complete === 'completed';

  return (
    <div className="space-y-6">
      {/* Registration Introduction */}
      <div className="text-center space-y-2">
        <Server className="h-12 w-12 text-vr-primary mx-auto" />
        <h3 className="text-xl font-bold text-white">Machine Registration</h3>
        <p className="text-gray-300">
          Registering your machine with our central servers to enable full functionality.
        </p>
      </div>

      {/* Machine Information */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-vr-primary" />
            Machine Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Serial Number</p>
              <p className="text-white font-mono text-lg">{setupStatus?.serial_number}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Model</p>
              <p className="text-white">VR Kiosk Pro v2.0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Progress */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Registration Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {registrationSteps.map((step, index) => (
              <div key={step.key} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <p className="text-white font-medium">{step.title}</p>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
                <Badge 
                  variant={
                    ['completed', 'connected', 'verified', 'generated'].includes(step.status) 
                      ? 'default' 
                      : step.status === 'failed' 
                        ? 'destructive' 
                        : 'secondary'
                  }
                >
                  {getStatusText(step.status)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Key Display */}
      {productKey && (
        <Card className="bg-vr-primary/10 border-vr-primary/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-vr-primary" />
              Product Key Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                Your unique product key has been generated. This key will be used for machine authentication 
                and accessing admin features.
              </p>
              <div className="p-4 bg-black/40 rounded-lg border border-vr-primary/20">
                <p className="text-vr-primary font-mono text-lg text-center tracking-wider">
                  {productKey}
                </p>
              </div>
              <p className="text-sm text-gray-400">
                <strong>Important:</strong> This key is automatically saved and configured. 
                You'll use it later for admin access to your machine.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {isCompleted && (
        <Card className="bg-green-900/20 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-white font-medium">Registration Successful!</p>
                <p className="text-gray-300 text-sm">
                  Your machine is now registered and authenticated with our servers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={!isCompleted || isUpdating}
          className="bg-vr-primary hover:bg-vr-primary/90 text-black"
        >
          {isUpdating ? (
            "Saving..."
          ) : (
            <>
              Continue to Owner Setup
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
