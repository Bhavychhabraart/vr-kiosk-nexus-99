
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PremiumVrIcon } from "../icons/PremiumVrIcon";
import { PremiumButton } from "../ui/premium-button";
import { 
  Home, 
  Grid, 
  Timer, 
  Settings, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-vr-dark/90 backdrop-blur-lg shadow-md" 
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <PremiumVrIcon className="h-10 w-10 text-vr-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-xl text-vr-text tracking-tight leading-none">
                VR<span className="text-vr-secondary">Kiosk</span>
              </span>
              <span className="text-xs text-vr-muted tracking-widest uppercase">Premium Experience</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-vr-text" />
            ) : (
              <Menu className="h-6 w-6 text-vr-text" />
            )}
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavItem to="/" icon={<Home size={18} />} label="Home" active={isActive("/")} />
            <NavItem to="/games" icon={<Grid size={18} />} label="Games" active={isActive("/games")} />
            <NavItem to="/session" icon={<Timer size={18} />} label="Session" active={isActive("/session")} />
            <NavItem to="/admin" icon={<Settings size={18} />} label="Admin" active={isActive("/admin")} />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-vr-dark/95 backdrop-blur-md border-b border-vr-primary/20 py-2 z-50">
          <MobileNavItem to="/" icon={<Home size={18} />} label="Home" onClick={toggleMenu} active={isActive("/")} />
          <MobileNavItem to="/games" icon={<Grid size={18} />} label="Games" onClick={toggleMenu} active={isActive("/games")} />
          <MobileNavItem to="/session" icon={<Timer size={18} />} label="Session" onClick={toggleMenu} active={isActive("/session")} />
          <MobileNavItem to="/admin" icon={<Settings size={18} />} label="Admin" onClick={toggleMenu} active={isActive("/admin")} />
        </div>
      )}
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1 px-4 py-2 rounded-md transition-colors relative font-medium ${
        active 
          ? "text-vr-secondary bg-vr-primary/10" 
          : "text-vr-text/80 hover:text-vr-secondary hover:bg-vr-primary/5"
      }`}
    >
      <span className="text-vr-secondary">{icon}</span>
      <span>{label}</span>
      {active && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-vr-secondary rounded-full" />
      )}
    </Link>
  );
};

interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}

const MobileNavItem = ({ to, icon, label, onClick, active }: MobileNavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between px-4 py-3 border-b border-vr-primary/10 ${
        active 
          ? "bg-vr-primary/10 text-vr-secondary" 
          : "text-vr-text/80 hover:text-vr-secondary"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className="text-vr-secondary">{icon}</span>
        <span>{label}</span>
      </div>
      <ChevronRight size={16} className="text-vr-muted" />
    </Link>
  );
};

export default Navbar;
