
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle, 
  Globe,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { useMachineSetup } from "@/hooks/useMachineSetup";
import { toast } from "@/components/ui/use-toast";

interface NetworkStepProps {
  onNext: () => void;
  setupStatus: any;
}

export const NetworkStep = ({ onNext, setupStatus }: NetworkStepProps) => {
  const [wifiCredentials, setWifiCredentials] = useState({
    ssid: "",
    password: "",
  });
  const [connectionStatus, setConnectionStatus] = useState({
    wifi: 'disconnected' as 'connected' | 'disconnected' | 'connecting',
    internet: 'disconnected' as 'connected' | 'disconnected' | 'testing',
    server: 'disconnected' as 'connected' | 'disconnected' | 'testing',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const { updateProgress, isUpdating } = useMachineSetup();

  // Simulate network detection and connection
  useEffect(() => {
    // Simulate detecting available networks
    const mockNetworks = [
      "VR_Kiosk_Setup",
      "Business_WiFi", 
      "Guest_Network",
      "Mobile_Hotspot"
    ];
    
    // Auto-detect if we're connected
    simulateConnectionCheck();
  }, []);

  const simulateConnectionCheck = async () => {
    setConnectionStatus(prev => ({ ...prev, internet: 'testing', server: 'testing' }));
    
    // Simulate internet connectivity test
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, internet: 'connected' }));
    }, 1500);
    
    // Simulate server connectivity test
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, server: 'connected' }));
    }, 2500);
  };

  const handleWifiConnect = async () => {
    if (!wifiCredentials.ssid) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter the WiFi network name (SSID).",
      });
      return;
    }

    setIsConnecting(true);
    setConnectionStatus(prev => ({ ...prev, wifi: 'connecting' }));

    // Simulate WiFi connection process
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, wifi: 'connected' }));
      setIsConnecting(false);
      toast({
        title: "WiFi Connected",
        description: `Successfully connected to ${wifiCredentials.ssid}`,
      });
      
      // After WiFi connection, test internet and server
      simulateConnectionCheck();
    }, 3000);
  };

  const handleContinue = async () => {
    if (!setupStatus?.serial_number) return;

    try {
      await updateProgress({
        serialNumber: setupStatus.serial_number,
        status: 'network_configured',
        stepData: {
          network: {
            wifi_ssid: wifiCredentials.ssid,
            connection_status: connectionStatus,
            completed_at: new Date().toISOString(),
          }
        }
      });
      onNext();
    } catch (error) {
      console.error('Failed to update network progress:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'connecting':
      case 'testing':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500 text-white">Connected</Badge>;
      case 'connecting':
      case 'testing':
        return <Badge className="bg-yellow-500 text-black">Connecting...</Badge>;
      default:
        return <Badge variant="destructive">Disconnected</Badge>;
    }
  };

  const allConnected = Object.values(connectionStatus).every(status => status === 'connected');

  return (
    <div className="space-y-6">
      {/* Network Setup Introduction */}
      <div className="text-center space-y-2">
        <Wifi className="h-12 w-12 text-vr-primary mx-auto" />
        <h3 className="text-xl font-bold text-white">Network Configuration</h3>
        <p className="text-gray-300">
          Connect your kiosk to the internet to enable all features and remote management.
        </p>
      </div>

      {/* WiFi Connection */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wifi className="h-5 w-5 text-vr-primary" />
            WiFi Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ssid" className="text-white">Network Name (SSID)</Label>
              <Input
                id="ssid"
                type="text"
                placeholder="Enter WiFi network name"
                value={wifiCredentials.ssid}
                onChange={(e) => setWifiCredentials(prev => ({ ...prev, ssid: e.target.value }))}
                className="bg-black/50 border-gray-600 text-white mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter WiFi password"
                value={wifiCredentials.password}
                onChange={(e) => setWifiCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="bg-black/50 border-gray-600 text-white mt-2"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(connectionStatus.wifi)}
              <span className="text-white">WiFi Status:</span>
              {getStatusBadge(connectionStatus.wifi)}
            </div>
            <Button 
              onClick={handleWifiConnect}
              disabled={isConnecting || connectionStatus.wifi === 'connected' || !wifiCredentials.ssid}
              className="bg-vr-primary hover:bg-vr-primary/90 text-black"
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-vr-primary" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Internet Connection */}
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(connectionStatus.internet)}
                <span className="text-white">Internet Connection</span>
              </div>
              {getStatusBadge(connectionStatus.internet)}
            </div>

            {/* Server Connection */}
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(connectionStatus.server)}
                <span className="text-white">VR Kiosk Server</span>
              </div>
              {getStatusBadge(connectionStatus.server)}
            </div>
          </div>

          {allConnected && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-white font-medium">All Systems Connected!</p>
                  <p className="text-gray-300 text-sm">
                    Your kiosk is successfully connected to the internet and our servers.
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
          disabled={!allConnected || isUpdating}
          className="bg-vr-primary hover:bg-vr-primary/90 text-black"
        >
          {isUpdating ? (
            "Saving..."
          ) : (
            <>
              Continue to Registration
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
