
import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  particleCount?: number;
  className?: string;
  children?: React.ReactNode;
  variant?: "dots" | "orbs" | "grid";
}

const AnimatedBackground = ({ 
  particleCount = 30,
  className,
  children,
  variant = "orbs",
  ...props
}: AnimatedBackgroundProps) => {
  
  const renderParticles = () => {
    if (variant === "dots") {
      return Array.from({ length: particleCount }).map((_, i) => (
        <div 
          key={i}
          className="particle"
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.1})`,
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ));
    }

    if (variant === "grid") {
      return (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 grid grid-cols-12 gap-1 pointer-events-none">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="aspect-square border border-vr-primary/10 rounded-sm"></div>
            ))}
          </div>
        </div>
      );
    }

    // Default orbs
    return (
      <>
        <div className="orb bg-vr-primary/30 w-64 h-64 -top-10 -left-10 animate-spin-slow"></div>
        <div className="orb bg-vr-secondary/20 w-80 h-80 -bottom-20 -right-20 animate-spin-slow" style={{animationDelay: "-5s"}}></div>
        <div className="orb bg-vr-accent/20 w-72 h-72 top-1/3 right-1/4 animate-spin-slow" style={{animationDelay: "-3s"}}></div>
      </>
    );
  };
  
  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {renderParticles()}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export { AnimatedBackground };
