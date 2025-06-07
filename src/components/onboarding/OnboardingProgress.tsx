
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, Play, Loader2, Sparkles } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";

const OnboardingProgress = () => {
  const { onboardingStatus, isLoading, startSetup, isSettingUp, needsOnboarding, isInProgress } = useOnboarding();

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Checking Setup Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Show welcome screen for users who haven't started onboarding
  if (!onboardingStatus) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-blue-800 text-2xl">
            <Sparkles className="w-6 h-6" />
            Welcome to Next Gen Arcadia!
          </CardTitle>
          <CardDescription className="text-blue-600 text-lg">
            Let's set up your personalized VR arcade in just a few moments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="bg-white/70 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-2">Your automated setup will include:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  A personalized VR arcade venue
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  All 15+ premium games pre-installed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Payment systems (RFID + UPI) configured
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Analytics dashboard for business insights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Machine admin access granted
                </li>
              </ul>
            </div>
            
            <Button 
              onClick={startSetup} 
              disabled={isSettingUp}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSettingUp ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up your arcade...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
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
    { 
      key: 'venue_created', 
      label: 'Creating Your Venue', 
      completed: progress.venue_created,
      description: progress.venue_name ? `"${progress.venue_name}"` : 'Setting up your personalized arcade space'
    },
    { 
      key: 'games_assigned', 
      label: `Installing Games`, 
      completed: progress.games_assigned > 0,
      description: `${progress.games_assigned || 0} premium VR games`
    },
    { 
      key: 'settings_configured', 
      label: 'Configuring Systems', 
      completed: progress.settings_configured,
      description: 'Payment methods, launch options, and preferences'
    },
    { 
      key: 'role_assigned', 
      label: 'Granting Admin Access', 
      completed: progress.role_assigned,
      description: 'Machine admin dashboard access'
    }
  ];

  const completedSteps = progressSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / progressSteps.length) * 100;

  const getStatusBadge = () => {
    switch (onboardingStatus?.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Complete</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="w-3 h-3 mr-1" />Setting Up</Badge>;
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
          <span className="flex items-center gap-2">
            {isInProgress ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <Sparkles className="w-5 h-5 text-purple-600" />
            )}
            Arcade Setup Progress
          </span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          {onboardingStatus?.status === 'completed' 
            ? `Your arcade "${progress.venue_name || 'VR Arcade'}" is ready to serve customers!`
            : 'Setting up your VR arcade with all the essentials...'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-blue-600 font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-gray-100" 
          />
        </div>

        <div className="space-y-4">
          {progressSteps.map((step, index) => (
            <div key={step.key} className={`flex items-start gap-4 p-3 rounded-lg transition-all ${
              step.completed 
                ? 'bg-green-50 border border-green-200' 
                : isInProgress && index === completedSteps
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : isInProgress && index === completedSteps
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isInProgress && index === completedSteps ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${
                  step.completed ? 'text-green-800' : 
                  isInProgress && index === completedSteps ? 'text-blue-800' :
                  'text-gray-600'
                }`}>
                  {step.label}
                  {isInProgress && index === completedSteps && (
                    <span className="ml-2 text-sm font-normal">in progress...</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {onboardingStatus?.machine_serial_number && (
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
            <div className="text-sm font-medium text-gray-700 mb-1">Machine Details</div>
            <div className="text-xs text-gray-600">
              Serial: <span className="font-mono font-medium">{onboardingStatus.machine_serial_number}</span>
            </div>
          </div>
        )}

        {onboardingStatus?.error_message && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800 mb-2">Setup Error</div>
            <div className="text-sm text-red-600 mb-3">{onboardingStatus.error_message}</div>
            <Button 
              onClick={startSetup} 
              disabled={isSettingUp}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              {isSettingUp ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                'Retry Setup'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingProgress;
