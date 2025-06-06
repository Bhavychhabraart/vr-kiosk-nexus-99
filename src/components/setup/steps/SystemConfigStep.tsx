
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  CreditCard, 
  Smartphone, 
  GamepadIcon,
  Clock,
  IndianRupee,
  CheckCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import { useMachineSetup } from "@/hooks/useMachineSetup";
import { toast } from "@/components/ui/use-toast";

interface SystemConfigStepProps {
  onNext: () => void;
  setupStatus: any;
}

export const SystemConfigStep = ({ onNext, setupStatus }: SystemConfigStepProps) => {
  const [systemConfig, setSystemConfig] = useState({
    // Launch Options
    tap_to_start_enabled: true,
    rfid_enabled: true,
    qr_payment_enabled: false,
    
    // Pricing
    default_duration_minutes: 10,
    price_per_minute: 15.0,
    
    // Payment Settings
    upi_enabled: false,
    upi_merchant_id: "",
    
    // Game Settings
    enabled_games: [] as string[],
    game_duration_limits: {
      min_duration: 5,
      max_duration: 30,
    }
  });

  const [configurationSteps, setConfigurationSteps] = useState({
    launch_options: false,
    payment_setup: false,
    game_catalog: false,
    final_verification: false,
  });

  const { updateProgress, isUpdating } = useMachineSetup();

  // Mock games for configuration
  const availableGames = [
    { id: "beat-saber", title: "Beat Saber", category: "Rhythm" },
    { id: "space-explorer", title: "Space Explorer", category: "Adventure" },
    { id: "zombie-apocalypse", title: "Zombie Apocalypse", category: "Action" },
    { id: "racing-fury", title: "Racing Fury", category: "Racing" },
    { id: "puzzle-worlds", title: "Puzzle Worlds", category: "Puzzle" },
  ];

  const handleConfigChange = (field: string, value: any) => {
    setSystemConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleGame = (gameId: string) => {
    setSystemConfig(prev => ({
      ...prev,
      enabled_games: prev.enabled_games.includes(gameId)
        ? prev.enabled_games.filter(id => id !== gameId)
        : [...prev.enabled_games, gameId]
    }));
  };

  const runConfigurationStep = async (step: string) => {
    setConfigurationSteps(prev => ({ ...prev, [step]: true }));
    
    // Simulate configuration process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Configuration Updated",
      description: `${step.replace('_', ' ')} has been configured successfully.`,
    });
  };

  const runFinalVerification = async () => {
    setConfigurationSteps(prev => ({ ...prev, final_verification: true }));
    
    // Run all configuration steps
    await runConfigurationStep('launch_options');
    await runConfigurationStep('payment_setup');
    await runConfigurationStep('game_catalog');
    
    toast({
      title: "System Configuration Complete",
      description: "All systems have been configured and verified successfully.",
    });
  };

  const handleContinue = async () => {
    if (!setupStatus?.serial_number) return;

    try {
      await updateProgress({
        serialNumber: setupStatus.serial_number,
        status: 'system_configured',
        stepData: {
          system_config: {
            ...systemConfig,
            configuration_steps: configurationSteps,
            completed_at: new Date().toISOString(),
          }
        }
      });
      onNext();
    } catch (error) {
      console.error('Failed to update system configuration:', error);
    }
  };

  const allStepsCompleted = Object.values(configurationSteps).every(Boolean);

  return (
    <div className="space-y-6">
      {/* System Configuration Introduction */}
      <div className="text-center space-y-2">
        <Settings className="h-12 w-12 text-vr-primary mx-auto" />
        <h3 className="text-xl font-bold text-white">System Configuration</h3>
        <p className="text-gray-300">
          Configure your machine's operation settings, payment methods, and game catalog.
        </p>
      </div>

      {/* Launch Options */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-vr-primary" />
            Launch Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div>
                <Label className="text-white font-medium">Tap to Start</Label>
                <p className="text-gray-400 text-sm">Allow customers to start games with a simple tap</p>
              </div>
              <Switch 
                checked={systemConfig.tap_to_start_enabled}
                onCheckedChange={(checked) => handleConfigChange('tap_to_start_enabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div>
                <Label className="text-white font-medium">RFID Card Payment</Label>
                <p className="text-gray-400 text-sm">Accept payments via RFID cards</p>
              </div>
              <Switch 
                checked={systemConfig.rfid_enabled}
                onCheckedChange={(checked) => handleConfigChange('rfid_enabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div>
                <Label className="text-white font-medium">QR Code Payment</Label>
                <p className="text-gray-400 text-sm">Accept UPI payments via QR codes</p>
              </div>
              <Switch 
                checked={systemConfig.qr_payment_enabled}
                onCheckedChange={(checked) => handleConfigChange('qr_payment_enabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-vr-primary" />
            Pricing & Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Default Session Duration (minutes)</Label>
              <Input
                type="number"
                value={systemConfig.default_duration_minutes}
                onChange={(e) => handleConfigChange('default_duration_minutes', parseInt(e.target.value))}
                className="bg-black/50 border-gray-600 text-white mt-2"
                min="5"
                max="60"
              />
            </div>
            <div>
              <Label className="text-white">Price per Minute (₹)</Label>
              <Input
                type="number"
                step="0.5"
                value={systemConfig.price_per_minute}
                onChange={(e) => handleConfigChange('price_per_minute', parseFloat(e.target.value))}
                className="bg-black/50 border-gray-600 text-white mt-2"
                min="1"
                max="100"
              />
            </div>
          </div>
          
          <div className="p-4 bg-vr-primary/10 border border-vr-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-white">Session Price:</span>
              <span className="text-vr-primary font-bold text-lg">
                ₹{systemConfig.default_duration_minutes * systemConfig.price_per_minute}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Setup */}
      {systemConfig.qr_payment_enabled && (
        <Card className="bg-gray-800/50 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-vr-primary" />
              UPI Payment Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">UPI Merchant ID</Label>
              <Input
                type="text"
                placeholder="Enter your UPI merchant ID"
                value={systemConfig.upi_merchant_id}
                onChange={(e) => handleConfigChange('upi_merchant_id', e.target.value)}
                className="bg-black/50 border-gray-600 text-white mt-2"
              />
              <p className="text-gray-400 text-sm mt-1">
                This will be used to generate QR codes for customer payments
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Catalog */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GamepadIcon className="h-5 w-5 text-vr-primary" />
            Game Catalog
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">Select which games will be available to your customers:</p>
          
          <div className="grid gap-3">
            {availableGames.map(game => (
              <div key={game.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <GamepadIcon className="h-5 w-5 text-vr-primary" />
                  <div>
                    <p className="text-white font-medium">{game.title}</p>
                    <Badge variant="secondary" className="text-xs">{game.category}</Badge>
                  </div>
                </div>
                <Switch 
                  checked={systemConfig.enabled_games.includes(game.id)}
                  onCheckedChange={() => toggleGame(game.id)}
                />
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>{systemConfig.enabled_games.length}</strong> games selected. 
              You can add or remove games later from the admin panel.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Actions */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Apply Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runFinalVerification}
            disabled={allStepsCompleted}
            className="w-full bg-vr-primary hover:bg-vr-primary/90 text-black"
          >
            {allStepsCompleted ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Configuration Applied Successfully
              </>
            ) : (
              "Apply All Configuration Settings"
            )}
          </Button>
          
          {allStepsCompleted && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-white font-medium">Configuration Complete!</p>
                  <p className="text-gray-300 text-sm">
                    All system settings have been applied and verified. Your kiosk is ready for operation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={!allStepsCompleted || isUpdating}
          className="bg-vr-primary hover:bg-vr-primary/90 text-black"
        >
          {isUpdating ? (
            "Finalizing..."
          ) : (
            <>
              Complete Setup
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
