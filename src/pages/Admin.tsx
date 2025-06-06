import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Settings, 
  Users, 
  Gamepad2, 
  CreditCard, 
  HeadphonesIcon,
  Store,
  LogOut,
  Crown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Import existing admin components with correct default import syntax
import GamesManagementTab from "@/components/admin/GamesManagementTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import PaymentsEarningsTab from "@/components/admin/PaymentsEarningsTab";
import SettingsTab from "@/components/admin/SettingsTab";
import SupportTab from "@/components/admin/SupportTab";
import ProductCatalogTab from "@/components/admin/ProductCatalogTab";
import GamesShowcaseTab from "@/components/admin/GamesShowcaseTab";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("games");
  const { user, profile, signOut, isSuperAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Venue Admin Dashboard
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
              {isAdmin() && (
                <Badge variant="outline" className="border-green-500 text-green-400">
                  Venue Admin
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

        {/* Main Admin Interface */}
        <Card className="bg-black/60 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-vr-primary" />
              Admin Control Panel
            </CardTitle>
            <CardDescription className="text-gray-300">
              Manage your VR kiosk games, settings, and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 bg-gray-800">
                <TabsTrigger value="games" className="data-[state=active]:bg-vr-primary data-[state=active]:text-black">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Games
                </TabsTrigger>
                <TabsTrigger value="showcase" className="data-[state=active]:bg-vr-primary data-[state=active]:text-black">
                  <Store className="h-4 w-4 mr-2" />
                  Showcase
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-vr-primary data-[state=active]:text-black">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="payments" className="data-[state=active]:bg-vr-primary data-[state=active]:text-black">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="catalog" className="data-[state=active]:bg-vr-primary data-[state=active]:text-black">
                  <Store className="h-4 w-4 mr-2" />
                  Catalog
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-vr-primary data-[state=active]:text-black">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="support" className="data-[state=active]:bg-vr-primary data-[state=active]:text-black">
                  <HeadphonesIcon className="h-4 w-4 mr-2" />
                  Support
                </TabsTrigger>
              </TabsList>

              <TabsContent value="games">
                <GamesManagementTab />
              </TabsContent>
              
              <TabsContent value="showcase">
                <GamesShowcaseTab />
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsTab />
              </TabsContent>

              <TabsContent value="payments">
                <PaymentsEarningsTab />
              </TabsContent>

              <TabsContent value="catalog">
                <ProductCatalogTab />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsTab />
              </TabsContent>

              <TabsContent value="support">
                <SupportTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
