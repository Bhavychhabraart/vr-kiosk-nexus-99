
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Sparkles, 
  Key,
  Monitor,
  Users,
  ArrowRight,
  PartyPopper,
  Gamepad2,
  Settings as SettingsIcon
} from "lucide-react";
import { useMachineSetup } from "@/hooks/useMachineSetup";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface CompletionStepProps {
  setupStatus: any;
}

export const CompletionStep = ({ setupStatus }: CompletionStepProps) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { updateProgress, isUpdating } = useMachineSetup();
  const navigate = useNavigate();

  const handleLaunchCustomerMode = async () => {
    if (!setupStatus?.serial_number) return;

    setIsLaunching(true);
    
    try {
      // Mark setup as completed
      await updateProgress({
        serialNumber: setupStatus.serial_number,
        status: 'completed',
        stepData: {
          completion: {
            completed_at: new Date().toISOString(),
            launched_to_customer_mode: true,
          }
        }
      });

      toast({
        title: "🎉 Setup Complete!",
        description: "Your VR kiosk is now ready for customers!",
      });

      // Navigate to customer mode (games page)
      setTimeout(() => {
        navigate('/games');
      }, 2000);

    } catch (error) {
      console.error('Failed to complete setup:', error);
      setIsLaunching(false);
    }
  };

  const handleGoToAdminPanel = () => {
    navigate('/machine-admin');
  };

  // Setup summary data
  const setupSummary = {
    machine_serial: setupStatus?.serial_number || 'N/A',
    product_key: setupStatus?.setup_data?.registration?.product_key || 'Generated',
    business_name: setupStatus?.setup_data?.owner?.business_name || 'Your Business',
    games_enabled: setupStatus?.setup_data?.system_config?.enabled_games?.length || 5,
    launch_options: [
      setupStatus?.setup_data?.system_config?.tap_to_start_enabled && 'Tap to Start',
      setupStatus?.setup_data?.system_config?.rfid_enabled && 'RFID Cards',
      setupStatus?.setup_data?.system_config?.qr_payment_enabled && 'QR Payment'
    ].filter(Boolean).join(', ') || 'Tap to Start, RFID Cards',
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <h3 className="text-3xl font-bold text-white">
          🎉 Setup Complete!
        </h3>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Congratulations! Your VR kiosk has been successfully configured and is ready to provide 
          amazing virtual reality experiences to your customers.
        </p>
      </div>

      {/* Setup Summary */}
      <Card className="bg-gradient-to-br from-vr-primary/10 to-vr-secondary/10 border-vr-primary/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PartyPopper className="h-6 w-6 text-vr-primary" />
            Setup Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-300">Machine Serial:</span>
                <span className="text-white font-mono">{setupSummary.machine_serial}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-300">Business Name:</span>
                <span className="text-white">{setupSummary.business_name}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-300">Games Enabled:</span>
                <Badge className="bg-vr-primary text-black">{setupSummary.games_enabled} Games</Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-300">Product Key:</span>
                <Badge variant="secondary">Generated ✓</Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-300">Network Status:</span>
                <Badge className="bg-green-500 text-white">Connected ✓</Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-300">Payment Methods:</span>
                <span className="text-white text-sm">{setupSummary.launch_options}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-white font-medium">Customer Mode (Recommended)</h4>
                <p className="text-gray-300 text-sm">
                  Launch directly into customer mode where customers can select games and make payments. 
                  This is the default operational mode for your kiosk.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-700/20 border border-gray-500/30 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-white font-medium">Admin Panel Access</h4>
                <p className="text-gray-300 text-sm">
                  Access the machine admin panel to view analytics, manage games, update settings, 
                  and monitor your kiosk's performance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-vr-primary/20 to-vr-primary/10 border-vr-primary/50 hover:border-vr-primary transition-all cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-vr-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Gamepad2 className="h-6 w-6 text-vr-primary" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Launch Customer Mode</h4>
                <p className="text-gray-300 text-sm">Start serving customers immediately</p>
              </div>
              <Button 
                onClick={handleLaunchCustomerMode}
                disabled={isLaunching || isUpdating}
                className="w-full bg-vr-primary hover:bg-vr-primary/90 text-black font-semibold"
              >
                {isLaunching ? (
                  "Launching..."
                ) : (
                  <>
                    Go Live Now!
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-600/20 to-gray-700/10 border-gray-500/50 hover:border-gray-400 transition-all cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto">
                <Monitor className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Admin Panel</h4>
                <p className="text-gray-300 text-sm">Configure settings and view analytics</p>
              </div>
              <Button 
                onClick={handleGoToAdminPanel}
                variant="outline"
                className="w-full border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white"
              >
                Open Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Information */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="text-white font-semibold">Need Help?</h4>
            <p className="text-blue-300 text-sm">
              Your kiosk is now operational! For support, troubleshooting, or questions about managing your VR kiosk, 
              contact our support team at <strong>support@vrkiosk.com</strong> or call <strong>1800-VR-HELP</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
