import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Save,
  Building2,
  CreditCard,
  Smartphone,
  Shield,
  Volume2,
  Sun,
  Lock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAdminPassword } from "@/hooks/useAdminPassword";

interface SettingsTabProps {
  selectedVenueId?: string | null;
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

const SettingsTab = ({ selectedVenueId }: SettingsTabProps) => {
  const queryClient = useQueryClient();
  const { setAdminPassword } = useAdminPassword();
  const [localSettings, setLocalSettings] = useState<Partial<VenueSettings>>({});
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Fetch venue settings
  const { data: venueSettings, isLoading, error } = useQuery({
    queryKey: ['venue-settings', selectedVenueId],
    queryFn: async (): Promise<VenueSettings | null> => {
      if (!selectedVenueId) return null;

      const { data, error } = await supabase
        .from('venue_settings')
        .select('*')
        .eq('venue_id', selectedVenueId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedVenueId
  });

  // Update local settings when venue settings change
  useEffect(() => {
    if (venueSettings) {
      setLocalSettings(venueSettings);
    }
  }, [venueSettings]);

  // Update venue settings
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<VenueSettings>) => {
      if (!selectedVenueId) throw new Error('No venue selected');

      const { data, error } = await supabase
        .from('venue_settings')
        .upsert({
          venue_id: selectedVenueId,
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

  const handleSaveSettings = () => {
    updateSettings.mutate(localSettings);
  };

  const handlePasswordUpdate = () => {
    if (!selectedVenueId) return;

    if (passwordInput !== confirmPasswordInput) {
      toast({
        title: "Password Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (localSettings.password_protection_enabled && passwordInput.length < 4) {
      toast({
        title: "Password Error",
        description: "Password must be at least 4 characters long",
        variant: "destructive"
      });
      return;
    }

    setAdminPassword.mutate({
      venueId: selectedVenueId,
      password: passwordInput,
      enabled: localSettings.password_protection_enabled || false
    });

    // Clear password inputs after update
    setPasswordInput('');
    setConfirmPasswordInput('');
  };

  const updateLocalSetting = (key: keyof VenueSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!selectedVenueId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Select a Venue</h3>
            <p className="text-muted-foreground">
              Choose a venue from the filter above to manage its settings
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load venue settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Venue Selection Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Venue Settings Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-blue-700">
            Configure settings specific to the selected venue
          </p>
        </CardContent>
      </Card>

      {/* Settings Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Venue Settings
          </h2>
          <p className="text-muted-foreground">
            Configure display, payment, and operational settings for this venue
          </p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={updateSettings.isPending}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Payment Settings */}
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
              checked={localSettings.rfid_enabled || false}
              onCheckedChange={(checked) => updateLocalSetting('rfid_enabled', checked)}
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
                checked={localSettings.upi_enabled || false}
                onCheckedChange={(checked) => updateLocalSetting('upi_enabled', checked)}
              />
            </div>
            
            {localSettings.upi_enabled && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  UPI Merchant ID
                </label>
                <Input
                  value={localSettings.upi_merchant_id || ''}
                  onChange={(e) => updateLocalSetting('upi_merchant_id', e.target.value)}
                  placeholder="Enter UPI merchant ID"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Display & Audio
          </CardTitle>
          <CardDescription>
            Configure display brightness and audio settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium">Theme</label>
            <select 
              value={localSettings.theme || 'light'}
              onChange={(e) => updateLocalSetting('theme', e.target.value)}
              className="w-full p-2 border rounded-md mt-1"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Brightness</label>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="range"
                min="10"
                max="100"
                value={localSettings.brightness || 100}
                onChange={(e) => updateLocalSetting('brightness', parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline">{localSettings.brightness || 100}%</Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Volume
            </label>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="range"
                min="0"
                max="100"
                value={localSettings.volume || 50}
                onChange={(e) => updateLocalSetting('volume', parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline">{localSettings.volume || 50}%</Badge>
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
              checked={localSettings.sound_effects_enabled !== false}
              onCheckedChange={(checked) => updateLocalSetting('sound_effects_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>
            Configure access control and security features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Admin Password Protection</h3>
              <p className="text-sm text-muted-foreground">
                Require password to access admin features on the machine
              </p>
            </div>
            <Switch
              checked={localSettings.password_protection_enabled || false}
              onCheckedChange={(checked) => updateLocalSetting('password_protection_enabled', checked)}
            />
          </div>

          {localSettings.password_protection_enabled && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Admin Password
                </label>
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter new admin password"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Confirm admin password"
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handlePasswordUpdate}
                disabled={setAdminPassword.isPending || !passwordInput || passwordInput !== confirmPasswordInput}
                className="w-full"
              >
                {setAdminPassword.isPending ? 'Updating...' : 'Update Admin Password'}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                This password will be required to access admin features on the machine
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Summary</CardTitle>
          <CardDescription>
            Current configuration for this venue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>RFID Payments:</span>
                <Badge variant={localSettings.rfid_enabled ? "default" : "secondary"}>
                  {localSettings.rfid_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>UPI Payments:</span>
                <Badge variant={localSettings.upi_enabled ? "default" : "secondary"}>
                  {localSettings.upi_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Theme:</span>
                <Badge variant="outline">{localSettings.theme || 'Light'}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Brightness:</span>
                <Badge variant="outline">{localSettings.brightness || 100}%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Volume:</span>
                <Badge variant="outline">{localSettings.volume || 50}%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Password Protection:</span>
                <Badge variant={localSettings.password_protection_enabled ? "default" : "secondary"}>
                  {localSettings.password_protection_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
