
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useMachineVenue } from "@/hooks/useMachineVenue";
import { RefreshProvider } from "@/contexts/RefreshContext";
import { QueryClient } from "@tanstack/react-query";
import MachineAuthLogin from "@/components/auth/MachineAuthLogin";
import MainLayout from "@/components/layout/MainLayout";
import AdminPinProtection from "@/components/admin/AdminPinProtection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Gamepad2, 
  BarChart3, 
  LogOut,
  MapPin,
  Settings,
  CreditCard,
  Star,
  Package,
  Headphones,
  Shield,
  Zap,
  DollarSign
} from "lucide-react";

// Import machine-specific admin components
import MachineGameManagementTab from "@/components/machine-admin/MachineGameManagementTab";
import MachineAnalyticsTab from "@/components/machine-admin/MachineAnalyticsTab";
import MachineSettingsTab from "@/components/machine-admin/MachineSettingsTab";
import MachinePaymentsEarningsTab from "@/components/machine-admin/MachinePaymentsEarningsTab";
import MachineGamesShowcaseTab from "@/components/machine-admin/MachineGamesShowcaseTab";
import MachineProductCatalogTab from "@/components/machine-admin/MachineProductCatalogTab";
import MachineSupportTab from "@/components/machine-admin/MachineSupportTab";
import MachineLaunchOptionsTab from "@/components/machine-admin/MachineLaunchOptionsTab";
import MachineGamePricingTab from "@/components/machine-admin/MachineGamePricingTab";

const MachineAdmin = () => {
  const { user, signOut } = useAuth();
  const { isMachineAdmin, isLoading: rolesLoading } = useUserRoles();
  const { machineVenueData, isLoading: venueLoading, hasMultipleVenues, userVenues } = useMachineVenue();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Create a query client instance for RefreshProvider
  const queryClient = new QueryClient();

  // Show loading while checking authentication and roles
  if (rolesLoading || venueLoading) {
    return (
      <RefreshProvider queryClient={queryClient}>
        <MainLayout backgroundVariant="grid" withPattern intensity="low">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary"></div>
          </div>
        </MainLayout>
      </RefreshProvider>
    );
  }

  // If no venue data available, show error
  if (!machineVenueData && !hasMultipleVenues) {
    return (
      <RefreshProvider queryClient={queryClient}>
        <MainLayout backgroundVariant="grid" withPattern intensity="low">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">No Venue Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">You don't have access to any venues. Please contact your administrator.</p>
              <Button onClick={signOut} className="mt-4">
                Logout
              </Button>
            </CardContent>
          </Card>
        </MainLayout>
      </RefreshProvider>
    );
  }

  // Use selected venue or the auto-detected venue
  const currentVenue = hasMultipleVenues 
    ? userVenues?.find(v => v.id === selectedVenueId)
    : machineVenueData?.venue;

  const currentAuth = hasMultipleVenues 
    ? { product_id: 'MULTI-VENUE', access_level: 'admin', expires_at: null }
    : machineVenueData?.auth;

  // If multiple venues but none selected, show venue selector
  if (hasMultipleVenues && !selectedVenueId) {
    return (
      <RefreshProvider queryClient={queryClient}>
        <MainLayout backgroundVariant="grid" withPattern intensity="low">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent">
                  Select Your Venue
                </h1>
                <p className="text-vr-muted mt-2">Choose which venue you want to manage</p>
              </div>
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Available Venues</CardTitle>
                <CardDescription>
                  You have access to multiple venues. Select one to manage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a venue to manage..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userVenues?.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium">{venue.name}</span>
                          <span className="text-muted-foreground">({venue.city})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </RefreshProvider>
    );
  }

  if (!currentVenue) {
    return (
      <RefreshProvider queryClient={queryClient}>
        <MainLayout backgroundVariant="grid" withPattern intensity="low">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Venue Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">Selected venue could not be found.</p>
            </CardContent>
          </Card>
        </MainLayout>
      </RefreshProvider>
    );
  }

  // If user is not logged in or not a machine admin, show login
  if (!user || !isMachineAdmin) {
    return <MachineAuthLogin onSuccess={() => {}} />;
  }

  // Wrap admin content with PIN protection and refresh provider
  const AdminContent = () => (
    <div className="space-y-8">
      {/* Header with Machine Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent">
            {currentVenue.name} Admin Panel
          </h1>
          <div className="flex items-center gap-4 mt-2 text-vr-muted">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {currentVenue.city}, {currentVenue.state}
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {currentVenue.machine_model || 'VR-KIOSK-V1'}
            </div>
            <Badge variant="outline">
              Product ID: {currentAuth?.product_id}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="default" className="px-4 py-2">
            <Shield className="w-4 h-4 mr-1" />
            Protected Access
          </Badge>
          {hasMultipleVenues && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedVenueId("")}
              className="flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Switch Venue
            </Button>
          )}
          <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="launch-options" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Launch
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing
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
                Current status and quick information about {currentVenue.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Machine Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Serial Number:</span> {currentVenue.serial_number || 'AUTO-DETECTED'}</p>
                    <p><span className="font-medium">Model:</span> {currentVenue.machine_model || 'VR-KIOSK-V1'}</p>
                    <p><span className="font-medium">Location:</span> {currentVenue.city}, {currentVenue.state}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Access Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Product ID:</span> {currentAuth?.product_id}</p>
                    <p><span className="font-medium">Access Level:</span> {currentAuth?.access_level}</p>
                    <p><span className="font-medium">Expires:</span> {currentAuth?.expires_at ? new Date(currentAuth.expires_at).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <MachineGameManagementTab venueId={currentVenue.id} />
        </TabsContent>

        <TabsContent value="launch-options" className="space-y-6">
          <MachineLaunchOptionsTab venueId={currentVenue.id} />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <MachineGamePricingTab venueId={currentVenue.id} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <MachineAnalyticsTab venueId={currentVenue.id} />
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <MachinePaymentsEarningsTab venueId={currentVenue.id} />
        </TabsContent>

        <TabsContent value="showcase" className="space-y-6">
          <MachineGamesShowcaseTab venueId={currentVenue.id} />
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          <MachineProductCatalogTab venueId={currentVenue.id} />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <MachineSupportTab venueId={currentVenue.id} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <MachineSettingsTab venueId={currentVenue.id} />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <RefreshProvider queryClient={queryClient}>
      <MainLayout backgroundVariant="grid" withPattern intensity="low">
        <AdminPinProtection 
          venueId={currentVenue.id} 
          onSuccess={() => setIsAdminAuthenticated(true)}
        >
          <AdminContent />
        </AdminPinProtection>
      </MainLayout>
    </RefreshProvider>
  );
};

export default MachineAdmin;
