
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface RFIDCardInputProps {
  onCardScanned: (cardId: string) => void;
  onSimulate: () => void;
  isLoading?: boolean;
  isSimulating?: boolean;
  placeholder?: string;
  showSimulation?: boolean;
}

export const RFIDCardInput = ({
  onCardScanned,
  onSimulate,
  isLoading = false,
  isSimulating = false,
  placeholder = "Enter RFID card ID",
  showSimulation = true,
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
      {/* RFID Simulation */}
      {showSimulation && (
        <div className="text-center">
          <Button
            onClick={onSimulate}
            disabled={isSimulating || isLoading}
            className="w-full py-6 bg-vr-secondary hover:bg-vr-secondary/90 text-vr-dark font-semibold text-lg"
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Simulating RFID Tap...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Simulate RFID Tap
              </>
            )}
          </Button>
          <p className="text-xs text-vr-muted mt-2">
            Works without hardware - Perfect for testing
          </p>
        </div>
      )}

      {showSimulation && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-vr-primary/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-vr-dark px-2 text-vr-muted">Or enter manually</span>
          </div>
        </div>
      )}

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
            disabled={isLoading || isSimulating}
          />
        </div>
        
        <Button
          type="submit"
          disabled={isLoading || isSimulating || !cardInput.trim()}
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
