import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RFIDCardInput } from "@/components/ui/rfid-card-input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const RFIDAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const gameId = searchParams.get("gameId");
  const gameTitle = searchParams.get("title") || "VR Game";
  const duration = searchParams.get("duration") || "1800";
  
  const [rfidTag, setRfidTag] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [authStep, setAuthStep] = useState<"scan" | "verify" | "confirmed">("scan");

  useEffect(() => {
    if (!gameId) {
      toast({
        title: "Invalid Request",
        description: "No game selected. Please select a game first.",
        variant: "destructive",
      });
      navigate("/games");
    }
  }, [gameId, navigate, toast]);

  const handleCardScan = async (tag: string) => {
    if (!tag) return;
    
    setRfidTag(tag);
    setIsVerifying(true);
    setAuthStep("verify");
    
    try {
      // Simulate RFID verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock card data
      const mockCardInfo = {
        tag_id: tag,
        name: `Card ${tag.substring(0, 8)}`,
        balance: 500,
        is_active: true,
        last_used: new Date().toISOString()
      };
      
      setCardInfo(mockCardInfo);
      setAuthStep("confirmed");
      
      toast({
        title: "RFID Card Verified",
        description: `Welcome! Card balance: ₹${mockCardInfo.balance}`,
      });
    } catch (error) {
      console.error("RFID verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify RFID card. Please try again.",
        variant: "destructive",
      });
      setAuthStep("scan");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateRfid = async () => {
    const simulatedTag = `RFID_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    await handleCardScan(simulatedTag);
  };

  const handleContinueToPayment = () => {
    if (!rfidTag || !cardInfo) return;
    
    const params = new URLSearchParams({
      gameId: gameId!,
      title: gameTitle,
      duration: duration,
      rfidTag: rfidTag
    });
    
    navigate(`/payment-selection?${params.toString()}`);
  };

  const formatDuration = (seconds: string) => {
    const mins = Math.floor(parseInt(seconds) / 60);
    return `${mins} minutes`;
  };

  return (
    <MainLayout className="relative px-4 py-8 h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-8"
      >
        <Button 
          variant="ghost" 
          className="text-vr-muted hover:text-vr-text flex items-center gap-2"
          onClick={() => navigate("/games")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Button>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-full"
        >
          <Card className="vr-card backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <CreditCard className="h-6 w-6 text-vr-primary" />
                RFID Authentication
              </CardTitle>
              <CardDescription>
                Scan your RFID card to start playing {gameTitle}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Game Info */}
              <div className="bg-vr-primary/10 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-vr-primary">Selected Game</span>
                  <Badge variant="secondary">{formatDuration(duration)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-vr-text" />
                  <span className="text-vr-text font-semibold">{gameTitle}</span>
                </div>
              </div>

              {/* RFID Scan Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {authStep === "scan" && <CreditCard className="h-5 w-5 text-vr-muted" />}
                  {authStep === "verify" && <Loader2 className="h-5 w-5 text-vr-primary animate-spin" />}
                  {authStep === "confirmed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  <span className="font-medium">
                    {authStep === "scan" && "Scan RFID Card"}
                    {authStep === "verify" && "Verifying Card..."}
                    {authStep === "confirmed" && "Card Verified"}
                  </span>
                </div>

                <RFIDCardInput
                  onCardScanned={handleCardScan}
                  onSimulate={handleSimulateRfid}
                  isLoading={isVerifying}
                  isSimulating={false}
                  placeholder="Tap or scan your RFID card here"
                  showSimulation={authStep === "scan"}
                />

                {isVerifying && (
                  <div className="text-center">
                    <div className="text-sm text-vr-muted">
                      Verifying RFID card...
                    </div>
                  </div>
                )}

                {cardInfo && authStep === "confirmed" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Card Authenticated</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <div>Card ID: {cardInfo.tag_id.substring(0, 12)}...</div>
                      <div>Balance: ₹{cardInfo.balance}</div>
                      <div>Status: Active</div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {authStep === "confirmed" && (
                  <Button
                    onClick={handleContinueToPayment}
                    className="w-full py-6 bg-vr-secondary hover:bg-vr-secondary/90 text-vr-dark font-semibold"
                  >
                    Continue to Payment
                  </Button>
                )}

                {authStep === "scan" && (
                  <div className="text-center text-sm text-vr-muted">
                    Place your RFID card near the reader or enter the card number manually
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-vr-dark/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-vr-accent mt-0.5" />
                  <div className="text-sm text-vr-muted">
                    <div className="font-medium mb-1">How to use RFID:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• Hold your RFID card near the scanner</li>
                      <li>• Wait for the beep and confirmation</li>
                      <li>• Your card will be verified automatically</li>
                      <li>• Ensure your card has sufficient balance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default RFIDAuth;
