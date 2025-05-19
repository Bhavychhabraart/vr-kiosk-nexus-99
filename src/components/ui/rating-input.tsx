
import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  maxRating?: number;
  initialRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}

export function RatingInput({
  maxRating = 5,
  initialRating = 0,
  size = "md",
  className,
  onChange,
  readOnly = false,
}: RatingInputProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };
  
  const containerSizes = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3"
  };

  const handleClick = (value: number) => {
    if (readOnly) return;
    setRating(value);
    if (onChange) onChange(value);
  };

  const handleMouseEnter = (value: number) => {
    if (readOnly) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div 
      className={cn("flex items-center", containerSizes[size], className)}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <Star
            key={index}
            className={cn(
              starSizes[size],
              "cursor-pointer transition-all",
              displayRating >= ratingValue 
                ? "text-vr-secondary fill-vr-secondary" 
                : "text-vr-muted/30",
              readOnly ? "cursor-default" : "hover:scale-110"
            )}
            onClick={() => handleClick(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
          />
        );
      })}
    </div>
  );
}
