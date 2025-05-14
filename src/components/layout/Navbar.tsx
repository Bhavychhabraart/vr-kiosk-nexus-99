
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VrIcon } from "../icons/VrIcon";
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="relative bg-vr-dark/60 backdrop-blur-md border-b border-vr-primary/20 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VrIcon className="h-8 w-8 text-vr-secondary" />
          <span className="font-bold text-xl text-vr-text">
            VR<span className="text-vr-secondary">Kiosk</span>
          </span>
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
        <div className="hidden md:flex items-center gap-1">
          <NavItem to="/" icon={<Home size={18} />} label="Home" />
          <NavItem to="/games" icon={<Grid size={18} />} label="Games" />
          <NavItem to="/session" icon={<Timer size={18} />} label="Session" />
          <NavItem to="/admin" icon={<Settings size={18} />} label="Admin" />
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-vr-dark/95 backdrop-blur-md border-b border-vr-primary/20 py-2 z-50">
          <MobileNavItem to="/" icon={<Home size={18} />} label="Home" onClick={toggleMenu} />
          <MobileNavItem to="/games" icon={<Grid size={18} />} label="Games" onClick={toggleMenu} />
          <MobileNavItem to="/session" icon={<Timer size={18} />} label="Session" onClick={toggleMenu} />
          <MobileNavItem to="/admin" icon={<Settings size={18} />} label="Admin" onClick={toggleMenu} />
        </div>
      )}
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-1 px-4 py-2 text-vr-text/80 hover:text-vr-secondary hover:bg-vr-primary/10 rounded-md transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}

const MobileNavItem = ({ to, icon, label, onClick }: MobileNavItemProps) => {
  return (
    <Link
      to={to}
      className="flex items-center justify-between px-4 py-3 text-vr-text/80 hover:text-vr-secondary border-b border-vr-primary/10"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight size={16} />
    </Link>
  );
};

export default Navbar;
