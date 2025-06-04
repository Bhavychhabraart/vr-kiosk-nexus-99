
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
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
  Smartphone,
  Gamepad2,
  IndianRupee,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import UPIQRPayment from "@/components/ui/upi-qr-payment";

const PaymentSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { paymentMethods } = usePaymentMethods();
  
  const gameId = searchParams.get("gameId");
  const gameTitle = searchParams.get("title") || "VR Game";
  const duration = searchParams.get("duration") || "600";
  
  const [selectedPayment, setSelectedPayment] = useState<'rfid' | 'upi' | null>(null);
  const [showUPIPayment, setShowUPIPayment] = useState(false);

  const getPrice = (seconds: number) => {
    const prices: Record<number, number> = {
      300: 100,   // 5 minutes
      600: 150,   // 10 minutes
      900: 200,   // 15 minutes
      1200: 220,  // 20 minutes
    };
    return prices[seconds] || 150;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const sessionPrice = getPrice(parseInt(duration));
  const transactionRef = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

  const handleRFIDPayment = () => {
    navigate(`/rfid-auth?gameId=${gameId}&title=${encodeURIComponent(gameTitle)}&duration=${duration}`);
  };

  const handleUPIPayment = () => {
    if (!paymentMethods?.upi_merchant_id) {
      toast({
        title: "UPI Not Configured",
        description: "UPI payments are not available at this time",
        variant: "destructive",
      });
      return;
    }
    setShowUPIPayment(true);
  };

  const handlePaymentComplete = () => {
    toast({
      title: "Payment Successful",
      description: "Your VR session is starting...",
    });
    navigate(
      `/session?gameId=${gameId}&title=${encodeURIComponent(gameTitle)}&duration=${duration}&paymentMethod=upi&transactionRef=${transactionRef}`
    );
  };

  const handlePaymentCancel = () => {
    setShowUPIPayment(false);
    setSelectedPayment(null);
  };

  if (showUPIPayment) {
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
            onClick={() => setShowUPIPayment(false)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payment Options
          </Button>
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <UPIQRPayment
            amount={sessionPrice}
            merchantId={paymentMethods?.upi_merchant_id || "vrworld@paytm"}
            transactionRef={transactionRef}
            onPaymentComplete={handlePaymentComplete}
            onPaymentCancel={handlePaymentCancel}
          />
        </div>
      </MainLayout>
    );
  }

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

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-full"
        >
          <Card className="vr-card border-vr-primary/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Choose Payment Method</CardTitle>
              <CardDescription>
                Select how you'd like to pay for your VR session
              </CardDescription>
              
              {/* Session Info */}
              <div className="bg-vr-primary/10 p-4 rounded-lg mt-4">
                <div className="flex items-center gap-2 justify-center text-vr-muted mb-2">
                  <Gamepad2 className="h-4 w-4" />
                  <span>{gameTitle} - {formatDuration(parseInt(duration))}</span>
                </div>
                <div className="flex items-center gap-1 justify-center text-vr-secondary font-bold text-2xl">
                  <IndianRupee className="h-6 w-6" />
                  <span>{sessionPrice}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* RFID Payment Option */}
              {paymentMethods?.rfid_enabled && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedPayment === 'rfid' 
                        ? 'border-vr-primary bg-vr-primary/5' 
                        : 'border-gray-200 hover:border-vr-primary/50'
                    }`}
                    onClick={() => setSelectedPayment('rfid')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-vr-primary/10">
                          <CreditCard className="h-6 w-6 text-vr-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">RFID Card Payment</h3>
                          <p className="text-muted-foreground text-sm">
                            Quick and contactless payment with your RFID card
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Zap className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Instant Access</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-vr-primary">₹{sessionPrice}</div>
                          <div className="text-xs text-muted-foreground">No extra fees</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* UPI Payment Option */}
              {paymentMethods?.upi_enabled && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedPayment === 'upi' 
                        ? 'border-vr-secondary bg-vr-secondary/5' 
                        : 'border-gray-200 hover:border-vr-secondary/50'
                    }`}
                    onClick={() => setSelectedPayment('upi')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-vr-secondary/10">
                          <Smartphone className="h-6 w-6 text-vr-secondary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">UPI QR Code Payment</h3>
                          <p className="text-muted-foreground text-sm">
                            Pay with any UPI app - PhonePe, GPay, Paytm, etc.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              Scan & Pay
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-vr-secondary">₹{sessionPrice}</div>
                          <div className="text-xs text-muted-foreground">Secure payment</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* No Payment Methods Available */}
              {!paymentMethods?.rfid_enabled && !paymentMethods?.upi_enabled && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-6 text-center">
                    <p className="text-orange-600">
                      No payment methods are currently available. Please contact support.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Button */}
              {selectedPayment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4"
                >
                  <Button 
                    onClick={selectedPayment === 'rfid' ? handleRFIDPayment : handleUPIPayment}
                    className="w-full py-6 text-lg font-semibold"
                    style={{
                      backgroundColor: selectedPayment === 'rfid' ? '#00eaff' : '#ff6b35',
                    }}
                  >
                    {selectedPayment === 'rfid' ? (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Continue with RFID Card
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-5 w-5 mr-2" />
                        Continue with UPI Payment
                      </>
                    )}
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
