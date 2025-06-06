import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Loader2,
  CheckCircle,
  X,
  Zap,
  Wifi
} from "lucide-react";

type ScannerState = "waiting" | "scanning" | "detected" | "processing" | "success" | "error";

interface RFIDScannerModalProps {
  onCardScanned: (cardId: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const RFIDScannerModal = ({
  onCardScanned,
  onCancel,
  isProcessing = false,
}: RFIDScannerModalProps) => {
  const [scannerState, setScannerState] = useState<ScannerState>("waiting");
  const [showManualInput, setShowManualInput] = useState(false);
  const [cardInput, setCardInput] = useState("");
  const [detectedCard, setDetectedCard] = useState("");

  // Auto-transition states for demo purposes
  useEffect(() => {
    if (scannerState === "scanning") {
      const timer = setTimeout(() => {
        const simulatedTag = `RFID_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        setDetectedCard(simulatedTag);
        setScannerState("detected");
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    if (scannerState === "detected") {
      const timer = setTimeout(() => {
        setScannerState("processing");
        onCardScanned(detectedCard);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [scannerState, detectedCard, onCardScanned]);

  // Update scanner state based on external processing
  useEffect(() => {
    if (isProcessing && scannerState === "processing") {
      // Keep processing state
    } else if (!isProcessing && scannerState === "processing") {
      setScannerState("success");
    }
  }, [isProcessing, scannerState]);

  const handleSimulateRfid = () => {
    setScannerState("scanning");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardInput.trim()) {
      setDetectedCard(cardInput.trim());
      setScannerState("detected");
      setCardInput("");
    }
  };

  const getStateConfig = () => {
    switch (scannerState) {
      case "waiting":
        return {
          title: "Tap Your RFID Card",
          subtitle: "Hold your card near the scanner",
          color: "text-vr-primary",
          bgColor: "from-vr-primary/20 to-vr-primary/5",
          borderColor: "border-vr-primary/30"
        };
      case "scanning":
        return {
          title: "Scanning...",
          subtitle: "Reading card data",
          color: "text-vr-secondary",
          bgColor: "from-vr-secondary/20 to-vr-secondary/5",
          borderColor: "border-vr-secondary/30"
        };
      case "detected":
        return {
          title: "Card Detected!",
          subtitle: `Card ID: ${detectedCard.substring(0, 12)}...`,
          color: "text-green-400",
          bgColor: "from-green-400/20 to-green-400/5",
          borderColor: "border-green-400/30"
        };
      case "processing":
        return {
          title: "Processing Payment...",
          subtitle: "Please wait",
          color: "text-yellow-400",
          bgColor: "from-yellow-400/20 to-yellow-400/5",
          borderColor: "border-yellow-400/30"
        };
      case "success":
        return {
          title: "Payment Successful!",
          subtitle: "Starting your VR experience",
          color: "text-green-400",
          bgColor: "from-green-400/20 to-green-400/5",
          borderColor: "border-green-400/30"
        };
      default:
        return {
          title: "Error",
          subtitle: "Please try again",
          color: "text-red-400",
          bgColor: "from-red-400/20 to-red-400/5",
          borderColor: "border-red-400/30"
        };
    }
  };

  const config = getStateConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        className={`
          relative w-full max-w-md bg-gradient-to-br ${config.bgColor}
          border ${config.borderColor} rounded-3xl p-8 shadow-2xl
          backdrop-blur-xl overflow-hidden
        `}
        layoutId="rfid-scanner"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-white/5 -top-32 -right-32"
            animate={{
              scale: scannerState === "scanning" ? [1, 1.2, 1] : 1,
              opacity: scannerState === "scanning" ? [0.3, 0.6, 0.3] : 0.3,
            }}
            transition={{
              duration: 2,
              repeat: scannerState === "scanning" ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full bg-white/3 -bottom-24 -left-24"
            animate={{
              scale: scannerState === "scanning" ? [1, 1.1, 1] : 1,
              opacity: scannerState === "scanning" ? [0.2, 0.4, 0.2] : 0.2,
            }}
            transition={{
              duration: 2.5,
              repeat: scannerState === "scanning" ? Infinity : 0,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Content */}
        <div className="relative space-y-8 text-center">
          {/* Icon Section */}
          <div className="flex justify-center">
            <motion.div
              className={`
                relative w-24 h-24 rounded-full border-4 ${config.borderColor}
                flex items-center justify-center bg-gradient-to-br ${config.bgColor}
              `}
              animate={{
                scale: scannerState === "scanning" ? [1, 1.1, 1] : scannerState === "detected" ? [1, 1.2, 1] : 1,
                borderColor: scannerState === "scanning" ? ["rgba(16,185,129,0.3)", "rgba(16,185,129,0.8)", "rgba(16,185,129,0.3)"] : undefined
              }}
              transition={{
                duration: scannerState === "scanning" ? 1.5 : 0.5,
                repeat: scannerState === "scanning" ? Infinity : scannerState === "detected" ? 1 : 0,
                ease: "easeInOut"
              }}
            >
              <AnimatePresence mode="wait">
                {scannerState === "waiting" && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                  >
                    <CreditCard className={`h-10 w-10 ${config.color}`} />
                  </motion.div>
                )}
                
                {scannerState === "scanning" && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Wifi className={`h-10 w-10 ${config.color}`} />
                    </motion.div>
                  </motion.div>
                )}
                
                {(scannerState === "detected" || scannerState === "success") && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <CheckCircle className={`h-10 w-10 ${config.color}`} />
                  </motion.div>
                )}
                
                {scannerState === "processing" && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className={`h-10 w-10 ${config.color}`} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scanning Ripples */}
              {scannerState === "scanning" && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-vr-secondary/50"
                    animate={{
                      scale: [1, 2, 3],
                      opacity: [0.8, 0.2, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-vr-secondary/30"
                    animate={{
                      scale: [1, 2.5, 4],
                      opacity: [0.6, 0.1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: 0.5
                    }}
                  />
                </>
              )}
            </motion.div>
          </div>

          {/* Text Section */}
          <div className="space-y-2">
            <motion.h3
              key={config.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-2xl font-bold ${config.color}`}
            >
              {config.title}
            </motion.h3>
            <motion.p
              key={config.subtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/70"
            >
              {config.subtitle}
            </motion.p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {scannerState === "waiting" && !showManualInput && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleSimulateRfid}
                  className="w-full py-6 bg-vr-secondary hover:bg-vr-secondary/90 text-black font-semibold text-lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Tap RFID Card
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => setShowManualInput(true)}
                  className="w-full text-white/60 hover:text-white"
                >
                  Enter Card ID Manually
                </Button>
              </motion.div>
            )}

            {scannerState === "waiting" && showManualInput && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Enter RFID card ID"
                    value={cardInput}
                    onChange={(e) => setCardInput(e.target.value)}
                    className="bg-black/50 border-white/20 text-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!cardInput.trim()}
                      className="flex-1 bg-vr-primary hover:bg-vr-primary/90"
                    >
                      Scan
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowManualInput(false)}
                      className="text-white/60 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
