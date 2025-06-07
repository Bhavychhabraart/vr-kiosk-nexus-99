
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { User, Settings, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const ManualUserSetup = () => {
  const { user } = useAuth();
  const { startSetup, isSettingUp, onboardingStatus } = useOnboarding();
  const [setupInitiated, setSetupInitiated] = useState(false);

  const handleSetupUser = async () => {
    if (!user?.email) {
      toast({
        variant: "destructive",
        title: "Setup Error",
        description: "No authenticated user found",
      });
      return;
    }

    console.log('Setting up venue for user:', user.email);
    setSetupInitiated(true);
    startSetup();
  };

  const isCompleted = onboardingStatus?.status === 'completed';
  const hasFailed = onboardingStatus?.status === 'failed';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Manual User Setup
        </CardTitle>
        <CardDescription>
          Set up venue and games for the authenticated user: {user?.email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!setupInitiated && !isCompleted && (
            <div className="text-sm text-gray-600">
              This will automatically:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create a personalized venue for the user</li>
                <li>Assign all active games to their venue</li>
                <li>Configure payment and analytics systems</li>
                <li>Grant machine admin access</li>
              </ul>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>User setup completed successfully!</span>
            </div>
          )}

          {hasFailed && (
            <div className="text-red-600">
              Setup failed: {onboardingStatus?.error_message}
            </div>
          )}

          {isSettingUp && (
            <div className="text-blue-600">
              Setting up venue and games... This may take a few moments.
            </div>
          )}
          
          <Button 
            onClick={handleSetupUser}
            disabled={isSettingUp || isCompleted}
            className="w-full"
          >
            {isSettingUp ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Setting up user...
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Setup Complete
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Setup Venue for {user?.email}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualUserSetup;
