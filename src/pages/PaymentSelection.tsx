
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpiQrPayment } from "@/components/ui/upi-qr-payment";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Wallet,
  Play,
  Clock,
  CheckCircle,
  User
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PaymentSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const gameId = searchParams.get("gameId");
  const gameTitle = searchParams.get("title") || "VR Game";
  const duration = searchParams.get("duration") || "1800";
  const rfidTag = searchParams.get("rfidTag");
  
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!gameId || !rfidTag) {
      toast({
        title: "Invalid Request",
        description: "Missing game or RFID information. Please start over.",
        variant: "destructive",
      });
      navigate("/games");
    }
  }, [gameId, rfidTag, navigate, toast]);

  const calculatePrice = () => {
    const durationMinutes = Math.floor(parseInt(duration) / 60);
    const pricePerMinute = 10; // ₹10 per minute
    return durationMinutes * pricePerMinute;
  };

  const paymentMethods = [
    {
      id: "rfid_balance",
      name: "RFID Card Balance",
      description: "Use your card's stored balance",
      icon: CreditCard,
      available: true,
      balance: 500
    },
    {
      id: "upi",
      name: "UPI Payment",
      description: "Pay with any UPI app",
      icon: Smartphone,
      available: true
    },
    {
      id: "cash",
      name: "Cash Payment",
      description: "Pay with cash to staff",
      icon: Wallet,
      available: true
    }
  ];

  const handlePaymentMethod = async (methodId: string) => {
    setSelectedMethod(methodId);
    setIsProcessing(true);

    try {
      const price = calculatePrice();
      
      if (methodId === "rfid_balance") {
        // Simulate RFID balance deduction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "Payment Successful",
          description: `₹${price} deducted from your RFID card balance`,
        });
        setPaymentCompleted(true);
        
      } else if (methodId === "cash") {
        // For cash payment, skip processing and go directly to session
        toast({
          title: "Cash Payment Selected",
          description: "Please pay the staff and confirm to start the game",
        });
        setPaymentCompleted(true);
        
      } else if (methodId === "upi") {
        // For UPI, we'll show the QR payment component
        toast({
          title: "UPI Payment Initiated",
          description: "Complete the payment to start the game",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartGame = async () => {
    if (!paymentCompleted && selectedMethod !== "upi") return;
    
    try {
      // Create session record
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Navigate to session with all required parameters
      const params = new URLSearchParams({
        gameId: gameId!,
        title: gameTitle,
        duration: duration,
        sessionId: sessionId,
        rfidTag: rfidTag!
      });
      
      navigate(`/session?${params.toString()}`);
      
    } catch (error) {
      console.error("Session creation error:", error);
      toast({
        title: "Session Creation Failed",
        description: "Unable to start game session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: string) => {
    const mins = Math.floor(parseInt(seconds) / 60);
    return `${mins} minutes`;
  };

  const price = calculatePrice();

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
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-full space-y-6"
        >
          {/* Session Summary */}
          <Card className="vr-card backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-vr-primary" />
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-vr-muted">Game</div>
                  <div className="font-semibold">{gameTitle}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-vr-muted">Duration</div>
                  <div className="font-semibold">{formatDuration(duration)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-vr-muted">RFID Card</div>
                  <div className="font-semibold">{rfidTag?.substring(0, 12)}...</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-vr-muted">Total Price</div>
                  <div className="font-bold text-vr-primary text-lg">₹{price}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Selection */}
          <Card className="vr-card backdrop-blur-md">
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
              <CardDescription>
                Choose how you want to pay for your VR session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                const canAfford = method.id === "rfid_balance" ? (method.balance || 0) >= price : true;
                
                return (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      className={`w-full p-4 h-auto justify-start ${
                        !canAfford ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => !isProcessing && canAfford && handlePaymentMethod(method.id)}
                      disabled={isProcessing || !canAfford}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className="h-5 w-5" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm opacity-75">{method.description}</div>
                          {method.id === "rfid_balance" && (
                            <div className="text-xs opacity-75">
                              Available: ₹{method.balance} {!canAfford && "(Insufficient balance)"}
                            </div>
                          )}
                        </div>
                        {paymentCompleted && isSelected && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </Button>
                  </motion.div>
                );
              })}

              {/* UPI Payment Component */}
              {selectedMethod === "upi" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4"
                >
                  <UpiQrPayment
                    amount={price}
                    description={`VR Game: ${gameTitle}`}
                    onPaymentComplete={() => {
                      setPaymentCompleted(true);
                      toast({
                        title: "Payment Successful",
                        description: "UPI payment completed successfully",
                      });
                    }}
                  />
                </motion.div>
              )}

              {/* Start Game Button */}
              {(paymentCompleted || selectedMethod === "upi") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t"
                >
                  <Button
                    onClick={handleStartGame}
                    className="w-full py-6 bg-vr-secondary hover:bg-vr-secondary/90 text-vr-dark font-semibold text-lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start VR Session
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default PaymentSelection;
