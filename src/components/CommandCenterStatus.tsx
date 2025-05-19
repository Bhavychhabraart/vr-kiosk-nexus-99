
import { useState, useEffect } from "react";
import { useCommandCenter } from "@/hooks/useCommandCenter";
import { PremiumCard } from "./ui/premium-card";

interface CommandCenterStatusProps {
  showLabel?: boolean;
}

const CommandCenterStatus = ({ showLabel = true }: CommandCenterStatusProps) => {
  const { status, startTime } = useCommandCenter();
  const [timeConnected, setTimeConnected] = useState<string>("00:00:00");

  // Update connected time every second
  useEffect(() => {
    if (status !== "connected" || !startTime) return;

    const updateTime = () => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      
      const hours = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      
      setTimeConnected(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [status, startTime]);

  if (!showLabel) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/5 border border-white/10">
        <div className={`w-2.5 h-2.5 rounded-full ${
          status === "connected" 
            ? "bg-vr-secondary animate-pulse" 
            : status === "connecting" 
              ? "bg-yellow-500 animate-pulse" 
              : "bg-red-500"
        }`} />
        {status === "connected" && <span className="text-vr-muted text-xs">{timeConnected}</span>}
      </div>
    );
  }

  return (
    <PremiumCard className="p-4 flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${
        status === "connected" 
          ? "bg-vr-secondary animate-pulse" 
          : status === "connecting" 
            ? "bg-yellow-500 animate-pulse" 
            : "bg-red-500"
      }`} />
      
      <div>
        <p className="text-sm font-medium">
          {status === "connected" 
            ? "System Connected" 
            : status === "connecting" 
              ? "Connecting..." 
              : "Disconnected"
          }
        </p>
        {status === "connected" && (
          <p className="text-xs text-vr-muted">Connected for {timeConnected}</p>
        )}
      </div>
    </PremiumCard>
  );
};

export default CommandCenterStatus;
