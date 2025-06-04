import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CreditCard, 
  Smartphone,
  Crown,
  Calendar
} from "lucide-react";
import { useKioskOwner } from "@/hooks/useKioskOwner";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useSubscription } from "@/hooks/useSubscription";
import { useWebSocketSettings, useKioskSettings } from "@/hooks/useSettings";

const SettingsTab = () => {
  const { kioskOwner, isLoading: ownerLoading, updateKioskOwner, isUpdating: ownerUpdating } = useKioskOwner();
  const { paymentMethods, isLoading: paymentLoading, updatePaymentMethods, isUpdating: paymentUpdating } = usePaymentMethods();
  const { subscription } = useSubscription();
  const { settings: wsSettings, updateSettings: updateWsSettings, isUpdating: wsUpdating } = useWebSocketSettings();
  const { settings: kioskSettings, updateSettings: updateKioskSettings, isUpdating: kioskUpdating } = useKioskSettings();

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

  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKioskOwner(ownerForm);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentMethods(paymentForm);
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
      {/* Subscription Status */}
      {subscription && (
        <Card className="border-vr-primary/30 bg-gradient-to-r from-vr-primary/5 to-vr-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-vr-primary" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {subscription.plan_tier.toUpperCase()}
                </Badge>
                <p className="text-lg font-semibold">{subscription.plan_name}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{subscription.monthly_cost}/month
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valid until</p>
                <p className="font-semibold">
                  {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'Ongoing'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kiosk & Ownership Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Kiosk & Ownership Details
            </CardTitle>
            <CardDescription>
              Manage your kiosk information and business details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kiosk_name">Kiosk Name</Label>
                <Input
                  id="kiosk_name"
                  value={ownerForm.kiosk_name}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, kiosk_name: e.target.value }))}
                  placeholder="VR Gaming Hub"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  value={ownerForm.owner_name}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, owner_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_license">Business License</Label>
                <Input
                  id="business_license"
                  value={ownerForm.business_license}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, business_license: e.target.value }))}
                  placeholder="BL2024001"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={ownerForm.contact_email}
                    onChange={(e) => setOwnerForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="owner@vrgaming.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
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
                {ownerUpdating ? "Updating..." : "Update Kiosk Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Methods Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Configure payment options for your kiosk
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

      <Separator />

      {/* System Settings - Keep existing WebSocket and Kiosk settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>WebSocket Connection</CardTitle>
            <CardDescription>
              Configure the connection to the VR system backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wsSettings && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ws-url">WebSocket URL</Label>
                  <Input
                    id="ws-url"
                    value={wsSettings.url}
                    onChange={(e) => updateWsSettings({ ...wsSettings, url: e.target.value })}
                    placeholder="ws://localhost:8081"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reconnect-attempts">Reconnect Attempts</Label>
                    <Input
                      id="reconnect-attempts"
                      type="number"
                      value={wsSettings.reconnectAttempts}
                      onChange={(e) => updateWsSettings({ 
                        ...wsSettings, 
                        reconnectAttempts: parseInt(e.target.value) 
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reconnect-delay">Reconnect Delay (ms)</Label>
                    <Input
                      id="reconnect-delay"
                      type="number"
                      value={wsSettings.reconnectDelay}
                      onChange={(e) => updateWsSettings({ 
                        ...wsSettings, 
                        reconnectDelay: parseInt(e.target.value) 
                      })}
                    />
                  </div>
                </div>
                <Button 
                  disabled={wsUpdating}
                  className="w-full"
                >
                  {wsUpdating ? "Saving..." : "Save WebSocket Settings"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kiosk Configuration</CardTitle>
            <CardDescription>
              System behavior and display settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kioskSettings && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="kiosk-name">Display Name</Label>
                  <Input
                    id="kiosk-name"
                    value={kioskSettings.name}
                    onChange={(e) => updateKioskSettings({ 
                      ...kioskSettings, 
                      name: e.target.value 
                    })}
                    placeholder="VR Kiosk"
                  />
                </div>
                <div>
                  <Label htmlFor="kiosk-location">Location</Label>
                  <Input
                    id="kiosk-location"
                    value={kioskSettings.location}
                    onChange={(e) => updateKioskSettings({ 
                      ...kioskSettings, 
                      location: e.target.value 
                    })}
                    placeholder="Main Hall"
                  />
                </div>
                <div>
                  <Label htmlFor="idle-timeout">Idle Timeout (seconds)</Label>
                  <Input
                    id="idle-timeout"
                    type="number"
                    value={kioskSettings.idleTimeout}
                    onChange={(e) => updateKioskSettings({ 
                      ...kioskSettings, 
                      idleTimeout: parseInt(e.target.value) 
                    })}
                  />
                </div>
                <Button 
                  disabled={kioskUpdating}
                  className="w-full"
                >
                  {kioskUpdating ? "Saving..." : "Save Kiosk Settings"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsTab;
