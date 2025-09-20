import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PremiumCard } from "@/components/ui/premium-card";
import { VrIcon } from "@/components/icons/VrIcon";
import { Play, Settings, Users, LogOut, User, Sparkles, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
const Index = () => {
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const {
    isSuperAdmin,
    isMachineAdmin,
    isLoading,
    userVenues
  } = useUserRoles();
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  // Auto-redirect machine admins to their admin panel, but only if they have venues
  useEffect(() => {
    if (!isLoading && user && isMachineAdmin && !isSuperAdmin && userVenues && userVenues.length > 0) {
      // Direct machine admins straight to their admin panel
      console.log('Auto-redirecting machine admin to admin panel');
      navigate('/machine-admin');
    }
  }, [user, isMachineAdmin, isSuperAdmin, isLoading, userVenues, navigate]);
  const handleStartExperience = () => {
    navigate('/games');
  };
  const handleAdminAccess = () => {
    if (user) {
      // Navigate based on user's highest role
      if (isSuperAdmin) {
        navigate('/super-admin');
      } else if (isMachineAdmin) {
        navigate('/machine-admin');
      } else {
        // Show admin options for users without specific roles
        setShowAdminOptions(true);
      }
    } else {
      navigate('/auth');
    }
  };
  const handleSignOut = async () => {
    await signOut();
    setShowAdminOptions(false);
  };

  // Show loading while checking roles
  if (isLoading) {
    return (
      <div className="min-h-screen bg-vr-gradient relative overflow-hidden orb-bg">
        <AnimatedBackground variant="orbs" intensity="high" />
        
        {/* Floating glass loading panel */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <PremiumCard className="glass-panel p-12 text-center animate-pulse-glow">
            <div className="relative">
              <div className="animate-spin-slow rounded-full h-16 w-16 border-4 border-vr-primary/30 border-t-vr-primary mx-auto mb-6"></div>
              <Sparkles className="absolute top-2 left-2 w-4 h-4 text-vr-secondary animate-pulse" />
              <Star className="absolute bottom-2 right-2 w-3 h-3 text-vr-accent animate-float" />
            </div>
            <p className="text-vr-text/80 font-medium">Initializing VR Experience...</p>
          </PremiumCard>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-vr-gradient relative overflow-hidden orb-bg">
      <AnimatedBackground variant="orbs" intensity="high" />
      
      {/* Animated tech pattern overlay */}
      <div className="absolute inset-0 bg-tech-pattern opacity-5 animate-float-slow" />
      
      {/* Enhanced floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-vr-primary/20 rounded-full blur-xl animate-float opacity-60" />
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-vr-secondary/25 rounded-full blur-2xl animate-pulse opacity-50" />
      <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-vr-accent/15 rounded-full blur-xl animate-float-slow opacity-40" />
      
      {/* Enhanced user info panel */}
      {user && (
        <div className="absolute top-6 right-6 z-20 flex items-center space-x-4">
          <PremiumCard className="glass-panel p-4 border-vr-primary/30 hover:border-vr-primary/60 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <User className="w-5 h-5 text-vr-primary" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-vr-secondary rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-vr-text text-sm font-medium">{user.email}</span>
                <div className="flex gap-2 mt-1">
                  {isMachineAdmin && (
                    <span className="text-xs text-vr-secondary bg-vr-secondary/20 px-2 py-0.5 rounded-full border border-vr-secondary/30">
                      Machine Admin
                    </span>
                  )}
                  {isSuperAdmin && (
                    <span className="text-xs text-vr-primary bg-vr-primary/20 px-2 py-0.5 rounded-full border border-vr-primary/30">
                      Super Admin
                    </span>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                size="sm" 
                className="glass-button text-vr-muted hover:text-vr-text p-2 ml-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </PremiumCard>
        </div>
      )}
      
      {/* Enhanced Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Premium Logo and Branding Section */}
        <div className="text-center mb-16">
          <PremiumCard className="glass-panel p-8 mb-8 border-vr-primary/20 hover:border-vr-primary/40 transition-all duration-500">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <VrIcon className="w-28 h-28 text-vr-primary animate-pulse-glow mr-6" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-vr-secondary rounded-full animate-pulse" />
                <Sparkles className="absolute top-2 right-2 w-4 h-4 text-vr-accent animate-float" />
              </div>
              <div className="text-left">
                <h1 className="text-7xl font-bold bg-gradient-to-r from-vr-text via-vr-primary to-vr-secondary bg-clip-text text-transparent mb-3 animate-shimmer">
                  NextGen
                </h1>
                <h2 className="text-5xl font-light text-vr-primary shine-effect">
                  Arcadia Kiosk
                </h2>
              </div>
            </div>
            <p className="text-xl text-vr-muted max-w-3xl mx-auto leading-relaxed">
              Experience the future of virtual reality entertainment with cutting-edge technology
            </p>
          </PremiumCard>
        </div>

        {/* Enhanced Main Action Area */}
        {!showAdminOptions ? (
          <div className="text-center space-y-12">
            {/* Premium Start Button */}
            <div className="relative">
              <Button 
                onClick={handleStartExperience} 
                size="lg" 
                className="premium-gradient h-24 px-20 text-3xl font-bold text-white hover:scale-110 transform transition-all duration-500 shadow-glow animate-pulse-glow shine-effect relative overflow-hidden"
              >
                <Play className="mr-6 h-10 w-10" />
                START VR EXPERIENCE
                <Zap className="ml-6 h-8 w-8 animate-pulse" />
              </Button>
              
              {/* Floating accent elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-vr-accent/60 rounded-full blur-sm animate-float" />
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-vr-secondary/60 rounded-full blur-sm animate-pulse" />
            </div>
            
            {/* Enhanced Admin Access */}
            <PremiumCard className="glass-panel p-6 max-w-md mx-auto border-vr-muted/20">
              <div className="flex items-center justify-center space-x-6">
                <Button 
                  onClick={handleAdminAccess} 
                  variant="ghost" 
                  className="glass-button text-vr-muted hover:text-vr-primary hover:bg-vr-primary/10 text-lg py-3 px-6 transition-all duration-300"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  {user ? (isSuperAdmin ? 'Super Admin Dashboard' : isMachineAdmin ? 'Machine Admin Dashboard' : 'Admin Dashboard') : 'Admin Login'}
                </Button>
                
                {/* Enhanced debug info for machine admins */}
                {user && isMachineAdmin && (
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-vr-secondary bg-vr-secondary/20 px-3 py-1 rounded-full">
                      Venues: {userVenues?.length || 0}
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>
          </div>
        ) : (
          /* Enhanced Admin Options for users without specific roles */
          <div className="space-y-8">
            <PremiumCard className="glass-panel p-8 text-center">
              <h3 className="text-3xl font-bold text-vr-text mb-2">
                Select Admin Type
              </h3>
              <p className="text-vr-muted">Choose your administrative access level</p>
            </PremiumCard>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PremiumCard 
                className="glass-panel cursor-pointer transform hover:scale-105 hover:shadow-glow transition-all duration-500 border-vr-primary/30 hover:border-vr-primary/60" 
                onClick={() => navigate('/admin')}
              >
                <div className="p-8 text-center">
                  <div className="relative inline-block mb-6">
                    <Settings className="w-16 h-16 text-vr-primary animate-pulse-glow" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-vr-secondary rounded-full animate-pulse" />
                  </div>
                  <h4 className="text-2xl font-bold text-vr-text mb-3">
                    System Admin
                  </h4>
                  <p className="text-vr-muted leading-relaxed">
                    General system administration and local management capabilities
                  </p>
                </div>
              </PremiumCard>

              <PremiumCard 
                className="glass-panel cursor-pointer transform hover:scale-105 hover:shadow-neon transition-all duration-500 border-vr-secondary/30 hover:border-vr-secondary/60" 
                onClick={() => navigate('/machine-admin')}
              >
                <div className="p-8 text-center">
                  <div className="relative inline-block mb-6">
                    <Users className="w-16 h-16 text-vr-secondary animate-pulse-glow" />
                    <Star className="absolute -top-2 -right-2 w-5 h-5 text-vr-accent animate-float" />
                  </div>
                  <h4 className="text-2xl font-bold text-vr-text mb-3">
                    Machine Admin
                  </h4>
                  <p className="text-vr-muted leading-relaxed">
                    Venue-specific management and advanced cloud analytics
                  </p>
                </div>
              </PremiumCard>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => setShowAdminOptions(false)} 
                variant="ghost" 
                className="glass-button text-vr-muted hover:text-vr-text px-8 py-3 text-lg"
              >
                ← Back to Main
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <PremiumCard className="glass-panel p-4 border-vr-muted/10">
            <p className="text-vr-muted text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-vr-accent" />
              <span>Powered by Next Gen Arcadia Technology</span>
              <Star className="w-3 h-3 text-vr-secondary animate-pulse" />
            </p>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};
export default Index;