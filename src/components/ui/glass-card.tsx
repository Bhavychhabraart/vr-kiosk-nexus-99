
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "neon";
  blur?: "sm" | "md" | "lg";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = "default", blur = "md", ...props }, ref) => {
    const variants = {
      default: "bg-white/10 border-white/20",
      elevated: "bg-white/15 border-white/30 shadow-2xl",
      neon: "bg-gradient-to-br from-vr-primary/20 to-vr-accent/20 border-vr-primary/30"
    };

    const blurLevels = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md",
      lg: "backdrop-blur-lg"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl border transition-all duration-300",
          "hover:border-opacity-50 hover:shadow-lg",
          variants[variant],
          blurLevels[blur],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
