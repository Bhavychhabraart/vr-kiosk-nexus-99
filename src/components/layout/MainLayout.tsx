
import { ReactNode, useState, useEffect } from "react";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "../ui/animated-background";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  backgroundVariant?: "dots" | "orbs" | "grid" | "waves" | "none";
  withPattern?: boolean;
  intensity?: "low" | "medium" | "high";
}

const MainLayout = ({ 
  children, 
  className,
  backgroundVariant = "orbs",
  withPattern = false,
  intensity = "medium",
}: MainLayoutProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-vr-gradient relative transition-opacity duration-700",
      mounted ? "opacity-100" : "opacity-0"
    )}>
      {withPattern && (
        <div className="absolute inset-0 pointer-events-none bg-tech-pattern opacity-10" />
      )}
      
      <Navbar />
      
      <AnimatedBackground 
        variant={backgroundVariant === "none" ? undefined : backgroundVariant}
        intensity={intensity}
        className="flex-1 mt-16"
      >
        <main className={cn("px-4 py-8 md:px-6 lg:px-8 max-w-7xl mx-auto", className)}>
          {children}
        </main>
      </AnimatedBackground>
      
      <footer className="py-6 px-4 border-t border-white/5 backdrop-blur-md bg-vr-dark/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-vr-muted text-sm">
            © 2025 VR Kiosk Management System | Powered by Lovable
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-vr-muted hover:text-vr-secondary text-sm transition-colors">Terms</a>
            <a href="#" className="text-vr-muted hover:text-vr-secondary text-sm transition-colors">Privacy</a>
            <a href="#" className="text-vr-muted hover:text-vr-secondary text-sm transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
