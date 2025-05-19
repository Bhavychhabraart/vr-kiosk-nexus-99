
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  XCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRFID } from "@/hooks/useRFID";

interface RFIDScanScreenProps {
  gameId: string;
  gameTitle: string;
  onClose: () => void;
  onSuccess: (rfidTag: string) => void;
}

const RFIDScanScreen = ({
  gameId,
  gameTitle,
  onClose,
  onSuccess
}: RFIDScanScreenProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isScanning, startRFIDScan, stopRFIDScan, lastScannedTag } = useRFID();
  
  const [scanStatus, setScanStatus] = useState<'waiting' | 'scanning' | 'success' | 'error'>('waiting');
  const [scanTimeout, setScanTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Start scanning automatically when component mounts
  useEffect(() => {
    handleStartScan();
    
    // Clean up if component unmounts during scan
    return () => {
      if (scanTimeout) clearTimeout(scanTimeout);
      stopRFIDScan();
    };
  }, []);
  
  // Watch for successful scan results
  useEffect(() => {
    if (lastScannedTag && scanStatus === 'scanning') {
      setScanStatus('success');
      
      // Add a slight delay before navigating
      const successTimer = setTimeout(() => {
        onSuccess(lastScannedTag);
      }, 1500);
      
      return () => clearTimeout(successTimer);
    }
  }, [lastScannedTag, scanStatus, onSuccess]);
  
  const handleStartScan = () => {
    setScanStatus('scanning');
    startRFIDScan();
    
    // Set a timeout to show error if scan takes too long
    const timeout = setTimeout(() => {
      if (scanStatus === 'scanning') {
        setScanStatus('error');
        stopRFIDScan();
        
        toast({
          title: "Scan Timeout",
          description: "No RFID card detected. Please try again.",
          variant: "destructive",
        });
      }
    }, 10000); // 10 second timeout
    
    setScanTimeout(timeout);
  };
  
  const handleCancel = () => {
    if (scanTimeout) clearTimeout(scanTimeout);
    stopRFIDScan();
    onClose();
  };
  
  const handleRetry = () => {
    if (scanTimeout) clearTimeout(scanTimeout);
    handleStartScan();
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="vr-card w-full max-w-md relative"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={handleCancel}
        >
          <XCircle className="h-5 w-5 text-vr-muted hover:text-vr-text" />
        </Button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1">RFID Authentication</h2>
          <p className="text-vr-muted">Scan your RFID card to start playing {gameTitle}</p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8">
          {scanStatus === 'waiting' && (
            <div className="flex flex-col items-center">
              <CreditCard className="h-16 w-16 text-vr-muted mb-4" />
              <p className="text-vr-muted">Please tap your RFID card to continue</p>
            </div>
          )}
          
          {scanStatus === 'scanning' && (
            <div className="flex flex-col items-center">
              <div className="relative">
                <CreditCard className="h-16 w-16 text-vr-secondary mb-4" />
                <motion.div 
                  className="absolute inset-0 rounded-full bg-vr-secondary/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
              </div>
              <p className="text-vr-secondary flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning for RFID card...
              </p>
            </div>
          )}
          
          {scanStatus === 'success' && (
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              </motion.div>
              <p className="text-green-500">RFID card authenticated successfully!</p>
              <p className="text-vr-muted text-sm mt-1">Launching game session...</p>
            </div>
          )}
          
          {scanStatus === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-vr-accent mb-4" />
              <p className="text-vr-accent mb-4">RFID card scan failed</p>
              <Button onClick={handleRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            className="text-vr-muted flex items-center gap-2"
            onClick={handleCancel}
          >
            <ChevronLeft className="h-4 w-4" /> 
            Back
          </Button>
          
          {scanStatus !== 'scanning' && scanStatus !== 'success' && (
            <Button
              variant="default"
              className="bg-vr-secondary hover:bg-vr-secondary/90 text-vr-dark"
              onClick={handleStartScan}
            >
              Scan Card
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RFIDScanScreen;
