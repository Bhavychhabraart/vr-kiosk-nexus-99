
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLaunchOptions } from "@/hooks/useLaunchOptions";
import { useState, useEffect } from "react";
import { Settings, Zap, CreditCard, Clock, DollarSign } from "lucide-react";

interface MachineLaunchOptionsTabProps {
  venueId: string;
}

const MachineLaunchOptionsTab = ({ venueId }: MachineLaunchOptionsTabProps) => {
  const { launchOptions, isLoading, updateLaunchOptions, isUpdating } = useLaunchOptions(venueId);
  
  const [formData, setFormData] = useState({
    tap_to_start_enabled: true,
    rfid_enabled: true,
    qr_payment_enabled: false,
    default_duration_minutes: 10,
    price_per_minute: 15.0
  });

  useEffect(() => {
    if (launchOptions) {
      setFormData({
        tap_to_start_enabled: launchOptions.tap_to_start_enabled,
        rfid_enabled: launchOptions.rfid_enabled,
        qr_payment_enabled: launchOptions.qr_payment_enabled,
        default_duration_minutes: launchOptions.default_duration_minutes,
        price_per_minute: Number(launchOptions.price_per_minute)
      });
    }
  }, [launchOptions]);

  const handleSave = () => {
    updateLaunchOptions(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Launch Options
          </h2>
          <p className="text-muted-foreground">
            Configure how customers can start VR sessions on this machine
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Launch Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Launch Methods
            </CardTitle>
            <CardDescription>
              Choose which methods customers can use to start sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="tap-to-start">Tap to Start</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to tap the screen to begin
                </p>
              </div>
              <Switch
                id="tap-to-start"
                checked={formData.tap_to_start_enabled}
                onCheckedChange={(checked) => handleInputChange('tap_to_start_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="rfid-enabled">RFID Cards</Label>
                <p className="text-sm text-muted-foreground">
                  Enable RFID card scanning for sessions
                </p>
              </div>
              <Switch
                id="rfid-enabled"
                checked={formData.rfid_enabled}
                onCheckedChange={(checked) => handleInputChange('rfid_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="qr-payment">QR Payment</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to pay via QR code scanning
                </p>
              </div>
              <Switch
                id="qr-payment"
                checked={formData.qr_payment_enabled}
                onCheckedChange={(checked) => handleInputChange('qr_payment_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Default Session Settings
            </CardTitle>
            <CardDescription>
              Set default duration and pricing for new sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-duration">Default Duration (minutes)</Label>
              <Input
                id="default-duration"
                type="number"
                min="1"
                max="60"
                value={formData.default_duration_minutes}
                onChange={(e) => handleInputChange('default_duration_minutes', parseInt(e.target.value) || 10)}
              />
              <p className="text-sm text-muted-foreground">
                Default session length when customers don't specify
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-per-minute" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price per Minute (₹)
              </Label>
              <Input
                id="price-per-minute"
                type="number"
                min="0"
                step="0.50"
                value={formData.price_per_minute}
                onChange={(e) => handleInputChange('price_per_minute', parseFloat(e.target.value) || 15.0)}
              />
              <p className="text-sm text-muted-foreground">
                Base pricing when game-specific pricing isn't set
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save Launch Options"}
        </Button>
      </div>
    </div>
  );
};

export default MachineLaunchOptionsTab;
