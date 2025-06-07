
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Settings, Users, Crown, Wrench, UserPlus } from "lucide-react";
import { VrIcon } from "@/components/icons/VrIcon";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isSuperAdmin, isMachineAdmin } = useUserRoles();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavigationLinks = () => (
    <>
      <Link
        to="/games"
        className={`text-sm font-medium transition-colors hover:text-vr-primary ${
          isActive('/games') ? 'text-vr-primary' : 'text-vr-muted'
        }`}
        onClick={() => setIsOpen(false)}
      >
        Games
      </Link>
      
      {user && (
        <>
          {isMachineAdmin && (
            <Link
              to="/machine-admin"
              className={`text-sm font-medium transition-colors hover:text-vr-primary ${
                isActive('/machine-admin') ? 'text-vr-primary' : 'text-vr-muted'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Machine Admin
            </Link>
          )}
          
          {isSuperAdmin && (
            <>
              <Link
                to="/super-admin"
                className={`text-sm font-medium transition-colors hover:text-vr-primary ${
                  isActive('/super-admin') ? 'text-vr-primary' : 'text-vr-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Super Admin
              </Link>
              <Link
                to="/user-setup"
                className={`text-sm font-medium transition-colors hover:text-vr-primary ${
                  isActive('/user-setup') ? 'text-vr-primary' : 'text-vr-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <UserPlus className="w-4 h-4 inline mr-1" />
                User Setup
              </Link>
            </>
          )}
          
          <Link
            to="/admin"
            className={`text-sm font-medium transition-colors hover:text-vr-primary ${
              isActive('/admin') ? 'text-vr-primary' : 'text-vr-muted'
            }`}
            onClick={() => setIsOpen(false)}
          >
            Admin
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-vr-dark/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <VrIcon className="w-8 h-8 text-vr-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent">
              VR Kiosk
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationLinks />
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-vr-muted">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                  {isSuperAdmin && <Crown className="w-4 h-4 text-yellow-400" />}
                  {isMachineAdmin && <Wrench className="w-4 h-4 text-blue-400" />}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="border-vr-primary/30 text-vr-primary hover:bg-vr-primary/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-vr-primary/30 text-vr-primary hover:bg-vr-primary/10"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-vr-dark border-vr-primary/20">
                <div className="flex flex-col space-y-6 mt-6">
                  <NavigationLinks />
                  
                  {user ? (
                    <div className="space-y-4 pt-6 border-t border-vr-primary/20">
                      <div className="flex items-center space-x-2 text-sm text-vr-muted">
                        <User className="w-4 h-4" />
                        <span>{user.email}</span>
                        {isSuperAdmin && <Crown className="w-4 h-4 text-yellow-400" />}
                        {isMachineAdmin && <Wrench className="w-4 h-4 text-blue-400" />}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        className="w-full border-vr-primary/30 text-vr-primary hover:bg-vr-primary/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-6 border-t border-vr-primary/20">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full border-vr-primary/30 text-vr-primary hover:bg-vr-primary/10"
                        >
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
