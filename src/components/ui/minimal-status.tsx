
import React from "react";
import { cn } from "@/lib/utils";

interface MinimalStatusProps {
  status: "connected" | "connecting" | "disconnected";
  className?: string;
}

export function MinimalStatus({ status, className }: MinimalStatusProps) {
  const statusConfig = {
    connected: {
      color: "bg-vr-secondary",
      animation: "animate-pulse",
      glow: "shadow-[0_0_8px_rgba(16,185,129,0.6)]"
    },
    connecting: {
      color: "bg-yellow-500",
      animation: "animate-bounce",
      glow: "shadow-[0_0_8px_rgba(234,179,8,0.6)]"
    },
    disconnected: {
      color: "bg-red-500",
      animation: "",
      glow: "shadow-[0_0_8px_rgba(239,68,68,0.6)]"
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 w-3 h-3 rounded-full transition-all duration-300",
      config.color,
      config.animation,
      config.glow,
      className
    )}>
      <div className={cn(
        "absolute inset-0 rounded-full opacity-75",
        config.color,
        "animate-ping"
      )} />
    </div>
  );
}
