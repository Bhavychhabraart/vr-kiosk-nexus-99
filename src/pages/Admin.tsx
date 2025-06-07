
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
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
  Settings,
  CreditCard,
  Star,
  Package,
  Headphones,
  Shield
} from "lucide-react";

// Import admin components
import GamesManagementTab from "@/components/admin/GamesManagementTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import SettingsTab from "@/components/admin/SettingsTab";
import PaymentsEarningsTab from "@/components/admin/PaymentsEarningsTab";
import GamesShowcaseTab from "@/components/admin/GamesShowcaseTab";
import ProductCatalogTab from "@/components/admin/ProductCatalogTab";
import SupportTab from "@/components/admin/SupportTab";

const Admin = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { isSuperAdmin, isMachineAdmin, isLoading: rolesLoading } = useUserRoles();
  const [activeTab, setActiveTab] = useState("overview");

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
      } else if (isMachineAdmin) {
        navigate('/machine-admin');
      }
    }
  }, [isSuperAdmin, isMachineAdmin, rolesLoading, user, navigate]);

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
  if (isSuperAdmin || isMachineAdmin) {
    return <div>Redirecting...</div>;
  }

  return (
    <MainLayout backgroundVariant="grid" withPattern intensity="low">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent">
              System Admin Panel
            </h1>
            <p className="text-vr-muted mt-2">
              General system administration and local management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              System Admin
            </Badge>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
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
                <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Welcome to the system administration panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-lg text-gray-600 mb-4">
                    This is the general system administration interface for local management.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Manage local system settings and configurations</p>
                    <p>• Monitor basic system performance</p>
                    <p>• Handle local administrative tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <GamesManagementTab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <PaymentsEarningsTab />
          </TabsContent>

          <TabsContent value="showcase" className="space-y-6">
            <GamesShowcaseTab />
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <ProductCatalogTab />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <SupportTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
