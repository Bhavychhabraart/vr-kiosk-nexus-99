
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Users, Settings } from "lucide-react";

const ExistingUsersSetup = () => {
  const { setupExistingUsers, isBatchSetup } = useOnboarding();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Batch Setup for Existing Users
        </CardTitle>
        <CardDescription>
          Set up venues and games for existing users who don't have a machine assigned
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            This will automatically:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Find users without venue assignments</li>
              <li>Create personalized venues for each user</li>
              <li>Assign all active games to their venues</li>
              <li>Configure payment and analytics systems</li>
              <li>Grant machine admin access</li>
            </ul>
          </div>
          
          <Button 
            onClick={setupExistingUsers}
            disabled={isBatchSetup}
            className="w-full"
          >
            {isBatchSetup ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Setting up existing users...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Setup Existing Users
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExistingUsersSetup;
