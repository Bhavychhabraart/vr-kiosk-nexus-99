import { useState } from "react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Users, 
  BarChart3, 
  Package,
  Bell,
  CreditCard,
  Crown,
  LogOut,
  Settings,
  Headphones
} from "lucide-react";

// Import existing tab components
import BusinessAnalytics from "@/components/superadmin/BusinessAnalytics";
import VenueManagement from "@/components/superadmin/VenueManagement";
import CustomerManagement from "@/components/superadmin/CustomerManagement";
import ProductCatalogManagement from "@/components/superadmin/ProductCatalogManagement";
import SubscriptionManagement from "@/components/superadmin/SubscriptionManagement";
import NotificationCenter from "@/components/superadmin/NotificationCenter";
import ExistingUsersSetup from "@/components/admin/ExistingUsersSetup";
import VenueAnalyticsTab from "@/components/superadmin/VenueAnalyticsTab";
import UserSetupCheck from "@/components/admin/UserSetupCheck";
import PendingUsersMonitor from "@/components/admin/PendingUsersMonitor";
import ManualRoleAssignment from "@/components/admin/ManualRoleAssignment";
import QuickUserSetup from "@/components/admin/QuickUserSetup";
import SupportTicketManagement from "@/components/superadmin/SupportTicketManagement";
import QuickSetupUser from "@/components/admin/QuickSetupUser";

const SuperAdmin = () => {
  const { user, signOut } = useAuth();
  const { isSuperAdmin, isLoading, userVenues, userRoles, error } = useUserRoles();
  const [activeTab, setActiveTab] = useState("overview");

  // Debug logging
  console.log('SuperAdmin component loaded');
  console.log('Auth state:', { user: !!user, userId: user?.id, email: user?.email });
  console.log('useUserRoles state:', { 
    isSuperAdmin, 
    isLoading, 
    userVenues: userVenues?.length, 
    userRoles: userRoles?.length,
    error: error?.message 
  });

  if (isLoading) {
    console.log('SuperAdmin: Still loading user roles...');
    return (
      <MainLayout backgroundVariant="grid" withPattern intensity="low">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vr-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    console.log('SuperAdmin: No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!isSuperAdmin) {
    console.log('SuperAdmin: User is not super admin, redirecting to auth');
    console.log('User roles found:', userRoles);
    return <Navigate to="/auth" replace />;
  }

  console.log('SuperAdmin: Rendering super admin dashboard');

  return (
    <MainLayout backgroundVariant="grid" withPattern intensity="low">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent">
              Super Admin Dashboard
            </h1>
            <p className="text-xl text-vr-muted mt-2">
              Complete control over Next Gen Arcadia network
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500">
              <Crown className="w-4 h-4 mr-1" />
              Super Admin
            </Badge>
            <Button variant="outline" onClick={() => signOut()} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="venue-analytics" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Venue Analytics
            </TabsTrigger>
            <TabsTrigger value="venues" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Venues
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Setup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userVenues?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all locations
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network Status</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Level</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">Super</div>
                  <p className="text-xs text-muted-foreground">
                    Full network access
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome to Super Admin</CardTitle>
                <CardDescription>
                  You have complete control over the Next Gen Arcadia network. Use the tabs above to manage venues, customers, products, and more.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <BusinessAnalytics />
          </TabsContent>

          <TabsContent value="venue-analytics" className="space-y-6">
            <VenueAnalyticsTab />
          </TabsContent>

          <TabsContent value="venues" className="space-y-6">
            <VenueManagement />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductCatalogManagement />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <SupportTicketManagement />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickSetupUser />
              <PendingUsersMonitor />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ManualRoleAssignment />
              <Card>
                <CardHeader>
                  <CardTitle>Batch User Setup</CardTitle>
                  <CardDescription>
                    Setup multiple existing users at once
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExistingUsersSetup />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SuperAdmin;
