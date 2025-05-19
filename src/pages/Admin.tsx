
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, CreditCard, Database, Settings } from "lucide-react";
import GamesManagementTab from "@/components/admin/GamesManagementTab";
import SettingsTab from "@/components/admin/SettingsTab";
import RfidManagementTab from "@/components/admin/RfidManagementTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("games");

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-vr-muted">Manage the VR system settings and content</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-4 mb-8">
          <TabsTrigger value="games" className="py-3">
            <Database className="h-4 w-4 mr-2" />
            Games
          </TabsTrigger>
          <TabsTrigger value="rfid" className="py-3">
            <CreditCard className="h-4 w-4 mr-2" />
            RFID Cards
          </TabsTrigger>
          <TabsTrigger value="analytics" className="py-3">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="py-3">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="games" className="mt-0">
          <GamesManagementTab />
        </TabsContent>
        
        <TabsContent value="rfid" className="mt-0">
          <RfidManagementTab />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
          <AnalyticsTab />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Admin;
