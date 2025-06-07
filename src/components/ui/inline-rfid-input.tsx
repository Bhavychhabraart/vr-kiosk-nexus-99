
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle,
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

  return (
    <div className="space-y-3">
      {/* Manual RFID Input */}
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
          className="bg-vr-primary hover:bg-vr-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Scan
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
