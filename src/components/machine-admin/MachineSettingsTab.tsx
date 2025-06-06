import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Zap
} from "lucide-react";
import { useKioskOwner } from "@/hooks/useKioskOwner";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useLaunchOptions } from "@/hooks/useLaunchOptions";

interface MachineSettingsTabProps {
  venueId: string;
}

const MachineSettingsTab = ({ venueId }: MachineSettingsTabProps) => {
  const { kioskOwner, isLoading: ownerLoading, updateKioskOwner, isUpdating: ownerUpdating } = useKioskOwner();
  const { paymentMethods, isLoading: paymentLoading, updatePaymentMethods, isUpdating: paymentUpdating } = usePaymentMethods();
  const { launchOptions, updateLaunchOptions, isUpdating: launchUpdating } = useLaunchOptions(venueId);

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

  const [machineSettings, setMachineSettings] = useState({
    display_brightness: 80,
    audio_volume: 75,
    idle_timeout: 300,
    auto_shutdown: true,
    maintenance_mode: false
  });

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (paymentMethods) {
      setPaymentForm({
        rfid_enabled: paymentMethods.rfid_enabled ?? true,
        upi_enabled: paymentMethods.upi_enabled ?? false,
        upi_merchant_id: paymentMethods.upi_merchant_id || ""
      });
    }
  }, [paymentMethods]);

  React.useEffect(() => {
    if (launchOptions) {
      setLaunchForm({
        tap_to_start_enabled: launchOptions.tap_to_start_enabled,
        rfid_enabled: launchOptions.rfid_enabled,
        qr_payment_enabled: launchOptions.qr_payment_enabled,
        default_duration_minutes: launchOptions.default_duration_minutes,
        price_per_minute: launchOptions.price_per_minute
      });
    }
  }, [launchOptions]);

  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKioskOwner(ownerForm);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentMethods(paymentForm);
  };

  const handleLaunchOptionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLaunchOptions(launchForm);
  };

  if (ownerLoading || paymentLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Launch Options */}
      <Card className="border-vr-secondary/30 bg-gradient-to-r from-vr-secondary/5 to-vr-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-vr-secondary" />
            Customer Launch Options
          </CardTitle>
          <CardDescription>
            Configure how customers can start games on this machine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLaunchOptionsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Available Launch Methods</h3>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-vr-primary" />
                    <div>
                      <p className="font-medium">Tap to Start</p>
                      <p className="text-sm text-muted-foreground">
                        Allow instant free demo launches
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={launchForm.tap_to_start_enabled}
                    onCheckedChange={(checked) => 
                      setLaunchForm(prev => ({ ...prev, tap_to_start_enabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-vr-secondary" />
                    <div>
                      <p className="font-medium">RFID Card Launch</p>
                      <p className="text-sm text-muted-foreground">
                        Launch with RFID card payment
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={launchForm.rfid_enabled}
                    onCheckedChange={(checked) => 
                      setLaunchForm(prev => ({ ...prev, rfid_enabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">QR Code Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Launch with UPI QR payment
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={launchForm.qr_payment_enabled}
                    onCheckedChange={(checked) => 
                      setLaunchForm(prev => ({ ...prev, qr_payment_enabled: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Pricing & Duration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="default_duration">Default Duration (minutes)</Label>
                  <Input
                    id="default_duration"
                    type="number"
                    min="1"
                    max="60"
                    value={launchForm.default_duration_minutes}
                    onChange={(e) => setLaunchForm(prev => ({ 
                      ...prev, 
                      default_duration_minutes: parseInt(e.target.value) || 10 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_minute">Price per Minute (₹)</Label>
                  <Input
                    id="price_per_minute"
                    type="number"
                    min="0"
                    step="0.5"
                    value={launchForm.price_per_minute}
                    onChange={(e) => setLaunchForm(prev => ({ 
                      ...prev, 
                      price_per_minute: parseFloat(e.target.value) || 15.0 
                    }))}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Game Price:</strong> ₹{(launchForm.default_duration_minutes * launchForm.price_per_minute).toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {launchForm.default_duration_minutes} minutes × ₹{launchForm.price_per_minute}/min
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={launchUpdating}
              className="w-full"
            >
              {launchUpdating ? "Updating..." : "Save Launch Options"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Machine Information
            </CardTitle>
            <CardDescription>
              Basic information about this VR machine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kiosk_name">Machine Name</Label>
                <Input
                  id="kiosk_name"
                  value={ownerForm.kiosk_name}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, kiosk_name: e.target.value }))}
                  placeholder="VR Gaming Hub"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_name">Manager Name</Label>
                <Input
                  id="owner_name"
                  value={ownerForm.owner_name}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, owner_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={ownerForm.contact_email}
                    onChange={(e) => setOwnerForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="manager@venue.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={ownerForm.contact_phone}
                    onChange={(e) => setOwnerForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+91-9876543210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={ownerForm.address}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Shop 101, Tech Mall, Bangalore"
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                disabled={ownerUpdating}
                className="w-full"
              >
                {ownerUpdating ? "Updating..." : "Update Machine Info"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Configure payment options for this machine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-vr-primary" />
                    <div>
                      <p className="font-medium">RFID Card Payments</p>
                      <p className="text-sm text-muted-foreground">
                        Enable contactless RFID card payments
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentForm.rfid_enabled}
                    onCheckedChange={(checked) => 
                      setPaymentForm(prev => ({ ...prev, rfid_enabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-vr-secondary" />
                    <div>
                      <p className="font-medium">UPI QR Code Payments</p>
                      <p className="text-sm text-muted-foreground">
                        Enable UPI QR code payments
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentForm.upi_enabled}
                    onCheckedChange={(checked) => 
                      setPaymentForm(prev => ({ ...prev, upi_enabled: checked }))
                    }
                  />
                </div>

                {paymentForm.upi_enabled && (
                  <div className="space-y-2 ml-8">
                    <Label htmlFor="upi_merchant_id">UPI Merchant ID</Label>
                    <Input
                      id="upi_merchant_id"
                      value={paymentForm.upi_merchant_id}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, upi_merchant_id: e.target.value }))}
                      placeholder="merchant@paytm"
                    />
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={paymentUpdating}
                className="w-full"
              >
                {paymentUpdating ? "Updating..." : "Update Payment Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Machine Hardware Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Hardware Settings
          </CardTitle>
          <CardDescription>
            Configure display, audio, and system settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_brightness">Display Brightness: {machineSettings.display_brightness}%</Label>
                <Input
                  id="display_brightness"
                  type="range"
                  min="10"
                  max="100"
                  value={machineSettings.display_brightness}
                  onChange={(e) => setMachineSettings(prev => ({ 
                    ...prev, 
                    display_brightness: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio_volume">Audio Volume: {machineSettings.audio_volume}%</Label>
                <Input
                  id="audio_volume"
                  type="range"
                  min="0"
                  max="100"
                  value={machineSettings.audio_volume}
                  onChange={(e) => setMachineSettings(prev => ({ 
                    ...prev, 
                    audio_volume: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idle_timeout">Idle Timeout (seconds)</Label>
                <Input
                  id="idle_timeout"
                  type="number"
                  value={machineSettings.idle_timeout}
                  onChange={(e) => setMachineSettings(prev => ({ 
                    ...prev, 
                    idle_timeout: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Auto Shutdown</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically shutdown during off hours
                  </p>
                </div>
                <Switch
                  checked={machineSettings.auto_shutdown}
                  onCheckedChange={(checked) => 
                    setMachineSettings(prev => ({ ...prev, auto_shutdown: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Disable customer access for maintenance
                  </p>
                </div>
                <Switch
                  checked={machineSettings.maintenance_mode}
                  onCheckedChange={(checked) => 
                    setMachineSettings(prev => ({ ...prev, maintenance_mode: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <Button className="w-full">
            Save Hardware Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineSettingsTab;
