
import React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface PremiumButtonProps extends ButtonProps {
  glowEffect?: boolean;
  rippleEffect?: boolean;
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, glowEffect = false, rippleEffect = true, variant = "primary", children, ...props }, ref) => {
    const [rippleStyle, setRippleStyle] = React.useState<React.CSSProperties>({});
    const [isRippling, setIsRippling] = React.useState(false);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!rippleEffect) return;
        
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(button.offsetWidth, button.offsetHeight);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        setRippleStyle({ left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px` });
        setIsRippling(true);
        
        setTimeout(() => setIsRippling(false), 600);
        
        props.onClick?.(e);
      },
      [props, rippleEffect]
    );

    const variants = {
      primary: "bg-vr-primary hover:bg-vr-primary/80 text-white",
      secondary: "bg-vr-secondary hover:bg-vr-secondary/80 text-vr-dark",
      accent: "bg-vr-accent hover:bg-vr-accent/80 text-white",
      outline: "border-2 border-vr-primary text-vr-primary hover:bg-vr-primary/10",
      ghost: "bg-transparent hover:bg-white/10 text-white"
    };

    return (
      <Button
        className={cn(
          "relative overflow-hidden font-medium transition-all duration-300",
          variants[variant],
          glowEffect && "shadow-glow",
          className
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
        {rippleEffect && isRippling && (
          <span
            className="absolute rounded-full bg-white/30 animate-ripple"
            style={rippleStyle}
          />
        )}
      </Button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";

export { PremiumButton };
