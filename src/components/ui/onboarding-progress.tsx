
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Settings, Gamepad2, CreditCard, Shield, Loader2 } from "lucide-react";
import { OnboardingStatus } from "@/hooks/useOnboarding";

interface OnboardingProgressProps {
  status: OnboardingStatus;
}

const getStepProgress = (step: string) => {
  switch (step) {
    case 'creating_venue': return 20;
    case 'assigning_games': return 40;
    case 'configuring_settings': return 60;
    case 'assigning_role': return 80;
    case 'completed': return 100;
    default: return 0;
  }
};

const getStepIcon = (step: string, isActive: boolean, isCompleted: boolean) => {
  const iconClass = `h-5 w-5 ${isCompleted ? 'text-green-500' : isActive ? 'text-blue-500' : 'text-gray-400'}`;
  
  switch (step) {
    case 'creating_venue':
      return isActive ? <Loader2 className={`${iconClass} animate-spin`} /> : <Settings className={iconClass} />;
    case 'assigning_games':
      return isActive ? <Loader2 className={`${iconClass} animate-spin`} /> : <Gamepad2 className={iconClass} />;
    case 'configuring_settings':
      return isActive ? <Loader2 className={`${iconClass} animate-spin`} /> : <CreditCard className={iconClass} />;
    case 'assigning_role':
      return isActive ? <Loader2 className={`${iconClass} animate-spin`} /> : <Shield className={iconClass} />;
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Settings className={iconClass} />;
  }
};

export const OnboardingProgress = ({ status }: OnboardingProgressProps) => {
  const currentStep = status.setup_progress?.step || 'pending';
  const currentMessage = status.setup_progress?.message || 'Initializing your VR machine setup...';
  const progress = getStepProgress(currentStep);

  const steps = [
    { key: 'creating_venue', label: 'Creating Your Venue', description: 'Setting up your VR arcade location' },
    { key: 'assigning_games', label: 'Adding Games', description: 'Installing all available VR games' },
    { key: 'configuring_settings', label: 'Payment Setup', description: 'Configuring RFID and UPI payments' },
    { key: 'assigning_role', label: 'Admin Access', description: 'Granting you administrator privileges' },
    { key: 'completed', label: 'Ready to Go!', description: 'Your VR machine is fully operational' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/80 border-vr-primary/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-white mb-2">
            Setting up your VR Machine
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            We're creating a complete VR arcade experience just for you
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Setup Progress</span>
              <Badge variant={progress === 100 ? "default" : "secondary"}>
                {progress}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="h-3 bg-gray-700" />
          </div>

          {/* Current Status */}
          <div className="text-center py-4">
            <div className="text-xl text-white mb-2">{currentMessage}</div>
            {status.machine_serial_number && (
              <div className="text-sm text-gray-400">
                Machine ID: <span className="font-mono text-vr-primary">{status.machine_serial_number}</span>
              </div>
            )}
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = getStepProgress(step.key) < progress || progress === 100;
              const isActive = step.key === currentStep;
              
              return (
                <div 
                  key={step.key}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                    isActive ? 'bg-vr-primary/10 border border-vr-primary/30' : 
                    isCompleted ? 'bg-green-500/10 border border-green-500/30' : 
                    'bg-gray-800/30'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getStepIcon(step.key, isActive, isCompleted)}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isCompleted ? 'text-green-400' : isActive ? 'text-white' : 'text-gray-400'}`}>
                      {step.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {step.description}
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* What's Being Set Up */}
          <div className="bg-gray-800/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">What's being set up:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">10+ Premium VR Games</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">RFID Payment System</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">UPI QR Code Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">Analytics Dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">Customer Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">Revenue Tracking</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
