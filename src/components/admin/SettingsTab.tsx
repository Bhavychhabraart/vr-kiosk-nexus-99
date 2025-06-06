import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  CreditCard,
  Smartphone,
  Clock,
  DollarSign,
  Save,
  Monitor,
  Palette,
  Volume2,
  Shield
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "@/components/ui/use-toast";
import VenueSelector from "./VenueSelector";

interface SettingsTabProps {
  selectedVenueId?: string | null;
}

const SettingsTab = ({ selectedVenueId }: SettingsTabProps) => {
  const [selectedVenue, setSelectedVenue] = useState(selectedVenueId);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isSecuritySettingsOpen, setIsSecuritySettingsOpen] = useState(false);

  const { settings, isLoading, updateSettings } = useSettings(selectedVenue);

  const handleVenueSelect = (venueId: string) => {
    setSelectedVenue(venueId);
  };

  const handlePaymentMethodsSubmit = async (data: any) => {
    try {
      await updateSettings({
        venue_id: selectedVenue || '',
        rfid_enabled: data.rfid_enabled,
        upi_enabled: data.upi_enabled,
        upi_merchant_id: data.upi_merchant_id,
      });
      toast({
        title: "Payment methods updated",
        description: "Payment methods have been successfully updated.",
      });
      setIsPaymentMethodsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating payment methods",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDisplaySettingsSubmit = async (data: any) => {
    try {
      await updateSettings({
        venue_id: selectedVenue || '',
        theme: data.theme,
        brightness: data.brightness,
      });
      toast({
        title: "Display settings updated",
        description: "Display settings have been successfully updated.",
      });
      setIsDisplaySettingsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating display settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAudioSettingsSubmit = async (data: any) => {
    try {
      await updateSettings({
        venue_id: selectedVenue || '',
        volume: data.volume,
        sound_effects_enabled: data.sound_effects_enabled,
      });
      toast({
        title: "Audio settings updated",
        description: "Audio settings have been successfully updated.",
      });
      setIsAudioSettingsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating audio settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSecuritySettingsSubmit = async (data: any) => {
    try {
      await updateSettings({
        venue_id: selectedVenue || '',
        password_protection_enabled: data.password_protection_enabled,
        admin_password: data.admin_password,
      });
      toast({
        title: "Security settings updated",
        description: "Security settings have been successfully updated.",
      });
      setIsSecuritySettingsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating security settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {selectedVenueId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Venue Filter Active:</strong> Configuring settings for selected venue
          </p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure basic settings for your venue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <VenueSelector
            selectedVenueId={selectedVenue || ""}
            onVenueSelect={handleVenueSelect}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage payment methods available at your venue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rfid">RFID Card Payments</Label>
            <Switch id="rfid" defaultChecked={settings?.rfid_enabled} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upi">UPI QR Code Payments</Label>
            <Switch id="upi" defaultChecked={settings?.upi_enabled} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upi-merchant-id">UPI Merchant ID</Label>
            <Input id="upi-merchant-id" defaultValue={settings?.upi_merchant_id || ""} />
          </div>
        </CardContent>
        <CardContent>
          <Button onClick={() => handlePaymentMethodsSubmit({
            rfid_enabled: settings?.rfid_enabled,
            upi_enabled: settings?.upi_enabled,
            upi_merchant_id: settings?.upi_merchant_id || "",
          })}>
            Save Payment Methods
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Customize the display settings for your venue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select defaultValue={settings?.theme || "light"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="brightness">Brightness</Label>
            <Input id="brightness" type="number" defaultValue={settings?.brightness || 100} />
          </div>
        </CardContent>
        <CardContent>
          <Button onClick={() => handleDisplaySettingsSubmit({
            theme: settings?.theme || "light",
            brightness: settings?.brightness || 100,
          })}>
            Save Display Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Settings
          </CardTitle>
          <CardDescription>
            Configure audio settings for your venue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="volume">Volume</Label>
            <Input id="volume" type="number" defaultValue={settings?.volume || 50} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sound-effects">Sound Effects</Label>
            <Switch id="sound-effects" defaultChecked={settings?.sound_effects_enabled} />
          </div>
        </CardContent>
        <CardContent>
          <Button onClick={() => handleAudioSettingsSubmit({
            volume: settings?.volume || 50,
            sound_effects_enabled: settings?.sound_effects_enabled,
          })}>
            Save Audio Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage security settings for your venue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password-protection">Password Protection</Label>
            <Switch id="password-protection" defaultChecked={settings?.password_protection_enabled} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Admin Password</Label>
            <Input id="admin-password" type="password" defaultValue={settings?.admin_password || ""} />
          </div>
        </CardContent>
        <CardContent>
          <Button onClick={() => handleSecuritySettingsSubmit({
            password_protection_enabled: settings?.password_protection_enabled,
            admin_password: settings?.admin_password || "",
          })}>
            Save Security Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
