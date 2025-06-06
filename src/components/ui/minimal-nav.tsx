
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface MinimalNavProps {
  showBack?: boolean;
  title?: string;
  className?: string;
}

export function MinimalNav({ showBack = false, title, className }: MinimalNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  if (isHomePage) return null;

  return (
    <div className={cn(
      "fixed top-4 left-4 z-50 flex items-center gap-3",
      className
    )}>
      <button
        onClick={() => navigate(-1)}
        className={cn(
          "w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/20",
          "flex items-center justify-center text-white/80 hover:text-white",
          "hover:bg-white/20 transition-all duration-300 hover:scale-110",
          "shadow-lg hover:shadow-xl"
        )}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => navigate("/")}
        className={cn(
          "w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/20",
          "flex items-center justify-center text-white/80 hover:text-white",
          "hover:bg-white/20 transition-all duration-300 hover:scale-110",
          "shadow-lg hover:shadow-xl"
        )}
      >
        <Home className="w-5 h-5" />
      </button>

      {title && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 px-4 py-2 rounded-full">
          <span className="text-white/90 font-medium text-sm">{title}</span>
        </div>
      )}
    </div>
  );
}
