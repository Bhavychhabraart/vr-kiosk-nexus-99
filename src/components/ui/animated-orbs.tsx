
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedOrbsProps {
  className?: string;
  orbCount?: number;
  intensity?: "low" | "medium" | "high";
}

export function AnimatedOrbs({ className, orbCount = 5, intensity = "medium" }: AnimatedOrbsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const intensityConfig = {
    low: { opacity: "opacity-20", blur: "blur-[40px]", size: "w-32 h-32" },
    medium: { opacity: "opacity-30", blur: "blur-[50px]", size: "w-48 h-48" },
    high: { opacity: "opacity-40", blur: "blur-[60px]", size: "w-64 h-64" }
  };

  const config = intensityConfig[intensity];

  const orbs = Array.from({ length: orbCount }, (_, i) => ({
    id: i,
    color: ["bg-vr-primary", "bg-vr-secondary", "bg-vr-accent"][i % 3],
    position: {
      x: Math.random() * 100,
      y: Math.random() * 100,
    },
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${15 + Math.random() * 10}s`
  }));

  if (!mounted) return null;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={cn(
            "absolute rounded-full animate-float",
            orb.color,
            config.opacity,
            config.blur,
            config.size
          )}
          style={{
            left: `${orb.position.x}%`,
            top: `${orb.position.y}%`,
            animationDelay: orb.animationDelay,
            animationDuration: orb.animationDuration,
          }}
        />
      ))}
    </div>
  );
}
