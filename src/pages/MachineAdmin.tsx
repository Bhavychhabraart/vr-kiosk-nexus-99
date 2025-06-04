import { useState } from "react";
import { useMachineAuth } from "@/hooks/useMachineAuth";
import MachineAuthLogin from "@/components/auth/MachineAuthLogin";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Gamepad2, 
  BarChart3, 
  LogOut,
  MapPin,
  Calendar,
  Settings
} from "lucide-react";
import { useMachineGames } from "@/hooks/useMachineGames";

const MachineAdmin = () => {
  const { isAuthenticated, machineSession, logout } = useMachineAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { machineGames, isLoadingMachineGames } = useMachineGames(
    machineSession?.venue?.id
  );

  if (!isAuthenticated || !machineSession) {
    return <MachineAuthLogin onSuccess={() => {}} />;
  }

  const { venue, auth } = machineSession;

  return (
    <MainLayout backgroundVariant="grid" withPattern intensity="low">
      <div className="space-y-8">
        {/* Header with Machine Info */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent">
              {venue.name} Admin Panel
            </h1>
            <div className="flex items-center gap-4 mt-2 text-vr-muted">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {venue.city}, {venue.state}
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {venue.machine_model}
              </div>
              <Badge variant="outline">
                Product ID: {auth.product_id}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="px-4 py-2">
              Access Level: {auth.access_level}
            </Badge>
            <Button variant="outline" onClick={logout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Games</CardTitle>
              <Gamepad2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingMachineGames ? '...' : machineGames?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Games assigned to this machine
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Machine Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                System operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +3 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹2,840</div>
              <p className="text-xs text-muted-foreground">
                +15% from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Games
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Machine Overview</CardTitle>
                <CardDescription>
                  Current status and quick information about {venue.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Machine Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Serial Number:</span> {venue.serial_number}</p>
                      <p><span className="font-medium">Model:</span> {venue.machine_model}</p>
                      <p><span className="font-medium">Location:</span> {venue.city}, {venue.state}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Access Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Product ID:</span> {auth.product_id}</p>
                      <p><span className="font-medium">Access Level:</span> {auth.access_level}</p>
                      <p><span className="font-medium">Expires:</span> {auth.expires_at ? new Date(auth.expires_at).toLocaleDateString() : 'Never'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Games</CardTitle>
                <CardDescription>
                  Games currently available on this machine
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMachineGames ? (
                  <div className="text-center py-8">Loading games...</div>
                ) : machineGames && machineGames.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {machineGames.map((game) => (
                      <Card key={game.id} className="overflow-hidden">
                        {game.image_url && (
                          <div className="aspect-video bg-gray-200">
                            <img 
                              src={game.image_url} 
                              alt={game.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold">{game.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {game.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant="secondary">Active</Badge>
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(game.min_duration_seconds / 60)}-{Math.floor(game.max_duration_seconds / 60)} min
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No games assigned to this machine</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Machine Analytics</CardTitle>
                <CardDescription>
                  Performance metrics for {venue.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will show machine-specific performance data
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Machine Settings</CardTitle>
                <CardDescription>
                  Configure settings for {venue.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Settings panel coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will allow machine-specific configuration
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MachineAdmin;
