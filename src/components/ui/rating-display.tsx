
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showValue?: boolean;
}

export function RatingDisplay({
  rating,
  max = 5,
  size = "md",
  className,
  showValue = true
}: RatingDisplayProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);
  
  const starSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };
  
  const containerSizes = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5"
  };
  
  return (
    <div className={cn("flex items-center", containerSizes[size], className)}>
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn("fill-vr-secondary text-vr-secondary", starSizes[size])}
          />
        ))}
        
        {hasHalfStar && (
          <div className="relative">
            <Star className={cn("text-vr-muted/30", starSizes[size])} />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: "50%" }}>
              <Star className={cn("fill-vr-secondary text-vr-secondary", starSizes[size])} />
            </div>
          </div>
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={cn("text-vr-muted/30", starSizes[size])} />
        ))}
      </div>
      
      {showValue && (
        <span className="text-vr-secondary font-medium ml-1 text-sm">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
