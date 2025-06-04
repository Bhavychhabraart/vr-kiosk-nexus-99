
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  Building2, 
  TrendingUp, 
  Bell, 
  Settings,
  Plus,
  DollarSign,
  Activity
} from "lucide-react";
import IndiaMap from "@/components/superadmin/IndiaMap";
import VenueManagement from "@/components/superadmin/VenueManagement";
import BusinessAnalytics from "@/components/superadmin/BusinessAnalytics";
import CustomerManagement from "@/components/superadmin/CustomerManagement";
import SubscriptionManagement from "@/components/superadmin/SubscriptionManagement";
import ProductCatalogManagement from "@/components/superadmin/ProductCatalogManagement";
import NotificationCenter from "@/components/superadmin/NotificationCenter";
import { useBusinessAnalytics } from "@/hooks/useBusinessAnalytics";

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { businessMetrics, isLoading } = useBusinessAnalytics();

  return (
    <MainLayout backgroundVariant="grid" withPattern intensity="low">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent">
              Super Admin Panel
            </h1>
            <p className="text-vr-muted mt-2">
              Manage your entire VR business network across India
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-2 text-lg">
            <Activity className="w-4 h-4 mr-2" />
            System Online
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{businessMetrics?.totalRevenue?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessMetrics?.activeVenues || 0}/{businessMetrics?.totalVenues || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessMetrics?.totalCustomers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +8.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((businessMetrics?.averageSessionDuration || 0) / 60)}m
              </div>
              <p className="text-xs text-muted-foreground">
                +2 minutes from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="venues" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Venues
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Catalog
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notify
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  India Venue Map
                </CardTitle>
                <CardDescription>
                  Interactive map showing all active VR venues across India
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IndiaMap />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues" className="space-y-6">
            <VenueManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <BusinessAnalytics />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <ProductCatalogManagement />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SuperAdmin;
