
import { useState, useEffect } from "react";
import useCommandCenter from "@/hooks/useCommandCenter";
import { MinimalStatus } from "./ui/minimal-status";

interface CommandCenterStatusProps {
  showLabel?: boolean;
}

const CommandCenterStatus = ({ showLabel = true }: CommandCenterStatusProps) => {
  const { connectionState, isConnected } = useCommandCenter();
  const [timeConnected, setTimeConnected] = useState<string>("00:00:00");
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Set start time when connection is established
  useEffect(() => {
    if (isConnected && !startTime) {
      setStartTime(new Date());
    } else if (!isConnected) {
      setStartTime(null);
    }
  }, [isConnected, startTime]);

  // Update connected time every second
  useEffect(() => {
    if (!isConnected || !startTime) return;

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
  }, [isConnected, startTime]);

  // Map connectionState to status for display
  const getStatusFromConnectionState = () => {
    if (connectionState === "connected") return "connected";
    if (connectionState === "connecting" || connectionState === "reconnecting") return "connecting";
    return "disconnected";
  };
  
  const status = getStatusFromConnectionState();

  if (!showLabel) {
    return <MinimalStatus status={status} />;
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${
        status === "connected" 
          ? "bg-vr-secondary animate-pulse" 
          : status === "connecting" 
            ? "bg-yellow-500 animate-pulse" 
            : "bg-red-500"
      }`} />
      
      <div>
        <p className="text-sm font-medium text-white">
          {status === "connected" 
            ? "System Connected" 
            : status === "connecting" 
              ? "Connecting..." 
              : "Disconnected"
          }
        </p>
        {status === "connected" && (
          <p className="text-xs text-white/60">Connected for {timeConnected}</p>
        )}
      </div>
    </div>
  );
};

export default CommandCenterStatus;
