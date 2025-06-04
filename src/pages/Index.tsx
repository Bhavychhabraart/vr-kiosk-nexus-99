
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VrIcon } from "@/components/icons/VrIcon";
import { Play, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/ui/animated-background";

const Index = () => {
  const navigate = useNavigate();
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  const handleStartExperience = () => {
    navigate('/games');
  };

  const handleAdminAccess = () => {
    setShowAdminOptions(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      <AnimatedBackground />
      
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
                Admin Access
              </Button>
            </div>
          </div>
        ) : (
          /* Admin Options */
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
