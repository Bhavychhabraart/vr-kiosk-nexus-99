
import { cn } from "@/lib/utils";

interface VrIconProps {
  className?: string;
}

export function VrIcon({ className }: VrIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
    >
      <path
        d="M21 6H3C1.9 6 1 6.9 1 8V16C1 17.1 1.9 18 3 18H7.72L8.56 19.5C8.82 19.85 9.2 20.04 9.58 20.04H14.42C14.8 20.04 15.18 19.85 15.44 19.5L16.28 18H21C22.1 18 23 17.1 23 16V8C23 6.9 22.1 6 21 6ZM4 16C3.45 16 3 15.55 3 15C3 14.45 3.45 14 4 14C4.55 14 5 14.45 5 15C5 15.55 4.55 16 4 16ZM5 11H3V9H5V11ZM14.5 13.5C12.84 13.5 11.5 12.16 11.5 10.5C11.5 8.84 12.84 7.5 14.5 7.5C16.16 7.5 17.5 8.84 17.5 10.5C17.5 12.16 16.16 13.5 14.5 13.5ZM19 9H21V11H19V9Z"
        fill="currentColor"
      />
    </svg>
  );
}
