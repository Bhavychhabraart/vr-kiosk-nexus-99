
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  LogOut, 
  Building2,
  Gamepad2,
  BarChart3,
  MapPin,
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMachineAuth } from "@/hooks/useMachineAuth";

const SimplifiedMachineAdmin = () => {
  const { isAuthenticated, machineSession, logout } = useMachineAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !machineSession) {
      navigate('/machine-login');
    }
  }, [isAuthenticated, machineSession, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !machineSession) {
    return null; // Will redirect via useEffect
  }

  const { venue, auth } = machineSession;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {venue.name} Admin Dashboard
            </h1>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {venue.city}, {venue.state}
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {venue.machine_model || 'VR-KIOSK-V1'}
              </div>
              <Badge variant="outline" className="border-green-500 text-green-400">
                {venue.serial_number}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-4">
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

        {/* Machine Overview */}
        <div className="grid gap-6 mb-8">
          <Card className="bg-black/60 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-400" />
                Machine Information
              </CardTitle>
              <CardDescription className="text-gray-300">
                Current status and details for {venue.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">Machine Details</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Serial Number:</span>
                      <span className="font-mono">{venue.serial_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span>{venue.machine_model || 'VR-KIOSK-V1'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span>{venue.city}, {venue.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="default">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3">Access Information</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Product ID:</span>
                      <span className="font-mono">{auth.product_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Access Level:</span>
                      <span>{auth.access_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span>{auth.expires_at ? new Date(auth.expires_at).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-black/60 border-gray-600">
            <CardContent className="p-6 text-center">
              <Gamepad2 className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-medium text-white mb-2">Game Management</h3>
              <p className="text-sm text-gray-300 mb-4">
                Manage games, settings, and configurations
              </p>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Manage Games
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-gray-600">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-medium text-white mb-2">Analytics</h3>
              <p className="text-sm text-gray-300 mb-4">
                View performance metrics and reports
              </p>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-gray-600">
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <h3 className="font-medium text-white mb-2">Settings</h3>
              <p className="text-sm text-gray-300 mb-4">
                Configure kiosk settings and preferences
              </p>
              <Button 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700"
              >
                Machine Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedMachineAdmin;
