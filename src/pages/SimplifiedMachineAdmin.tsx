
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  LogOut, 
  Building2,
  Gamepad2,
  BarChart3,
  MapPin,
  CreditCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMachineAuth } from "@/hooks/useMachineAuth";
import MachineGamesManagementTab from "@/components/machine-admin/MachineGamesManagementTab";
import MachineAnalyticsTab from "@/components/machine-admin/MachineAnalyticsTab";
import MachinePaymentsEarningsTab from "@/components/machine-admin/MachinePaymentsEarningsTab";
import MachineSettingsTab from "@/components/machine-admin/MachineSettingsTab";

const SimplifiedMachineAdmin = () => {
  const { isAuthenticated, machineSession, logout } = useMachineAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/60 border-gray-600">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Building2 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="games" 
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Gamepad2 className="w-4 h-4" />
              Games
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
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
          </TabsContent>

          <TabsContent value="games" className="space-y-6 mt-6">
            <MachineGamesManagementTab venueId={venue.id} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <MachineAnalyticsTab />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 mt-6">
            <MachinePaymentsEarningsTab venueId={venue.id} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <MachineSettingsTab venueId={venue.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SimplifiedMachineAdmin;
