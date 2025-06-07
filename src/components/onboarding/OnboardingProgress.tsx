
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, Play } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";

const OnboardingProgress = () => {
  const { onboardingStatus, isLoading, startSetup, isSettingUp, needsOnboarding } = useOnboarding();

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 animate-spin" />
            Checking Setup Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!onboardingStatus && needsOnboarding) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Play className="w-5 h-5" />
            Welcome to Next Gen Arcadia!
          </CardTitle>
          <CardDescription className="text-blue-600">
            Let's set up your VR arcade with all games and analytics ready to go
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-blue-700">
              Your automated setup will include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>A personalized VR arcade venue</li>
                <li>All 15+ games pre-installed and ready</li>
                <li>Payment systems (RFID + UPI) configured</li>
                <li>Analytics dashboard ready for tracking</li>
                <li>Admin access to manage everything</li>
              </ul>
            </div>
            <Button 
              onClick={startSetup} 
              disabled={isSettingUp}
              className="w-full"
            >
              {isSettingUp ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Setting up your arcade...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Automated Setup
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = onboardingStatus?.setup_progress || {};
  const progressSteps = [
    { key: 'venue_created', label: 'Venue Created', completed: progress.venue_created },
    { key: 'games_assigned', label: `Games Assigned (${progress.games_assigned || 0})`, completed: progress.games_assigned > 0 },
    { key: 'settings_configured', label: 'Settings Configured', completed: progress.settings_configured },
    { key: 'role_assigned', label: 'Admin Access Granted', completed: progress.role_assigned }
  ];

  const completedSteps = progressSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / progressSteps.length) * 100;

  const getStatusBadge = () => {
    switch (onboardingStatus?.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Complete</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Arcade Setup Progress</span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          {onboardingStatus?.status === 'completed' 
            ? `Your arcade "${progress.venue_name || 'VR Arcade'}" is ready!`
            : 'Setting up your VR arcade...'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <div className="space-y-3">
          {progressSteps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`flex-1 ${step.completed ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {onboardingStatus?.machine_serial_number && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">Machine Details</div>
            <div className="text-xs text-gray-600 mt-1">
              Serial: {onboardingStatus.machine_serial_number}
            </div>
          </div>
        )}

        {onboardingStatus?.error_message && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800">Setup Error</div>
            <div className="text-xs text-red-600 mt-1">{onboardingStatus.error_message}</div>
            <Button 
              onClick={startSetup} 
              disabled={isSettingUp}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry Setup
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingProgress;
