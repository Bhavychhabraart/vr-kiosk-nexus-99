import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { Settings, Building2 } from "lucide-react";

const SimplifiedIndex = () => {
  const navigate = useNavigate();

  const handleMachineAdminAccess = () => {
    navigate('/machine-login');
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="space-y-6 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to VR Kiosk Management
        </h1>
        <p className="lead text-muted-foreground">
          Explore our virtual reality experiences and manage your kiosk settings.
        </p>
      </div>

      {/* Quick Admin Access */}
      <Card className="mb-8 bg-gradient-to-r from-vr-primary/10 to-vr-secondary/10 border-vr-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-vr-primary/20 rounded-full">
                <Settings className="h-8 w-8 text-vr-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-vr-primary">Machine Admin Access</h3>
                <p className="text-vr-muted">
                  Manage your VR kiosk settings, games, and analytics
                </p>
              </div>
            </div>
            <Button 
              onClick={handleMachineAdminAccess}
              className="bg-vr-primary hover:bg-vr-primary/90 text-white px-6 py-3"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Admin Access
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Games Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">Featured Game 1</h3>
            <p className="text-muted-foreground">
              Experience the thrill of virtual reality with our top-rated game.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">New Release: VR Adventure</h3>
            <p className="text-muted-foreground">
              Embark on an epic journey in a stunning virtual world.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">Multiplayer VR Arena</h3>
            <p className="text-muted-foreground">
              Join friends and compete in exciting multiplayer VR challenges.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SimplifiedIndex;
