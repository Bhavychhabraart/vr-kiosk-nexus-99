
import React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface KioskButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: "primary" | "secondary" | "admin";
  glowEffect?: boolean;
  size?: "default" | "large" | "xl";
  children: React.ReactNode;
}

const KioskButton = React.forwardRef<HTMLButtonElement, KioskButtonProps>(
  ({ className, variant = "primary", glowEffect = true, size = "default", children, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-vr-primary via-vr-accent to-vr-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-lg hover:shadow-vr-primary/50",
      secondary: "bg-gradient-to-r from-vr-secondary/80 to-vr-secondary text-vr-dark shadow-lg hover:shadow-vr-secondary/50",
      admin: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-blue-500/50"
    };

    const sizes = {
      default: "px-8 py-4 text-lg",
      large: "px-12 py-6 text-xl",
      xl: "px-16 py-8 text-2xl"
    };

    return (
      <Button
        className={cn(
          "relative overflow-hidden font-semibold transition-all duration-300 border-0 rounded-2xl",
          "hover:scale-105 active:scale-95",
          "backdrop-blur-sm",
          variants[variant],
          sizes[size],
          glowEffect && "hover:shadow-2xl",
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-3">
          {children}
        </span>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl" />
      </Button>
    );
  }
);

KioskButton.displayName = "KioskButton";

export { KioskButton };
