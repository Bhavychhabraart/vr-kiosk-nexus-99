
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle,
  Scan,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InlineRFIDInputProps {
  onCardScanned: (cardId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  autoSubmitDelay?: number;
  placeholder?: string;
}

export const InlineRFIDInput = ({
  onCardScanned,
  isLoading = false,
  disabled = false,
  autoSubmitDelay = 1500,
  placeholder = "Tap RFID card...",
}: InlineRFIDInputProps) => {
  const [cardInput, setCardInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [autoSubmitTimer, setAutoSubmitTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when not disabled or loading
  useEffect(() => {
    if (inputRef.current && !disabled && !isLoading) {
      inputRef.current.focus();
    }
  }, [disabled, isLoading]);

  // Auto-submit logic
  useEffect(() => {
    if (autoSubmitTimer) {
      clearTimeout(autoSubmitTimer);
    }

    if (cardInput.trim() && !isLoading && !disabled) {
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (cardInput.trim() && !isLoading && !disabled) {
      setIsScanning(true);
      onCardScanned(cardInput.trim());
      
      // Clear and refocus after animation
      setTimeout(() => {
        setCardInput("");
        setIsScanning(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 800);
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

  const getPlaceholderText = () => {
    if (isLoading) return "Processing card...";
    if (isScanning) return "Scanning...";
    if (cardInput.trim()) return `Auto-scan in ${(autoSubmitDelay / 1000).toFixed(1)}s`;
    return placeholder;
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <motion.div
            animate={{ 
              scale: isScanning || (cardInput.trim() && !isLoading) ? 1.01 : 1,
              boxShadow: isScanning ? "0 0 15px rgba(139, 92, 246, 0.4)" : "none"
            }}
            transition={{ duration: 0.2 }}
          >
            <Input
              ref={inputRef}
              type="text"
              placeholder={getPlaceholderText()}
              value={cardInput}
              onChange={(e) => setCardInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || disabled || isScanning}
              className={`
                bg-black/50 border-gray-600 text-white pr-10 transition-all duration-200
                ${isScanning ? 'border-vr-primary shadow-[0_0_8px_rgba(139,92,246,0.3)]' : ''}
                ${cardInput.trim() ? 'border-green-500/50' : ''}
              `}
              autoComplete="off"
              spellCheck={false}
            />
            
            {/* Icon indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-vr-primary" />
                  </motion.div>
                ) : isScanning ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <Scan className="h-4 w-4 text-vr-secondary" />
                    </motion.div>
                  </motion.div>
                ) : cardInput.trim() ? (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress indicator for auto-submit */}
            <AnimatePresence>
              {cardInput.trim() && !isLoading && !isScanning && !disabled && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: autoSubmitDelay / 1000, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-vr-primary to-vr-secondary origin-left"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || disabled || isScanning || !cardInput.trim()}
          className="bg-vr-primary hover:bg-vr-primary/90 min-w-[120px]"
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
                key="scan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Scan
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </form>

      {/* Helper text */}
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-gray-400"
      >
        Auto-scans after {autoSubmitDelay / 1000}s • Press Enter to scan immediately
      </motion.p>
    </div>
  );
};
