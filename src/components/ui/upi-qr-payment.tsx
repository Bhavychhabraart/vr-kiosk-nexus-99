
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Smartphone, QrCode, IndianRupee, Timer } from "lucide-react";
import { motion } from "framer-motion";

interface UPIQRPaymentProps {
  amount: number;
  merchantId: string;
  transactionRef: string;
  onPaymentComplete: () => void;
  onPaymentCancel: () => void;
}

const UPIQRPayment: React.FC<UPIQRPaymentProps> = ({
  amount,
  merchantId,
  transactionRef,
  onPaymentComplete,
  onPaymentCancel
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'expired'>('pending');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate UPI QR Code URL
    const upiUrl = `upi://pay?pa=${merchantId}&pn=VR Gaming Hub&am=${amount}&tn=${transactionRef}&cu=INR`;
    
    // For demo purposes, we'll use a QR code generator service
    // In production, you would generate this server-side
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    setQrCodeUrl(qrApiUrl);
  }, [amount, merchantId, transactionRef]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaymentVerification = () => {
    // Simulate payment verification
    // In a real app, this would check with your payment gateway
    setPaymentStatus('completed');
    setTimeout(() => {
      onPaymentComplete();
    }, 1500);
  };

  if (paymentStatus === 'completed') {
    return (
      <Card className="max-w-md mx-auto border-green-500">
        <CardContent className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          </motion.div>
          <h3 className="text-xl font-bold text-green-600 mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground">Your VR session will begin shortly...</p>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <Card className="max-w-md mx-auto border-red-500">
        <CardContent className="text-center py-8">
          <Timer className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold text-red-600 mb-2">Payment Expired</h3>
          <p className="text-muted-foreground mb-4">
            The payment window has expired. Please try again.
          </p>
          <Button onClick={onPaymentCancel} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Smartphone className="h-6 w-6 text-vr-primary" />
          UPI Payment
        </CardTitle>
        <CardDescription>
          Scan the QR code with any UPI app to complete payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="text-center p-4 bg-vr-primary/10 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-vr-primary">
            <IndianRupee className="h-6 w-6" />
            <span>{amount}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Amount to pay</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="UPI QR Code" 
                className="w-48 h-48"
                onError={(e) => {
                  // Fallback if QR generation fails
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-center">How to pay:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-vr-primary text-white flex items-center justify-center text-xs font-bold">1</div>
              <p>Open any UPI app (PhonePe, GPay, Paytm, etc.)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-vr-primary text-white flex items-center justify-center text-xs font-bold">2</div>
              <p>Scan the QR code above</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-vr-primary text-white flex items-center justify-center text-xs font-bold">3</div>
              <p>Complete the payment</p>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Timer className="h-4 w-4 mr-2" />
            {formatTime(timeLeft)}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            Time remaining to complete payment
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handlePaymentVerification}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            I've Completed Payment
          </Button>
          <Button 
            onClick={onPaymentCancel}
            variant="outline"
            className="w-full"
          >
            Cancel Payment
          </Button>
        </div>

        {/* Payment Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Transaction ID: {transactionRef}</p>
          <p>Merchant: {merchantId}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UPIQRPayment;
