
import { Play, Settings, LogOut, Clock, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { ArcadiaVrLogo } from "@/components/icons/ArcadiaVrLogo";
import { KioskButton } from "@/components/ui/kiosk-button";
import { AnimatedOrbs } from "@/components/ui/animated-orbs";
import { ModernActionCard } from "@/components/ui/modern-action-card";
import { MinimalStatus } from "@/components/ui/minimal-status";
import { Button } from "@/components/ui/button";

const SimplifiedIndex = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    isSuperAdmin,
    isMachineAdmin,
    signOut
  } = useSimplifiedAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-vr-dark via-gray-900 to-vr-dark relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedOrbs intensity="medium" orbCount={6} />
      
      {/* Minimal Status Indicator */}
      <MinimalStatus status="connected" />

      {/* Minimal Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex justify-between items-center p-4">
          {/* System Status - Minimal */}
          <div className="flex items-center gap-3 text-white/60 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-vr-secondary animate-pulse" />
              <span>Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* User Info & Logout - Minimal */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-white/70 text-right text-xs">
                <p className="opacity-60">Signed in as</p>
                <p className="font-medium">{profile?.full_name || profile?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="sm" 
                className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-3"
              >
                <LogOut className="h-3 w-3 mr-1.5" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
          
          {/* Hero Section - More Minimal */}
          <div className="text-center space-y-6 max-w-4xl">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24">
                <ArcadiaVrLogo className="w-full h-full" animated />
              </div>
            </div>

            {/* Brand Title - More Refined */}
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                <span className="bg-gradient-to-r from-vr-primary via-vr-accent to-vr-secondary bg-clip-text text-transparent">
                  Nextgen Arcadia
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white/90">
                VR Experience
              </h2>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                Step Into Tomorrow's Gaming Today
              </p>
            </div>
          </div>

          {/* Modern Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Browse Games Card */}
            <ModernActionCard 
              title="VR Games" 
              description="Explore immersive virtual reality experiences" 
              icon={Play} 
              variant="primary" 
              onClick={() => navigate('/games')}
            >
              <KioskButton 
                onClick={() => navigate('/games')} 
                variant="primary" 
                size="large" 
                className="w-full"
              >
                <Play className="h-5 w-5" />
                Browse Games
              </KioskButton>
            </ModernActionCard>

            {/* Admin Access Card */}
            <ModernActionCard 
              title="Kiosk Management" 
              description={user ? "Access your management dashboard" : "Sign in or create your machine admin account"} 
              icon={Settings} 
              variant="admin" 
              onClick={() => !user ? navigate('/auth') : undefined}
            >
              {!user ? (
                <div className="space-y-3 w-full">
                  <KioskButton 
                    onClick={() => navigate('/auth')} 
                    variant="admin" 
                    size="large" 
                    className="w-full"
                  >
                    <Settings className="h-5 w-5" />
                    Machine Owner Signup
                  </KioskButton>
                  <KioskButton 
                    onClick={() => navigate('/auth')} 
                    variant="ghost" 
                    size="default" 
                    className="w-full"
                  >
                    Existing User Sign In
                  </KioskButton>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  {/* Super Admin Access */}
                  {isSuperAdmin() && (
                    <KioskButton 
                      onClick={() => navigate('/super-admin')} 
                      variant="admin" 
                      size="default" 
                      className="w-full"
                    >
                      Super Admin Panel
                    </KioskButton>
                  )}
                  
                  {/* Machine Admin Access */}
                  {(isMachineAdmin() || isSuperAdmin()) && (
                    <KioskButton 
                      onClick={() => navigate('/machine-admin')} 
                      variant="admin" 
                      size="default" 
                      className="w-full"
                    >
                      Machine Admin Panel
                    </KioskButton>
                  )}
                </div>
              )}
            </ModernActionCard>
          </div>
        </div>
      </div>

      {/* Enhanced ambient lighting effects */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-vr-primary/8 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-vr-accent/8 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
    </div>
  );
};

export default SimplifiedIndex;
