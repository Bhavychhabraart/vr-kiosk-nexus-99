
import React from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowEffect?: boolean;
  hoverEffect?: boolean;
  variant?: "primary" | "secondary" | "accent" | "dark";
}

const PremiumCard = ({ 
  children, 
  className, 
  glowEffect = false,
  hoverEffect = true,
  variant = "primary",
  ...props 
}: PremiumCardProps) => {
  const variants = {
    primary: "border-vr-primary/20 bg-gradient-to-br from-vr-primary/10 to-transparent",
    secondary: "border-vr-secondary/20 bg-gradient-to-br from-vr-secondary/10 to-transparent",
    accent: "border-vr-accent/20 bg-gradient-to-br from-vr-accent/10 to-transparent",
    dark: "border-white/5 bg-gradient-to-br from-white/5 to-transparent"
  };

  return (
    <div
      className={cn(
        "rounded-xl border backdrop-blur-md p-6 transition-all duration-300",
        variants[variant],
        hoverEffect && "hover:shadow-lg hover:-translate-y-1",
        glowEffect && "shadow-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { PremiumCard };
