
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Database, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  Package, 
  HeadphonesIcon,
  UserPlus 
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
import { assignSuperAdminRole, assignMachineAdminRole, createPendingRoleAssignment } from "@/utils/roleAssignment";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVenues } from "@/hooks/useVenues";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { userVenues, userRoles, isSuperAdmin, isLoading: rolesLoading, error } = useUserRoles();
  const { venues } = useVenues();
  const [activeTab, setActiveTab] = useState("games");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  
  // Role assignment form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"super_admin" | "machine_admin">("machine_admin");
  const [newUserVenueId, setNewUserVenueId] = useState<string>("");

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Handle role assignment for users with no roles
  const handleAssignSuperAdmin = async () => {
    if (!user?.email) return;
    
    setIsAssigningRole(true);
    try {
      const result = await assignSuperAdminRole(user.email);
      if (result.success) {
        toast({
          title: "Role Assigned",
          description: result.message,
        });
        // Refresh the page to update the roles
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setIsAssigningRole(false);
    }
  };

  // Handle assigning roles to new users
  const handleAssignRoleToUser = async () => {
    if (!newUserEmail || !newUserRole) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newUserRole === "machine_admin" && !newUserVenueId) {
      toast({
        title: "Missing Venue",
        description: "Please select a venue for machine admin role",
        variant: "destructive",
      });
      return;
    }

    setIsAssigningRole(true);
    try {
      let result;
      
      if (newUserRole === "super_admin") {
        result = await assignSuperAdminRole(newUserEmail);
      } else {
        result = await assignMachineAdminRole(newUserEmail, newUserVenueId);
      }

      // If user doesn't exist yet, create pending assignment
      if (!result.success && result.error?.includes("not found")) {
        result = await createPendingRoleAssignment(newUserEmail, newUserRole, newUserVenueId);
      }

      if (result.success) {
        toast({
          title: "Role Assignment",
          description: result.message,
        });
        setNewUserEmail("");
        setNewUserRole("machine_admin");
        setNewUserVenueId("");
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setIsAssigningRole(false);
    }
  };

  // Show loading while checking authentication or roles
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

  // Handle error state
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading user data: {error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle users with no roles
  if (userRoles && userRoles.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">No Access Permissions</h2>
            <p className="text-vr-muted mb-6">
              Your account doesn't have any assigned roles yet. You need admin permissions to access this dashboard.
            </p>
            <Button 
              onClick={handleAssignSuperAdmin}
              disabled={isAssigningRole}
              className="mb-4"
            >
              {isAssigningRole ? 'Assigning...' : 'Assign Super Admin Role'}
            </Button>
            <p className="text-sm text-vr-muted">
              Contact your system administrator if you believe you should have access.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-vr-muted">
          Welcome back, {user.email} | {isSuperAdmin ? 'Super Admin' : 'Admin'} Access
        </p>
      </div>

      {/* Super Admin Role Management Section */}
      {isSuperAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign User Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="User email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
              <Select value={newUserRole} onValueChange={(value: "super_admin" | "machine_admin") => setNewUserRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="machine_admin">Machine Admin</SelectItem>
                </SelectContent>
              </Select>
              {newUserRole === "machine_admin" && (
                <Select value={newUserVenueId} onValueChange={setNewUserVenueId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues?.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button 
                onClick={handleAssignRoleToUser}
                disabled={isAssigningRole}
              >
                {isAssigningRole ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
