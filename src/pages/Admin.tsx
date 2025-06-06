
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Database, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  Package, 
  HeadphonesIcon 
} from "lucide-react";
import GamesManagementTab from "@/components/admin/GamesManagementTab";
import SettingsTab from "@/components/admin/SettingsTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import PaymentsEarningsTab from "@/components/admin/PaymentsEarningsTab";
import GamesShowcaseTab from "@/components/admin/GamesShowcaseTab";
import ProductCatalogTab from "@/components/admin/ProductCatalogTab";
import SupportTab from "@/components/admin/SupportTab";
import VenueFilter from "@/components/admin/VenueFilter";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { userVenues, isSuperAdmin, isLoading: rolesLoading } = useUserRoles();
  const [activeTab, setActiveTab] = useState("games");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading || rolesLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vr-primary mx-auto mb-4"></div>
            <p className="text-vr-muted">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-vr-muted">
          Welcome back, {user.email} | {isSuperAdmin ? 'Super Admin' : 'Admin'} Access
        </p>
      </div>

      <VenueFilter 
        selectedVenueId={selectedVenueId}
        onVenueChange={setSelectedVenueId}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-7 mb-8">
          <TabsTrigger value="games" className="py-3">
            <Database className="h-4 w-4 mr-2" />
            Games
          </TabsTrigger>
          <TabsTrigger value="analytics" className="py-3">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="py-3">
            <Settings className="h-4 w-4 mr-2" />
            Kiosk Settings
          </TabsTrigger>
          <TabsTrigger value="payments" className="py-3">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="showcase" className="py-3">
            <TrendingUp className="h-4 w-4 mr-2" />
            Showcase
          </TabsTrigger>
          <TabsTrigger value="catalog" className="py-3">
            <Package className="h-4 w-4 mr-2" />
            Catalog
          </TabsTrigger>
          <TabsTrigger value="support" className="py-3">
            <HeadphonesIcon className="h-4 w-4 mr-2" />
            Support
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="games" className="mt-0">
          <GamesManagementTab selectedVenueId={selectedVenueId} />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
          <AnalyticsTab selectedVenueId={selectedVenueId} />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <SettingsTab selectedVenueId={selectedVenueId} />
        </TabsContent>
        
        <TabsContent value="payments" className="mt-0">
          <PaymentsEarningsTab selectedVenueId={selectedVenueId} />
        </TabsContent>
        
        <TabsContent value="showcase" className="mt-0">
          <GamesShowcaseTab selectedVenueId={selectedVenueId} />
        </TabsContent>
        
        <TabsContent value="catalog" className="mt-0">
          <ProductCatalogTab selectedVenueId={selectedVenueId} />
        </TabsContent>
        
        <TabsContent value="support" className="mt-0">
          <SupportTab selectedVenueId={selectedVenueId} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Admin;
