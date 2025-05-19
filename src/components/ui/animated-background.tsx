
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  particleCount?: number;
  className?: string;
  children?: React.ReactNode;
  variant?: "dots" | "orbs" | "grid" | "waves" | "none";
  intensity?: "low" | "medium" | "high";
}

const AnimatedBackground = ({
  particleCount = 30,
  className,
  children,
  variant = "orbs",
  intensity = "medium",
  ...props
}: AnimatedBackgroundProps) => {
  const [mounted, setMounted] = useState(false);
  
  // Mount effect for smooth animation start
  useEffect(() => {
    setMounted(true);
  }, []);

  const getIntensityValues = () => {
    switch (intensity) {
      case "low":
        return { opacity: 0.2, blur: "32px", count: Math.floor(particleCount * 0.6) };
      case "high":
        return { opacity: 0.7, blur: "24px", count: Math.floor(particleCount * 1.4) };
      default: // medium
        return { opacity: 0.5, blur: "28px", count: particleCount };
    }
  };

  const { opacity, blur, count } = getIntensityValues();

  const renderParticles = () => {
    if (variant === "dots") {
      return Array.from({
        length: count
      }).map((_, i) => <div key={i} className="particle" style={{
        position: 'absolute',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        background: `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.1})`,
        boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
        animation: `float ${Math.random() * 10 + 10}s linear infinite`,
        animationDelay: `${Math.random() * 5}s`
      }} />);
    }
    
    if (variant === "grid") {
      return <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 grid grid-cols-12 gap-1 pointer-events-none">
            {Array.from({
            length: 144
          }).map((_, i) => <div key={i} className="aspect-square border border-vr-primary/10 rounded-sm"></div>)}
          </div>
        </div>;
    }
    
    if (variant === "waves") {
      return (
        <div className="absolute inset-0 overflow-hidden">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
      );
    }
    
    if (variant === "none") {
      return null;
    }

    // Default orbs
    return (
      <>
        <div 
          className={cn("orb bg-vr-primary/30 w-64 h-64 -top-10 -left-10 animate-spin-slow", 
            mounted ? "opacity-100" : "opacity-0")}
          style={{ filter: `blur(${blur})`, opacity }}
        ></div>
        <div 
          className={cn("orb bg-vr-secondary/20 w-80 h-80 -bottom-20 -right-20 animate-spin-slow", 
            mounted ? "opacity-100" : "opacity-0")} 
          style={{ animationDelay: "-5s", filter: `blur(${blur})`, opacity }}
        ></div>
        <div 
          className={cn("orb bg-vr-accent/20 w-72 h-72 top-1/3 right-1/4 animate-spin-slow", 
            mounted ? "opacity-100" : "opacity-0")} 
          style={{ animationDelay: "-3s", filter: `blur(${blur})`, opacity }}
        ></div>
        <div 
          className={cn("orb bg-vr-primary/30 w-48 h-48 bottom-1/4 left-1/3 animate-spin-slow", 
            mounted ? "opacity-100" : "opacity-0")} 
          style={{ animationDelay: "-7s", filter: `blur(${blur})`, opacity }}
        ></div>
      </>
    );
  };

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      <div className="absolute inset-0 pointer-events-none">
        {renderParticles()}
      </div>
      <div className={cn(
        "relative z-10 transition-all duration-700",
        variant !== "none" && "bg-vr-dark/30 backdrop-blur-sm"
      )}>
        {children}
      </div>
    </div>
  );
};

export { AnimatedBackground };
