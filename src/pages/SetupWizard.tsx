
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { useMachineSetup } from "@/hooks/useMachineSetup";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Crown, Settings as SettingsIcon } from "lucide-react";

const SetupWizardPage = () => {
  const navigate = useNavigate();
  const { setupStatus, setupToken } = useMachineSetup();
  const { user, profile, signOut, isSuperAdmin, isAdmin, isSetupUser } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    // If setup is completed, redirect to appropriate page
    if (setupStatus?.current_status === 'completed') {
      navigate('/games');
      return;
    }
  }, [setupStatus, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header with user info */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="text-white">
              <p className="text-sm opacity-75">Setup User:</p>
              <p className="text-lg font-semibold">{profile?.full_name || profile?.email}</p>
            </div>
            <div className="flex gap-2">
              {isSuperAdmin() && (
                <Badge variant="outline" className="border-purple-500 text-purple-400">
                  <Crown className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              )}
              {isAdmin() && (
                <Badge variant="outline" className="border-green-500 text-green-400">
                  <SettingsIcon className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              {isSetupUser() && (
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  <User className="h-3 w-3 mr-1" />
                  Setup User
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back to Home
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Setup Wizard */}
      <SetupWizard />
    </div>
  );
};

export default SetupWizardPage;
