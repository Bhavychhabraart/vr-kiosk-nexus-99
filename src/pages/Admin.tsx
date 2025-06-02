
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Database, Settings, Shield } from "lucide-react";
import GamesManagementTab from "@/components/admin/GamesManagementTab";
import SettingsTab from "@/components/admin/SettingsTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// Correct PIN code
const ADMIN_PIN = "123321";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("games");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [showPinDialog, setShowPinDialog] = useState(true);
  const [pinError, setPinError] = useState(false);

  const handlePinComplete = (value: string) => {
    if (value === ADMIN_PIN) {
      setIsAuthenticated(true);
      setShowPinDialog(false);
      toast({
        title: "Access Granted",
        description: "Welcome to the Admin Dashboard",
      });
    } else {
      setPinError(true);
      toast({
        title: "Access Denied",
        description: "Incorrect PIN code",
        variant: "destructive",
      });
      setTimeout(() => {
        setPinError(false);
        setPinValue("");
      }, 1000);
    }
  };

  const renderNumpad = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    
    return (
      <div className="grid grid-cols-3 gap-2 mt-6 w-full max-w-xs mx-auto">
        {numbers.map((num) => (
          <Button 
            key={num} 
            variant="outline"
            className={`aspect-square text-xl font-bold ${num === 0 ? 'col-start-2' : ''}`}
            onClick={() => {
              if (pinValue.length < 6) {
                const newPin = pinValue + num;
                setPinValue(newPin);
                if (newPin.length === 6) {
                  handlePinComplete(newPin);
                }
              }
            }}
          >
            {num}
          </Button>
        ))}
        <Button 
          variant="ghost" 
          className="aspect-square col-start-3 text-xl font-bold"
          onClick={() => setPinValue(prev => prev.slice(0, -1))}
        >
          ⌫
        </Button>
      </div>
    );
  };

  // Render PIN entry dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
            <DialogContent className="sm:max-w-md">
              <div className="flex flex-col items-center space-y-6 py-4">
                <Shield className="h-12 w-12 text-vr-primary" />
                <h2 className="text-2xl font-bold">Admin Authentication</h2>
                <p className="text-vr-muted text-center">
                  Enter the 6-digit PIN code to access the admin dashboard
                </p>
                
                <div className={`transition-all duration-200 ${pinError ? 'animate-shake' : ''}`}>
                  <InputOTP
                    value={pinValue}
                    onChange={setPinValue}
                    maxLength={6}
                    render={({ slots }) => (
                      <InputOTPGroup className="gap-2">
                        {Array(6).fill(0).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={`w-10 h-14 text-2xl ${
                              pinError ? 'border-red-500 bg-red-50/10' : ''
                            }`}
                          />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>
                
                {renderNumpad()}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    );
  }

  // Render admin dashboard if authenticated
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
        <TabsList className="w-full grid grid-cols-3 mb-8">
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
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="games" className="mt-0">
          <GamesManagementTab />
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
