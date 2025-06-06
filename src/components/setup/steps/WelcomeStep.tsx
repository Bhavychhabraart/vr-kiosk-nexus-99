
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Smartphone, ArrowRight, Zap } from "lucide-react";
import { useMachineSetup } from "@/hooks/useMachineSetup";
import { toast } from "@/components/ui/use-toast";
import type { ValidateTokenResponse } from "@/types/setup";

interface WelcomeStepProps {
  onNext: () => void;
  onPrevious: () => void;
  setupStatus: ValidateTokenResponse | null;
}

export const WelcomeStep = ({ onNext, setupStatus }: WelcomeStepProps) => {
  const [serialNumber, setSerialNumber] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const { initializeSetup, isInitializing } = useMachineSetup();

  const handleSerialSubmit = async () => {
    if (!serialNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter the machine serial number.",
      });
      return;
    }

    try {
      await initializeSetup(serialNumber.trim());
      onNext();
    } catch (error) {
      console.error('Failed to initialize setup:', error);
    }
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    // Simulate QR code scanning
    setTimeout(() => {
      const mockSerial = `VRK-${Date.now().toString().slice(-6)}`;
      setSerialNumber(mockSerial);
      setIsScanning(false);
      toast({
        title: "QR Code Scanned",
        description: `Serial number ${mockSerial} detected successfully.`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-vr-primary/20 rounded-full flex items-center justify-center mx-auto">
          <Zap className="h-8 w-8 text-vr-primary" />
        </div>
        <h3 className="text-2xl font-bold text-white">
          Welcome to Your New VR Kiosk!
        </h3>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Congratulations on your new VR kiosk! Let's get it set up and ready for your customers. 
          We'll guide you through each step to ensure everything is configured perfectly.
        </p>
      </div>

      {/* Serial Number Input */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardContent className="pt-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            Machine Identification
          </h4>
          <p className="text-gray-300 mb-6">
            First, we need to identify your machine. You can either scan the QR code on your machine 
            or manually enter the serial number found on the device label.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code Scanning */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-medium">
                <QrCode className="h-5 w-5 text-vr-primary" />
                Scan QR Code
              </div>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                {isScanning ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <QrCode className="h-12 w-12 text-vr-primary mx-auto" />
                    </div>
                    <p className="text-gray-300">Scanning QR code...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto" />
                    <Button 
                      onClick={simulateQRScan}
                      variant="outline"
                      className="border-vr-primary text-vr-primary hover:bg-vr-primary hover:text-black"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Scan QR Code
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-medium">
                <Smartphone className="h-5 w-5 text-vr-primary" />
                Manual Entry
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serial" className="text-white">
                    Serial Number
                  </Label>
                  <Input
                    id="serial"
                    type="text"
                    placeholder="Enter machine serial number (e.g., VRK-123456)"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="bg-black/50 border-gray-600 text-white mt-2"
                  />
                </div>
                <p className="text-sm text-gray-400">
                  You can find the serial number on a label attached to your VR kiosk machine.
                </p>
              </div>
            </div>
          </div>

          {/* Current Serial Display */}
          {serialNumber && (
            <div className="mt-6 p-4 bg-vr-primary/10 border border-vr-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Detected Serial Number:</p>
                  <p className="text-vr-primary font-mono text-lg">{serialNumber}</p>
                </div>
                <Button 
                  onClick={handleSerialSubmit}
                  disabled={isInitializing}
                  className="bg-vr-primary hover:bg-vr-primary/90 text-black"
                >
                  {isInitializing ? (
                    "Initializing..."
                  ) : (
                    <>
                      Continue Setup
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardContent className="pt-6">
          <h4 className="text-lg font-semibold text-white mb-2">Need Help?</h4>
          <p className="text-gray-300 text-sm">
            If you can't find the serial number or QR code, check the back or bottom of your machine. 
            For additional support, contact our team at support@vrkiosk.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
