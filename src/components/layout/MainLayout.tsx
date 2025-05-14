
import { ReactNode } from "react";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

const MainLayout = ({ children, className }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-vr-gradient">
      <Navbar />
      <main className={cn("flex-1 px-4 py-8 md:px-6 lg:px-8", className)}>
        {children}
      </main>
      <footer className="p-4 text-center text-vr-muted text-sm">
        <p>© 2025 VR Kiosk Management System | Powered by Lovable</p>
      </footer>
    </div>
  );
};

export default MainLayout;
