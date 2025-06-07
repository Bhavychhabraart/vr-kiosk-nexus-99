
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VrIcon } from "@/components/icons/VrIcon";
import { Play, Settings, Users, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isSuperAdmin, isMachineAdmin, isLoading } = useUserRoles();
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  // Auto-redirect machine admins to their admin panel
  useEffect(() => {
    if (!isLoading && user && isMachineAdmin && !isSuperAdmin) {
      // Direct machine admins straight to their admin panel
      navigate('/machine-admin');
    }
  }, [user, isMachineAdmin, isSuperAdmin, isLoading, navigate]);

  const handleStartExperience = () => {
    navigate('/games');
  };

  const handleAdminAccess = () => {
    if (user) {
      // Navigate based on user's highest role
      if (isSuperAdmin) {
        navigate('/superadmin');
      } else if (isMachineAdmin) {
        navigate('/machine-admin');
      } else {
        // Show admin options for users without specific roles
        setShowAdminOptions(true);
      }
    } else {
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowAdminOptions(false);
  };

  // Show loading while checking roles
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* User info in top right if logged in */}
      {user && (
        <div className="absolute top-6 right-6 z-20 flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md rounded-lg px-4 py-2">
            <User className="w-4 h-4 text-vr-primary" />
            <span className="text-white text-sm">{user.email}</span>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white p-1"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo and Branding */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <VrIcon className="w-24 h-24 text-vr-primary mr-4" />
            <div>
              <h1 className="text-6xl font-bold text-white mb-2">
                Next Gen
              </h1>
              <h2 className="text-4xl font-light text-vr-primary">
                Arcadia Kiosk
              </h2>
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of virtual reality entertainment
          </p>
        </div>

        {/* Main Start Button */}
        {!showAdminOptions ? (
          <div className="text-center space-y-8">
            <Button
              onClick={handleStartExperience}
              size="lg"
              className="h-20 px-16 text-2xl font-semibold bg-gradient-to-r from-vr-primary to-vr-secondary hover:from-vr-primary/90 hover:to-vr-secondary/90 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <Play className="mr-4 h-8 w-8" />
              START VR EXPERIENCE
            </Button>
            
            <div className="flex items-center justify-center space-x-4 mt-12">
              <Button
                onClick={handleAdminAccess}
                variant="ghost"
                className="text-gray-400 hover:text-white text-sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                {user ? (
                  isSuperAdmin ? 'Super Admin Dashboard' : 
                  isMachineAdmin ? 'Machine Admin Dashboard' : 
                  'Admin Dashboard'
                ) : 'Admin Login'}
              </Button>
            </div>
          </div>
        ) : (
          /* Admin Options for users without specific roles */
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-white text-center mb-8">
              Select Admin Type
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/30 border-vr-primary/30 hover:border-vr-primary transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => navigate('/admin')}>
                <CardContent className="p-8 text-center">
                  <Settings className="w-12 h-12 text-vr-primary mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">
                    System Admin
                  </h4>
                  <p className="text-gray-300">
                    General system administration and local management
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-vr-secondary/30 hover:border-vr-secondary transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => navigate('/machine-admin')}>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-vr-secondary mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">
                    Machine Admin
                  </h4>
                  <p className="text-gray-300">
                    Venue-specific management and cloud analytics
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={() => setShowAdminOptions(false)}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Back to Main
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-gray-500 text-sm">
            Powered by Next Gen Arcadia Technology
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
