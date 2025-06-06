
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ModernActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "primary" | "secondary" | "admin";
  children?: React.ReactNode;
  className?: string;
}

export function ModernActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  variant = "primary",
  children,
  className
}: ModernActionCardProps) {
  const variants = {
    primary: {
      background: "from-vr-primary/10 via-vr-accent/5 to-transparent",
      border: "border-vr-primary/30",
      iconBg: "from-vr-primary to-vr-accent",
      glow: "hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]"
    },
    secondary: {
      background: "from-vr-secondary/10 via-vr-secondary/5 to-transparent",
      border: "border-vr-secondary/30",
      iconBg: "from-vr-secondary to-vr-secondary/80",
      glow: "hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]"
    },
    admin: {
      background: "from-blue-500/10 via-blue-400/5 to-transparent",
      border: "border-blue-400/30",
      iconBg: "from-blue-500 to-blue-600",
      glow: "hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]"
    }
  };

  const config = variants[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-3xl cursor-pointer",
        "backdrop-blur-xl bg-gradient-to-br border transition-all duration-500",
        "hover:scale-[1.02] hover:-translate-y-2 active:scale-[0.98]",
        config.background,
        config.border,
        config.glow,
        className
      )}
    >
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 h-32 rounded-full bg-white/5 -top-16 -right-16 group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute w-24 h-24 rounded-full bg-white/3 -bottom-12 -left-12 group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Content */}
      <div className="relative p-8 h-full flex flex-col items-center text-center space-y-6">
        {/* Icon */}
        <div className={cn(
          "w-20 h-20 rounded-full bg-gradient-to-r flex items-center justify-center",
          "shadow-2xl group-hover:scale-110 transition-transform duration-300",
          config.iconBg
        )}>
          <Icon className="w-10 h-10 text-white" />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors">
            {title}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            {description}
          </p>
        </div>

        {/* Children (buttons) */}
        {children && (
          <div className="mt-auto pt-4 w-full">
            {children}
          </div>
        )}
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </div>
  );
}
