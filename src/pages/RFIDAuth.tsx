import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Gamepad2,
  IndianRupee
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { rfidService } from "@/services/rfidService";

const RFIDAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const gameId = searchParams.get("gameId");
  const gameTitle = searchParams.get("title") || "VR Game";
  const duration = searchParams.get("duration") || "600";
  
  const [rfidInput, setRfidInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [validationStep, setValidationStep] = useState<'scan' | 'validated' | 'creating'>('scan');

  useEffect(() => {
    if (!gameId || !gameTitle) {
      toast({
        title: "Invalid Request",
        description: "Game information is missing. Please select a game first.",
        variant: "destructive",
      });
      navigate("/games");
    }
  }, [gameId, gameTitle, navigate, toast]);

  const handleRFIDSubmit = async (cardId: string) => {
    if (!cardId.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an RFID card ID.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    setValidationStep('scan');

    try {
      // Validate the RFID card
      const card = await rfidService.validateRFIDCard(cardId);
      setCardInfo(card);
      setValidationStep('validated');

      toast({
        title: "Card Validated",
        description: `Welcome ${card.name || 'Player'}! Card is valid and active.`,
      });

      // Short delay to show validation success
      setTimeout(async () => {
        setValidationStep('creating');
        
        try {
          // Create session from RFID
          const sessionId = await rfidService.createSessionFromRFID(
            cardId, 
            gameId!, 
            parseInt(duration)
          );

          toast({
            title: "Session Created",
            description: "Your game session has been created. Starting game...",
          });

          // Navigate to session with RFID info
          navigate(
            `/session?gameId=${gameId}&title=${encodeURIComponent(gameTitle)}&duration=${duration}&sessionId=${sessionId}&rfidTag=${cardId}`
          );
        } catch (error) {
          console.error("Session creation error:", error);
          toast({
            title: "Session Creation Failed",
            description: error instanceof Error ? error.message : "Failed to create session",
            variant: "destructive",
          });
          setValidationStep('scan');
        }
      }, 1500);

    } catch (error) {
      console.error("RFID validation error:", error);
      toast({
        title: "Card Validation Failed",
        description: error instanceof Error ? error.message : "Invalid RFID card",
        variant: "destructive",
      });
      setValidationStep('scan');
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRFIDSubmit(rfidInput);
  };

  const handleSimulateRFID = async () => {
    setIsSimulating(true);
    try {
      const simulatedCardId = await rfidService.simulateRFIDTap();
      toast({
        title: "RFID Simulated",
        description: `Simulated card: ${simulatedCardId}`,
      });
      
      // Auto-submit the simulated card
      await handleRFIDSubmit(simulatedCardId);
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "Simulation Failed",
        description: "Failed to simulate RFID tap",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const getPrice = (seconds: number) => {
    const prices: Record<number, number> = {
      300: 100,   // 5 minutes
      600: 150,   // 10 minutes
      900: 200,   // 15 minutes
      1200: 220,  // 20 minutes
    };
    return prices[seconds] || 150;
  };

  const sessionPrice = getPrice(parseInt(duration));

  return (
    <MainLayout className="relative px-4 py-8 min-h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-8"
      >
        <Button 
          variant="ghost" 
          className="text-vr-muted hover:text-vr-text flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-full"
        >
          <Card className="vr-card border-vr-primary/30">
            <CardHeader className="text-center">
              <motion.div
                animate={{
                  scale: validationStep === 'validated' ? [1, 1.1, 1] : 1,
                  color: validationStep === 'validated' ? '#00eaff' : undefined
                }}
                transition={{ duration: 0.5 }}
              >
                {validationStep === 'validated' ? (
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-vr-secondary" />
                ) : validationStep === 'creating' ? (
                  <Loader2 className="h-16 w-16 mx-auto mb-4 text-vr-primary animate-spin" />
                ) : (
                  <CreditCard className="h-16 w-16 mx-auto mb-4 text-vr-primary" />
                )}
              </motion.div>
              
              <CardTitle className="text-2xl font-bold">
                {validationStep === 'validated' ? 'Card Validated!' :
                 validationStep === 'creating' ? 'Creating Session...' :
                 'RFID Authentication'}
              </CardTitle>
              
              <CardDescription>
                {validationStep === 'validated' ? (
                  <>Welcome {cardInfo?.name || 'Player'}! Preparing your session...</>
                ) : validationStep === 'creating' ? (
                  <>Setting up your game session...</>
                ) : (
                  <>Scan your RFID card or simulate one to start playing {gameTitle}</>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {validationStep === 'scan' && (
                <>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="bg-vr-primary/10 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2 justify-center text-vr-muted mb-2">
                          <Gamepad2 className="h-4 w-4" />
                          <span>Session: {formatDuration(parseInt(duration))}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-center text-vr-secondary font-bold text-lg">
                          <IndianRupee className="h-5 w-5" />
                          <span>{sessionPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* RFID Simulation */}
                    <div className="text-center">
                      <Button
                        onClick={handleSimulateRFID}
                        disabled={isSimulating || isValidating}
                        className="w-full py-6 bg-vr-secondary hover:bg-vr-secondary/90 text-vr-dark font-semibold text-lg"
                      >
                        {isSimulating ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Simulating RFID Tap...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5 mr-2" />
                            Simulate RFID Tap
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-vr-muted mt-2">
                        Works without hardware - Perfect for testing
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-vr-primary/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-vr-dark px-2 text-vr-muted">Or enter manually</span>
                      </div>
                    </div>

                    {/* Manual RFID Input */}
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="rfid" className="text-vr-text">RFID Card ID</Label>
                        <Input
                          id="rfid"
                          type="text"
                          placeholder="Enter RFID card ID"
                          value={rfidInput}
                          onChange={(e) => setRfidInput(e.target.value)}
                          className="mt-1 bg-vr-dark/50 border-vr-primary/30"
                          disabled={isValidating || isSimulating}
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={isValidating || isSimulating || !rfidInput.trim()}
                        className="w-full bg-vr-primary hover:bg-vr-primary/80"
                      >
                        {isValidating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Validate Card
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              )}

              {validationStep === 'validated' && cardInfo && (
                <div className="text-center space-y-4">
                  <div className="bg-vr-primary/10 p-4 rounded-lg">
                    <h3 className="font-semibold text-vr-text">Card Information</h3>
                    <p className="text-vr-muted">Name: {cardInfo.name || 'Unknown'}</p>
                    <p className="text-vr-muted">Card ID: {cardInfo.tag_id}</p>
                  </div>
                </div>
              )}

              {validationStep === 'creating' && (
                <div className="text-center space-y-4">
                  <div className="bg-vr-primary/10 p-4 rounded-lg">
                    <p className="text-vr-muted">Creating your game session...</p>
                    <p className="text-vr-muted">This will count as 1 session usage.</p>
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="text-xs text-vr-muted/70 bg-vr-accent/10 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Each RFID tap creates one game session. Session usage is tracked and counted.
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
