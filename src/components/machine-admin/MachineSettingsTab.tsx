
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Smartphone,
  Wifi,
  Monitor,
  Volume2,
  Zap,
  Save,
  Settings,
  Clock,
  DollarSign
} from "lucide-react";
import { useKioskOwner } from "@/hooks/useKioskOwner";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useLaunchOptions } from "@/hooks/useLaunchOptions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface MachineSettingsTabProps {
  venueId: string;
}

interface VenueSettings {
  id: string;
  venue_id: string;
  theme: string;
  rfid_enabled: boolean;
  upi_enabled: boolean;
  upi_merchant_id?: string;
  brightness: number;
  volume: number;
  sound_effects_enabled: boolean;
  password_protection_enabled: boolean;
  admin_password?: string;
}

const MachineSettingsTab = ({ venueId }: MachineSettingsTabProps) => {
  const queryClient = useQueryClient();
  const { kioskOwner, isLoading: ownerLoading, updateKioskOwner, isUpdating: ownerUpdating } = useKioskOwner();
  const { paymentMethods, isLoading: paymentLoading, updatePaymentMethods, isUpdating: paymentUpdating } = usePaymentMethods();
  const { launchOptions, updateLaunchOptions, isUpdating: launchUpdating } = useLaunchOptions(venueId);

  // Fetch venue settings
  const { data: venueSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['venue-settings', venueId],
    queryFn: async (): Promise<VenueSettings | null> => {
      const { data, error } = await supabase
        .from('venue_settings')
        .select('*')
        .eq('venue_id', venueId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!venueId
  });

  // Update venue settings
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<VenueSettings>) => {
      const { data, error } = await supabase
        .from('venue_settings')
        .upsert({
          venue_id: venueId,
          ...updates
        }, {
          onConflict: 'venue_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-settings'] });
      toast({
        title: "Settings Updated",
        description: "Venue settings have been saved successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const [ownerForm, setOwnerForm] = useState({
    kiosk_name: kioskOwner?.kiosk_name || "",
    owner_name: kioskOwner?.owner_name || "",
    business_license: kioskOwner?.business_license || "",
    contact_email: kioskOwner?.contact_email || "",
    contact_phone: kioskOwner?.contact_phone || "",
    address: kioskOwner?.address || ""
  });

  const [paymentForm, setPaymentForm] = useState({
    rfid_enabled: paymentMethods?.rfid_enabled ?? true,
    upi_enabled: paymentMethods?.upi_enabled ?? false,
    upi_merchant_id: paymentMethods?.upi_merchant_id || ""
  });

  const [launchForm, setLaunchForm] = useState({
    tap_to_start_enabled: launchOptions?.tap_to_start_enabled ?? true,
    rfid_enabled: launchOptions?.rfid_enabled ?? true,
    qr_payment_enabled: launchOptions?.qr_payment_enabled ?? false,
    default_duration_minutes: launchOptions?.default_duration_minutes ?? 10,
    price_per_minute: launchOptions?.price_per_minute ?? 15.0
  });

  const [settingsForm, setSettingsForm] = useState({
    theme: venueSettings?.theme || 'light',
    brightness: venueSettings?.brightness || 100,
    volume: venueSettings?.volume || 50,
    sound_effects_enabled: venueSettings?.sound_effects_enabled ?? true,
    password_protection_enabled: venueSettings?.password_protection_enabled ?? false,
    admin_password: venueSettings?.admin_password || ''
  });

  // Update forms when data loads
  useEffect(() => {
    if (kioskOwner) {
      setOwnerForm({
        kiosk_name: kioskOwner.kiosk_name || "",
        owner_name: kioskOwner.owner_name || "",
        business_license: kioskOwner.business_license || "",
        contact_email: kioskOwner.contact_email || "",
        contact_phone: kioskOwner.contact_phone || "",
        address: kioskOwner.address || ""
      });
    }
  }, [kioskOwner]);

  useEffect(() => {
    if (paymentMethods) {
      setPaymentForm({
        rfid_enabled: paymentMethods.rfid_enabled ?? true,
        upi_enabled: paymentMethods.upi_enabled ?? false,
        upi_merchant_id: paymentMethods.upi_merchant_id || ""
      });
    }
  }, [paymentMethods]);

  useEffect(() => {
    if (launchOptions) {
      setLaunchForm({
        tap_to_start_enabled: launchOptions.tap_to_start_enabled ?? true,
        rfid_enabled: launchOptions.rfid_enabled ?? true,
        qr_payment_enabled: launchOptions.qr_payment_enabled ?? false,
        default_duration_minutes: launchOptions.default_duration_minutes ?? 10,
        price_per_minute: launchOptions.price_per_minute ?? 15.0
      });
    }
  }, [launchOptions]);

  useEffect(() => {
    if (venueSettings) {
      setSettingsForm({
        theme: venueSettings.theme || 'light',
        brightness: venueSettings.brightness || 100,
        volume: venueSettings.volume || 50,
        sound_effects_enabled: venueSettings.sound_effects_enabled ?? true,
        password_protection_enabled: venueSettings.password_protection_enabled ?? false,
        admin_password: venueSettings.admin_password || ''
      });
    }
  }, [venueSettings]);

  const handleSaveOwner = () => {
    updateKioskOwner(ownerForm);
  };

  const handleSavePayment = () => {
    updatePaymentMethods(paymentForm);
  };

  const handleSaveLaunch = () => {
    updateLaunchOptions(launchForm);
  };

  const handleSaveSettings = () => {
    updateSettings.mutate(settingsForm);
  };

  if (ownerLoading || paymentLoading || settingsLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kiosk Owner Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Venue Owner Information
          </CardTitle>
          <CardDescription>
            Update business and contact information for this venue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kiosk_name">Venue Name</Label>
              <Input
                id="kiosk_name"
                value={ownerForm.kiosk_name}
                onChange={(e) => setOwnerForm(prev => ({ ...prev, kiosk_name: e.target.value }))}
                placeholder="Enter venue name"
              />
            </div>
            <div>
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                value={ownerForm.owner_name}
                onChange={(e) => setOwnerForm(prev => ({ ...prev, owner_name: e.target.value }))}
                placeholder="Enter owner name"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={ownerForm.contact_email}
                onChange={(e) => setOwnerForm(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="Enter contact email"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={ownerForm.contact_phone}
                onChange={(e) => setOwnerForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="Enter contact phone"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={ownerForm.address}
              onChange={(e) => setOwnerForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter venue address"
            />
          </div>

          <Button onClick={handleSaveOwner} disabled={ownerUpdating} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {ownerUpdating ? 'Saving...' : 'Save Owner Info'}
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Configure payment options for customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">RFID Card Payments</h3>
              <p className="text-sm text-muted-foreground">
                Enable contactless card payments
              </p>
            </div>
            <Switch
              checked={paymentForm.rfid_enabled}
              onCheckedChange={(checked) => setPaymentForm(prev => ({ ...prev, rfid_enabled: checked }))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">UPI QR Code Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Enable UPI payments via QR code
                </p>
              </div>
              <Switch
                checked={paymentForm.upi_enabled}
                onCheckedChange={(checked) => setPaymentForm(prev => ({ ...prev, upi_enabled: checked }))}
              />
            </div>
            
            {paymentForm.upi_enabled && (
              <div>
                <Label htmlFor="upi_merchant_id">UPI Merchant ID</Label>
                <Input
                  id="upi_merchant_id"
                  value={paymentForm.upi_merchant_id}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, upi_merchant_id: e.target.value }))}
                  placeholder="Enter UPI merchant ID"
                />
              </div>
            )}
          </div>

          <Button onClick={handleSavePayment} disabled={paymentUpdating} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {paymentUpdating ? 'Saving...' : 'Save Payment Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Launch Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Launch Options
          </CardTitle>
          <CardDescription>
            Configure how customers start VR sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="default_duration">Default Duration (minutes)</Label>
              <Input
                id="default_duration"
                type="number"
                value={launchForm.default_duration_minutes}
                onChange={(e) => setLaunchForm(prev => ({ ...prev, default_duration_minutes: parseInt(e.target.value) }))}
                min="1"
                max="60"
              />
            </div>
            <div>
              <Label htmlFor="price_per_minute">Price per Minute (₹)</Label>
              <Input
                id="price_per_minute"
                type="number"
                step="0.01"
                value={launchForm.price_per_minute}
                onChange={(e) => setLaunchForm(prev => ({ ...prev, price_per_minute: parseFloat(e.target.value) }))}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Tap to Start</h3>
                <p className="text-sm text-muted-foreground">
                  Allow customers to start sessions by tapping the screen
                </p>
              </div>
              <Switch
                checked={launchForm.tap_to_start_enabled}
                onCheckedChange={(checked) => setLaunchForm(prev => ({ ...prev, tap_to_start_enabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">RFID Launch</h3>
                <p className="text-sm text-muted-foreground">
                  Allow sessions to start with RFID card tap
                </p>
              </div>
              <Switch
                checked={launchForm.rfid_enabled}
                onCheckedChange={(checked) => setLaunchForm(prev => ({ ...prev, rfid_enabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">QR Payment Launch</h3>
                <p className="text-sm text-muted-foreground">
                  Allow sessions to start after QR code payment
                </p>
              </div>
              <Switch
                checked={launchForm.qr_payment_enabled}
                onCheckedChange={(checked) => setLaunchForm(prev => ({ ...prev, qr_payment_enabled: checked }))}
              />
            </div>
          </div>

          <Button onClick={handleSaveLaunch} disabled={launchUpdating} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {launchUpdating ? 'Saving...' : 'Save Launch Options'}
          </Button>
        </CardContent>
      </Card>

      {/* Display & Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Display & Audio
          </CardTitle>
          <CardDescription>
            Configure display brightness and audio settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Theme</Label>
            <select 
              value={settingsForm.theme}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full p-2 border rounded-md mt-1"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <Label>Brightness</Label>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="range"
                min="10"
                max="100"
                value={settingsForm.brightness}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <Badge variant="outline">{settingsForm.brightness}%</Badge>
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Volume
            </Label>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="range"
                min="0"
                max="100"
                value={settingsForm.volume}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <Badge variant="outline">{settingsForm.volume}%</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sound Effects</h3>
              <p className="text-sm text-muted-foreground">
                Enable UI sound effects and notifications
              </p>
            </div>
            <Switch
              checked={settingsForm.sound_effects_enabled}
              onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, sound_effects_enabled: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Admin Password Protection</h3>
              <p className="text-sm text-muted-foreground">
                Require password to access admin features on the machine
              </p>
            </div>
            <Switch
              checked={settingsForm.password_protection_enabled}
              onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, password_protection_enabled: checked }))}
            />
          </div>

          {settingsForm.password_protection_enabled && (
            <div>
              <Label>Admin Password</Label>
              <Input
                type="password"
                value={settingsForm.admin_password}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, admin_password: e.target.value }))}
                placeholder="Enter admin password"
              />
            </div>
          )}

          <Button onClick={handleSaveSettings} disabled={updateSettings.isPending} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {updateSettings.isPending ? 'Saving...' : 'Save Display Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>
            Summary of current venue settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>RFID Payments:</span>
                <Badge variant={paymentForm.rfid_enabled ? "default" : "secondary"}>
                  {paymentForm.rfid_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>UPI Payments:</span>
                <Badge variant={paymentForm.upi_enabled ? "default" : "secondary"}>
                  {paymentForm.upi_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Default Duration:</span>
                <Badge variant="outline">{launchForm.default_duration_minutes} min</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Price per Minute:</span>
                <Badge variant="outline">₹{launchForm.price_per_minute}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Theme:</span>
                <Badge variant="outline">{settingsForm.theme}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Brightness:</span>
                <Badge variant="outline">{settingsForm.brightness}%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineSettingsTab;
