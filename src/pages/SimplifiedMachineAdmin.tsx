
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  LogOut, 
  Crown,
  Building2,
  Gamepad2,
  BarChart3,
  MapPin
} from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useNavigate } from "react-router-dom";
import { useVenues } from "@/hooks/useVenues";

const SimplifiedMachineAdmin = () => {
  const { user, profile, signOut, isSuperAdmin, isMachineAdmin, userRoles } = useSimplifiedAuth();
  const { venues } = useVenues();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Get the venues this machine admin can manage
  const managedVenues = venues?.filter(venue => 
    isSuperAdmin() || userRoles.some(role => 
      role.role === 'machine_admin' && 
      role.venue_id === venue.id && 
      role.is_active
    )
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Machine Admin Dashboard
            </h1>
            <p className="text-gray-300">
              Welcome back, {profile?.full_name || profile?.email}
            </p>
            <div className="flex gap-2 mt-2">
              {isSuperAdmin() && (
                <Badge variant="outline" className="border-purple-500 text-purple-400">
                  <Crown className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              )}
              {isMachineAdmin() && (
                <Badge variant="outline" className="border-green-500 text-green-400">
                  <Settings className="h-3 w-3 mr-1" />
                  Machine Admin
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            {isSuperAdmin() && (
              <Button 
                onClick={() => navigate('/super-admin')}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Super Admin
              </Button>
            )}
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

        {/* Managed Venues */}
        <div className="grid gap-6">
          <Card className="bg-black/60 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-400" />
                Your Managed Venues
              </CardTitle>
              <CardDescription className="text-gray-300">
                VR kiosks under your administration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {managedVenues.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {managedVenues.map((venue) => (
                    <Card key={venue.id} className="bg-gray-800 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-white">{venue.name}</h3>
                          <Badge 
                            variant={venue.status === 'active' ? 'default' : 'secondary'}
                            className={venue.status === 'active' ? 'bg-green-600' : ''}
                          >
                            {venue.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <MapPin className="h-3 w-3" />
                            {venue.city}, {venue.state}
                          </div>
                          <div className="text-sm text-gray-400">
                            Model: {venue.machine_model || 'VR-KIOSK-V1'}
                          </div>
                          <div className="text-sm text-gray-400">
                            Serial: {venue.serial_number || 'N/A'}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                          >
                            <Gamepad2 className="h-3 w-3 mr-1" />
                            Games
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                          >
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Venues Assigned</h3>
                  <p className="text-gray-300 mb-4">
                    You haven't been assigned to any venues yet.
                  </p>
                  <p className="text-sm text-gray-400">
                    Contact your Super Admin to get access to a venue.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
                  disabled={managedVenues.length === 0}
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
                  disabled={managedVenues.length === 0}
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
                  disabled={managedVenues.length === 0}
                >
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedMachineAdmin;
