
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VenueManagement from "@/components/superadmin/VenueManagement";
import CustomerManagement from "@/components/superadmin/CustomerManagement";
import BusinessAnalytics from "@/components/superadmin/BusinessAnalytics";
import ProductCatalogManagement from "@/components/superadmin/ProductCatalogManagement";
import SupportTicketManagement from "@/components/superadmin/SupportTicketManagement";
import SubscriptionManagement from "@/components/superadmin/SubscriptionManagement";
import NotificationCenter from "@/components/superadmin/NotificationCenter";
import GamesManagementTab from "@/components/admin/GamesManagementTab";
import AutoSetupNotification from "@/components/admin/AutoSetupNotification";
import ExistingUsersSetup from "@/components/admin/ExistingUsersSetup";
import UserGameVenueSetup from "@/components/admin/UserGameVenueSetup";
import { Shield, Users, BarChart3, Package, Ticket, CreditCard, Bell, Gamepad2, Settings } from "lucide-react";
import { useEffect } from "react";
import { executeSetupForUser } from "@/utils/autoSetupTrigger";

const SuperAdmin = () => {
  // Auto-execute setup on page load
  useEffect(() => {
    console.log('SuperAdmin page loaded, executing auto setup...');
    executeSetupForUser();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage venues, users, games, and system-wide operations
        </p>
      </div>

      <AutoSetupNotification />
      
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="venues" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Venues
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            User Setup
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Support
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <BusinessAnalytics />
        </TabsContent>

        <TabsContent value="venues">
          <VenueManagement />
        </TabsContent>

        <TabsContent value="games">
          <GamesManagementTab />
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-6">
            <CustomerManagement />
            <ExistingUsersSetup />
          </div>
        </TabsContent>

        <TabsContent value="setup">
          <div className="flex justify-center">
            <UserGameVenueSetup />
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <SupportTicketManagement />
        </TabsContent>

        <TabsContent value="subscriptions">
          <div className="space-y-6">
            <SubscriptionManagement />
            <ProductCatalogManagement />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdmin;
