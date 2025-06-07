
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import MainLayout from "@/components/layout/MainLayout";
import VenueFilter from "@/components/admin/VenueFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Gamepad2, 
  BarChart3, 
  LogOut,
  Settings,
  CreditCard,
  Star,
  Package,
  Headphones,
  Shield,
  Users
} from "lucide-react";

// Import admin components
import GamesManagementTab from "@/components/admin/GamesManagementTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import SettingsTab from "@/components/admin/SettingsTab";
import PaymentsEarningsTab from "@/components/admin/PaymentsEarningsTab";
import GamesShowcaseTab from "@/components/admin/GamesShowcaseTab";
import ProductCatalogTab from "@/components/admin/ProductCatalogTab";
import SupportTab from "@/components/admin/SupportTab";
import UserVenueManagement from "@/components/admin/UserVenueManagement";

const Admin = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { isSuperAdmin, isMachineAdmin, userVenues, isLoading: rolesLoading } = useUserRoles();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  // Redirect non-authenticated users to auth page
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Redirect users with specific roles to their proper dashboards
  useEffect(() => {
    if (!rolesLoading && user) {
      if (isSuperAdmin) {
        navigate('/superadmin');
      } else if (isMachineAdmin && userVenues && userVenues.length === 1) {
        // If machine admin has only one venue, redirect to machine admin panel
        navigate('/machine-admin');
      }
    }
  }, [isSuperAdmin, isMachineAdmin, rolesLoading, user, userVenues, navigate]);

  // Auto-select venue if user has only one venue
  useEffect(() => {
    if (userVenues && userVenues.length === 1 && !selectedVenueId) {
      setSelectedVenueId(userVenues[0].id);
    }
  }, [userVenues, selectedVenueId]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || rolesLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // If user has specific roles, they'll be redirected by useEffect
  if (isSuperAdmin || (isMachineAdmin && userVenues && userVenues.length === 1)) {
    return <div>Redirecting...</div>;
  }

  return (
    <MainLayout backgroundVariant="grid" withPattern intensity="low">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-vr-muted mt-2">
              Manage your assigned venues and operations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Badge>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Venue Filter */}
        <VenueFilter
          selectedVenueId={selectedVenueId}
          onVenueChange={setSelectedVenueId}
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9">
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
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned Venues</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-vr-primary">
                    {userVenues?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Venues under your management
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Venue</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-vr-secondary">
                    {selectedVenueId ? userVenues?.find(v => v.id === selectedVenueId)?.name : "Select Venue"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedVenueId ? "Currently viewing" : "No venue selected"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Access Level</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-green-600">
                    {isMachineAdmin ? "Machine Admin" : "Admin"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your role permissions
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Admin Overview</CardTitle>
                <CardDescription>
                  Welcome to your admin panel. Select a venue above to view specific data and manage operations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedVenueId ? (
                  <div className="text-center p-8">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Select a Venue</h3>
                    <p className="text-muted-foreground">
                      Choose a venue from the filter above to view analytics, manage games, and access other admin features.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Managing: {userVenues?.find(v => v.id === selectedVenueId)?.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Location:</span>{" "}
                        {userVenues?.find(v => v.id === selectedVenueId)?.city}, {userVenues?.find(v => v.id === selectedVenueId)?.state}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <GamesManagementTab selectedVenueId={selectedVenueId} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab selectedVenueId={selectedVenueId} />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <PaymentsEarningsTab selectedVenueId={selectedVenueId} />
          </TabsContent>

          <TabsContent value="showcase" className="space-y-6">
            <GamesShowcaseTab selectedVenueId={selectedVenueId} />
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <ProductCatalogTab />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserVenueManagement selectedVenueId={selectedVenueId} />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <SupportTab selectedVenueId={selectedVenueId} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab selectedVenueId={selectedVenueId} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
