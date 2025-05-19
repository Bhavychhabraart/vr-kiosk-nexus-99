
import { cn } from "@/lib/utils";

interface PremiumVrIconProps {
  className?: string;
}

export function PremiumVrIcon({
  className
}: PremiumVrIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("h-6 w-6", className)}
    >
      <path d="M3 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0z" />
      <path d="M9 12h5.5a2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5H9" />
      <path d="M9 12v6" />
      <path d="M15 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0z" />
      <path d="M3 8v8" />
      <path d="M21 8v8" />
      <path d="M12 4v2" />
      <path d="M12 18v2" />
    </svg>
  );
}
