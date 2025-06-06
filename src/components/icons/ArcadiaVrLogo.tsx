
import { cn } from "@/lib/utils";

interface ArcadiaVrLogoProps {
  className?: string;
  animated?: boolean;
}

export function ArcadiaVrLogo({ className, animated = true }: ArcadiaVrLogoProps) {
  return (
    <div className={cn("relative", className)}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 120 120" 
        className={cn(
          "w-full h-full drop-shadow-lg",
          animated && "animate-float"
        )}
      >
        {/* Outer ring with gradient */}
        <defs>
          <linearGradient id="arcadiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer ring */}
        <circle 
          cx="60" 
          cy="60" 
          r="55" 
          fill="none" 
          stroke="url(#arcadiaGradient)" 
          strokeWidth="3"
          filter="url(#glow)"
          className={animated ? "animate-spin-slow" : ""}
        />
        
        {/* VR Headset body */}
        <rect 
          x="25" 
          y="45" 
          width="70" 
          height="30" 
          rx="15" 
          fill="url(#arcadiaGradient)" 
          opacity="0.9"
        />
        
        {/* VR Lenses */}
        <circle cx="40" cy="60" r="10" fill="#ffffff" opacity="0.9" />
        <circle cx="80" cy="60" r="10" fill="#ffffff" opacity="0.9" />
        <circle cx="40" cy="60" r="6" fill="#6366F1" />
        <circle cx="80" cy="60" r="6" fill="#6366F1" />
        
        {/* Head strap */}
        <path 
          d="M 25 55 Q 10 40 10 60 Q 10 80 25 65" 
          fill="none" 
          stroke="url(#arcadiaGradient)" 
          strokeWidth="4" 
          strokeLinecap="round"
        />
        <path 
          d="M 95 55 Q 110 40 110 60 Q 110 80 95 65" 
          fill="none" 
          stroke="url(#arcadiaGradient)" 
          strokeWidth="4" 
          strokeLinecap="round"
        />
        
        {/* Central A for Arcadia */}
        <text 
          x="60" 
          y="67" 
          textAnchor="middle" 
          fontSize="14" 
          fontWeight="bold" 
          fill="#ffffff"
          fontFamily="Montserrat, sans-serif"
        >
          A
        </text>
      </svg>
      
      {/* Animated glow rings */}
      {animated && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-vr-primary/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-vr-secondary/50 animate-pulse" />
        </>
      )}
    </div>
  );
}
