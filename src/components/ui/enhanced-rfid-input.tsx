
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  Scan,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedRFIDInputProps {
  onCardScanned: (cardId: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  autoSubmitDelay?: number; // milliseconds
  showAnimations?: boolean;
}

export const EnhancedRFIDInput = ({
  onCardScanned,
  isLoading = false,
  placeholder = "Tap your RFID card or enter ID...",
  autoSubmitDelay = 2000,
  showAnimations = true,
}: EnhancedRFIDInputProps) => {
  const [cardInput, setCardInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [autoSubmitTimer, setAutoSubmitTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Auto-submit after delay when user stops typing
  useEffect(() => {
    if (autoSubmitTimer) {
      clearTimeout(autoSubmitTimer);
    }

    if (cardInput.trim() && !isLoading) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, autoSubmitDelay);
      setAutoSubmitTimer(timer);
    }

    return () => {
      if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
      }
    };
  }, [cardInput]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
      }
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (cardInput.trim() && !isLoading) {
      setIsScanning(true);
      onCardScanned(cardInput.trim());
      
      // Simulate scanning animation
      setTimeout(() => {
        setCardInput("");
        setIsScanning(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setCardInput("");
      if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
      }
    }
  };

  const getScanningText = () => {
    if (isLoading) return "Processing...";
    if (isScanning) return "Scanning card...";
    if (cardInput.trim()) return `Auto-submit in ${(autoSubmitDelay / 1000).toFixed(1)}s`;
    return placeholder;
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rfid" className="text-vr-text">RFID Card Scanner</Label>
          
          <div className="relative">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: isScanning || isLoading ? 1.02 : 1,
                boxShadow: isScanning ? "0 0 20px rgba(139, 92, 246, 0.5)" : "none"
              }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Input
                ref={inputRef}
                id="rfid"
                type="text"
                placeholder={getScanningText()}
                value={cardInput}
                onChange={(e) => setCardInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`
                  mt-1 bg-vr-dark/50 border-vr-primary/30 pr-12 transition-all duration-200
                  ${isScanning || isLoading ? 'border-vr-primary shadow-[0_0_10px_rgba(139,92,246,0.3)]' : ''}
                  ${cardInput.trim() ? 'border-green-500/50' : ''}
                `}
                disabled={isLoading || isScanning}
                autoComplete="off"
                spellCheck={false}
              />
              
              {/* Scanning indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-vr-primary" />
                    </motion.div>
                  ) : isScanning ? (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Scan className="h-4 w-4 text-vr-secondary" />
                      </motion.div>
                    </motion.div>
                  ) : cardInput.trim() ? (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className="h-4 w-4 text-vr-muted" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Progress bar for auto-submit */}
            <AnimatePresence>
              {cardInput.trim() && !isLoading && !isScanning && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  exit={{ width: 0 }}
                  transition={{ duration: autoSubmitDelay / 1000, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-vr-primary to-vr-secondary"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Auto-submit info */}
          <div className="text-xs text-vr-muted space-y-1">
            <p>• Card will auto-submit after {autoSubmitDelay / 1000}s of inactivity</p>
            <p>• Press Enter to submit immediately • Press Escape to clear</p>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={isLoading || isScanning || !cardInput.trim()}
          className="w-full bg-vr-primary hover:bg-vr-primary/80 transition-all duration-200"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </motion.div>
            ) : isScanning ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <Scan className="h-4 w-4 mr-2" />
                Scanning...
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Scan Card
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </form>
    </div>
  );
};
