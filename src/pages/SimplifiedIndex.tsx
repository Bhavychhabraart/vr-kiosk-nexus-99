
import { Play, Settings, LogOut, Clock, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { ArcadiaVrLogo } from "@/components/icons/ArcadiaVrLogo";
import { KioskButton } from "@/components/ui/kiosk-button";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedOrbs } from "@/components/ui/animated-orbs";
import { Button } from "@/components/ui/button";

const SimplifiedIndex = () => {
  const navigate = useNavigate();
  const { user, profile, isSuperAdmin, isMachineAdmin, signOut } = useSimplifiedAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-vr-dark via-gray-900 to-vr-dark relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedOrbs intensity="medium" orbCount={6} />
      
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex justify-between items-center p-6">
          {/* System Status */}
          <div className="flex items-center gap-4 text-white/70">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-vr-secondary" />
              <span className="text-sm">Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-vr-secondary" />
              <span className="text-sm">{currentTime}</span>
            </div>
          </div>

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-white/80 text-right">
                <p className="text-sm opacity-75">Signed in as</p>
                <p className="text-sm font-medium">{profile?.full_name || profile?.email}</p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
          
          {/* Hero Section */}
          <div className="text-center space-y-8 max-w-4xl">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32">
                <ArcadiaVrLogo className="w-full h-full" animated />
              </div>
            </div>

            {/* Brand Title */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight">
                <span className="bg-gradient-to-r from-vr-primary via-vr-accent to-vr-secondary bg-clip-text text-transparent">
                  Nextgen Arcadia
                </span>
              </h1>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white/90">
                VR Experience
              </h2>
              <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                Step Into Tomorrow's Gaming Today
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl">
            {/* Browse Games - Always visible */}
            <GlassCard variant="neon" className="flex-1 p-8 hover:scale-105 transition-transform duration-300">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-vr-primary to-vr-accent rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">VR Games</h3>
                  <p className="text-white/80">Explore immersive virtual reality experiences</p>
                </div>
                <KioskButton 
                  onClick={() => navigate('/games')}
                  variant="primary"
                  size="large"
                  className="w-full"
                >
                  <Play className="h-6 w-6" />
                  Browse Games
                </KioskButton>
              </div>
            </GlassCard>

            {/* Admin Access */}
            <GlassCard variant="elevated" className="flex-1 p-8 hover:scale-105 transition-transform duration-300">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">Admin Access</h3>
                  <p className="text-white/80">
                    {user ? "Access your management dashboard" : "Sign in to manage the kiosk"}
                  </p>
                </div>
                
                {!user ? (
                  <KioskButton 
                    onClick={() => navigate('/auth')}
                    variant="admin"
                    size="large"
                    className="w-full"
                  >
                    <Settings className="h-6 w-6" />
                    Admin Sign In
                  </KioskButton>
                ) : (
                  <div className="space-y-4">
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
                        Machine Panel
                      </KioskButton>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-16">
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-vr-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-vr-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Immersive VR</h3>
              <p className="text-white/70 text-sm">
                Next-generation virtual reality with stunning visuals and responsive controls
              </p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-vr-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-vr-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Easy Operation</h3>
              <p className="text-white/70 text-sm">
                Intuitive touch interface designed for seamless user interaction
              </p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-vr-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-6 h-6 text-vr-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Always Connected</h3>
              <p className="text-white/70 text-sm">
                Real-time updates and cloud-based game library management
              </p>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Ambient lighting effects */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-vr-primary/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-vr-accent/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
    </div>
  );
};

export default SimplifiedIndex;
