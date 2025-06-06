
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RefreshCw, CreditCard, Smartphone, Clock, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface MachineSettingsTabProps {
  venueId: string;
}

const MachineSettingsTab = ({ venueId }: MachineSettingsTabProps) => {
  const queryClient = useQueryClient();

  // Fetch launch options for this venue
  const { data: launchOptions, isLoading: loadingLaunchOptions } = useQuery({
    queryKey: ['launch-options', venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launch_options')
        .select('*')
        .eq('venue_id', venueId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch payment methods for this venue
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = useQuery({
    queryKey: ['payment-methods', venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('venue_id', venueId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Update launch options
  const updateLaunchOptions = useMutation({
    mutationFn: async (updates: any) => {
      if (launchOptions?.id) {
        const { data, error } = await supabase
          .from('launch_options')
          .update(updates)
          .eq('id', launchOptions.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('launch_options')
          .insert({ ...updates, venue_id: venueId })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launch-options', venueId] });
      toast({
        title: "Settings Updated",
        description: "Launch options have been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update payment methods
  const updatePaymentMethods = useMutation({
    mutationFn: async (updates: any) => {
      if (paymentMethods?.id) {
        const { data, error } = await supabase
          .from('payment_methods')
          .update(updates)
          .eq('id', paymentMethods.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('payment_methods')
          .insert({ ...updates, venue_id: venueId })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods', venueId] });
      toast({
        title: "Payment Settings Updated",
        description: "Payment method configuration has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const [formData, setFormData] = useState({
    // Launch options
    default_duration_minutes: launchOptions?.default_duration_minutes || 10,
    price_per_minute: launchOptions?.price_per_minute || 15,
    rfid_enabled: launchOptions?.rfid_enabled ?? true,
    qr_payment_enabled: launchOptions?.qr_payment_enabled ?? false,
    tap_to_start_enabled: launchOptions?.tap_to_start_enabled ?? true,
    // Payment methods
    upi_enabled: paymentMethods?.upi_enabled ?? false,
    upi_merchant_id: paymentMethods?.upi_merchant_id || '',
  });

  const handleSaveLaunchOptions = () => {
    updateLaunchOptions.mutate({
      default_duration_minutes: formData.default_duration_minutes,
      price_per_minute: formData.price_per_minute,
      rfid_enabled: formData.rfid_enabled,
      qr_payment_enabled: formData.qr_payment_enabled,
      tap_to_start_enabled: formData.tap_to_start_enabled,
    });
  };

  const handleSavePaymentMethods = () => {
    updatePaymentMethods.mutate({
      rfid_enabled: formData.rfid_enabled,
      upi_enabled: formData.upi_enabled,
      upi_merchant_id: formData.upi_merchant_id,
    });
  };

  const isLoading = loadingLaunchOptions || loadingPaymentMethods;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Machine Settings</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['launch-options', venueId] });
            queryClient.invalidateQueries({ queryKey: ['payment-methods', venueId] });
          }}
          className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Launch Options Settings */}
      <Card className="bg-black/60 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Launch Options
          </CardTitle>
          <CardDescription className="text-gray-300">
            Configure session duration, pricing, and launch preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-300">Default Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.default_duration_minutes}
                onChange={(e) => setFormData({
                  ...formData,
                  default_duration_minutes: parseInt(e.target.value) || 10
                })}
                className="bg-gray-800 border-gray-600 text-white"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-300">Price per Minute (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.50"
                value={formData.price_per_minute}
                onChange={(e) => setFormData({
                  ...formData,
                  price_per_minute: parseFloat(e.target.value) || 15
                })}
                className="bg-gray-800 border-gray-600 text-white"
                disabled={isLoading}
              />
            </div>
          </div>

          <Separator className="bg-gray-700" />

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Launch Preferences</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-gray-300">RFID Card Access</Label>
                <p className="text-sm text-gray-400">Allow launching games with RFID cards</p>
              </div>
              <Switch
                checked={formData.rfid_enabled}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  rfid_enabled: checked
                })}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-gray-300">QR Payment Access</Label>
                <p className="text-sm text-gray-400">Allow launching games with QR code payments</p>
              </div>
              <Switch
                checked={formData.qr_payment_enabled}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  qr_payment_enabled: checked
                })}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-gray-300">Tap to Start</Label>
                <p className="text-sm text-gray-400">Enable tap-to-start functionality</p>
              </div>
              <Switch
                checked={formData.tap_to_start_enabled}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  tap_to_start_enabled: checked
                })}
                disabled={isLoading}
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveLaunchOptions}
            disabled={updateLaunchOptions.isPending || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateLaunchOptions.isPending ? 'Saving...' : 'Save Launch Options'}
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods Settings */}
      <Card className="bg-black/60 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-400" />
            Payment Methods
          </CardTitle>
          <CardDescription className="text-gray-300">
            Configure accepted payment methods for this machine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                  <div>
                    <h4 className="text-white font-medium">RFID Cards</h4>
                    <p className="text-sm text-gray-400">Contactless card payments</p>
                  </div>
                </div>
                <Badge variant={formData.rfid_enabled ? "default" : "secondary"}>
                  {formData.rfid_enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium">UPI QR Code</h4>
                    <p className="text-sm text-gray-400">Mobile payments via QR</p>
                  </div>
                </div>
                <Switch
                  checked={formData.upi_enabled}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    upi_enabled: checked
                  })}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {formData.upi_enabled && (
            <div className="space-y-2">
              <Label htmlFor="upi-merchant" className="text-gray-300">UPI Merchant ID</Label>
              <Input
                id="upi-merchant"
                value={formData.upi_merchant_id}
                onChange={(e) => setFormData({
                  ...formData,
                  upi_merchant_id: e.target.value
                })}
                placeholder="merchant@paytm"
                className="bg-gray-800 border-gray-600 text-white"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-400">
                Enter your UPI merchant ID for QR code generation
              </p>
            </div>
          )}

          <Button 
            onClick={handleSavePaymentMethods}
            disabled={updatePaymentMethods.isPending || isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {updatePaymentMethods.isPending ? 'Saving...' : 'Save Payment Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineSettingsTab;
