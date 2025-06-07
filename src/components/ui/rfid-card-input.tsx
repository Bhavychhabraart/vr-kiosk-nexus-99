
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
} from "lucide-react";

interface RFIDCardInputProps {
  onCardScanned: (cardId: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const RFIDCardInput = ({
  onCardScanned,
  isLoading = false,
  placeholder = "Enter RFID card ID",
}: RFIDCardInputProps) => {
  const [cardInput, setCardInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardInput.trim()) {
      onCardScanned(cardInput.trim());
    }
  };

  return (
    <div className="space-y-4">
      {/* Manual RFID Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rfid" className="text-vr-text">RFID Card ID</Label>
          <Input
            id="rfid"
            type="text"
            placeholder={placeholder}
            value={cardInput}
            onChange={(e) => setCardInput(e.target.value)}
            className="mt-1 bg-vr-dark/50 border-vr-primary/30"
            disabled={isLoading}
          />
        </div>
        
        <Button
          type="submit"
          disabled={isLoading || !cardInput.trim()}
          className="w-full bg-vr-primary hover:bg-vr-primary/80"
        >
          {isLoading ? (
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
  );
};
