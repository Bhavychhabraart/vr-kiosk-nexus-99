
import { useEffect } from "react";
import { Server, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectionState } from "@/services/websocket";
import useCommandCenter from "@/hooks/useCommandCenter";
import { toast } from "@/components/ui/sonner";

interface CommandCenterStatusProps {
  className?: string;
  showLabel?: boolean;
}

export function CommandCenterStatus({ className, showLabel = false }: CommandCenterStatusProps) {
  const { connectionState, connect } = useCommandCenter({
    autoConnect: true,
    onConnectionChange: (state) => {
      // Show toast for connection state changes
      if (state === ConnectionState.FAILED) {
        toast.error("Failed to connect to VR system", {
          action: {
            label: "Retry",
            onClick: () => connect()
          }
        });
      }
    }
  });
  
  // Get status info based on connection state
  const getStatusInfo = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return {
          icon: <Wifi className="h-4 w-4" />,
          label: "Connected",
          className: "text-green-500"
        };
      case ConnectionState.CONNECTING:
        return {
          icon: <Wifi className="h-4 w-4 animate-pulse" />,
          label: "Connecting",
          className: "text-yellow-500"
        };
      case ConnectionState.RECONNECTING:
        return {
          icon: <Wifi className="h-4 w-4 animate-pulse" />,
          label: "Reconnecting",
          className: "text-yellow-500"
        };
      case ConnectionState.FAILED:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: "Connection Failed",
          className: "text-red-500"
        };
      case ConnectionState.DISCONNECTED:
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          label: "Disconnected",
          className: "text-gray-500"
        };
    }
  };
  
  const { icon, label, className: statusClassName } = getStatusInfo();
  
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Server className="h-4 w-4 text-vr-muted" />
      <span className={cn("flex items-center gap-1", statusClassName)}>
        {icon}
        {showLabel && <span className="text-sm">{label}</span>}
      </span>
    </div>
  );
}

export default CommandCenterStatus;
