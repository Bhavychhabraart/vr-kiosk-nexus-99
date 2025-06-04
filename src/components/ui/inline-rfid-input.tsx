
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Loader2,
} from "lucide-react";

interface InlineRFIDInputProps {
  onCardScanned: (cardId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const InlineRFIDInput = ({
  onCardScanned,
  isLoading = false,
  disabled = false,
}: InlineRFIDInputProps) => {
  const [cardInput, setCardInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardInput.trim() && !isLoading && !disabled) {
      onCardScanned(cardInput.trim());
      setCardInput("");
    }
  };

  const handleSimulateRfid = () => {
    if (!isLoading && !disabled) {
      const simulatedTag = `RFID_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      onCardScanned(simulatedTag);
    }
  };

  return (
    <div className="space-y-3">
      {/* RFID Simulation Button */}
      <Button
        onClick={handleSimulateRfid}
        disabled={isLoading || disabled}
        className="w-full py-4 bg-vr-secondary hover:bg-vr-secondary/90 text-black font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Tap RFID Card
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-900 px-2 text-gray-400">Or enter manually</span>
        </div>
      </div>

      {/* Manual Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter RFID card ID"
          value={cardInput}
          onChange={(e) => setCardInput(e.target.value)}
          disabled={isLoading || disabled}
          className="bg-black/50 border-gray-600 text-white"
        />
        <Button
          type="submit"
          disabled={isLoading || disabled || !cardInput.trim()}
          variant="outline"
          className="border-gray-600"
        >
          Scan
        </Button>
      </form>
    </div>
  );
};
