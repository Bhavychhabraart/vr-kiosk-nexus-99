
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
  Settings,
  CreditCard,
  Star,
  Package,
  Headphones
} from "lucide-react";

// Import machine-specific admin components
import MachineGamesManagementTab from "@/components/machine-admin/MachineGamesManagementTab";
import MachineAnalyticsTab from "@/components/machine-admin/MachineAnalyticsTab";
import MachineSettingsTab from "@/components/machine-admin/MachineSettingsTab";
import MachinePaymentsEarningsTab from "@/components/machine-admin/MachinePaymentsEarningsTab";
import MachineGamesShowcaseTab from "@/components/machine-admin/MachineGamesShowcaseTab";
import MachineProductCatalogTab from "@/components/machine-admin/MachineProductCatalogTab";
import MachineSupportTab from "@/components/machine-admin/MachineSupportTab";

const MachineAdmin = () => {
  const { isAuthenticated, machineSession, logout } = useMachineAuth();
  const [activeTab, setActiveTab] = useState("overview");

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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
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
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="showcase" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Showcase
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Catalog
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Support
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
            <MachineGamesManagementTab venueId={venue.id} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <MachineAnalyticsTab />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <MachinePaymentsEarningsTab venueId={venue.id} />
          </TabsContent>

          <TabsContent value="showcase" className="space-y-6">
            <MachineGamesShowcaseTab venueId={venue.id} />
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <MachineProductCatalogTab venueId={venue.id} />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <MachineSupportTab venueId={venue.id} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <MachineSettingsTab venueId={venue.id} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MachineAdmin;
