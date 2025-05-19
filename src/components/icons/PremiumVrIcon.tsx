
import { cn } from "@/lib/utils";

interface PremiumVrIconProps {
  className?: string;
}

export function PremiumVrIcon({ className }: PremiumVrIconProps) {
  return (
    <svg
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-10", className)}
    >
      <g filter="url(#filter0_d_123_456)">
        <path 
          d="M25 5C14.5066 5 6 13.5066 6 24C6 34.4934 14.5066 43 25 43C35.4934 43 44 34.4934 44 24C44 13.5066 35.4934 5 25 5Z" 
          fill="url(#paint0_linear_123_456)" 
        />
        <path 
          d="M15 21C15 19.3431 16.3431 18 18 18H32C33.6569 18 35 19.3431 35 21V27C35 28.6569 33.6569 30 32 30H18C16.3431 30 15 28.6569 15 27V21Z" 
          fill="url(#paint1_linear_123_456)" 
          fillOpacity="0.8"
        />
        <path 
          d="M20 16V32M30 16V32" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <circle cx="20" cy="24" r="2" fill="#10B981" />
        <circle cx="30" cy="24" r="2" fill="#10B981" />
      </g>
      <defs>
        <filter id="filter0_d_123_456" x="0" y="0" width="50" height="50" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="1"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_123_456"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_123_456" result="shape"/>
        </filter>
        <linearGradient id="paint0_linear_123_456" x1="6" y1="5" x2="44" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1"/>
          <stop offset="1" stopColor="#0A0C17"/>
        </linearGradient>
        <linearGradient id="paint1_linear_123_456" x1="15" y1="18" x2="35" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981"/>
          <stop offset="1" stopColor="#6366F1"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
