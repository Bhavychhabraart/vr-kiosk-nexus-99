
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Settings, Users, Crown, Zap, ArrowRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, isSuperAdmin, isAdmin, isMachineAdmin, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header with user info and logout */}
        {user && (
          <div className="flex justify-between items-center mb-8">
            <div className="text-white">
              <p className="text-sm opacity-75">Welcome back,</p>
              <p className="text-lg font-semibold">{profile?.full_name || profile?.email}</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-vr-primary/20 rounded-full mb-6">
            <Zap className="w-10 h-10 text-vr-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            VR Kiosk
            <span className="text-vr-primary"> Command Center</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Experience the future of gaming with our state-of-the-art VR kiosks. 
            Immerse yourself in virtual worlds like never before.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Games Section - Always visible */}
          <Card className="bg-black/40 border-vr-primary/30 hover:border-vr-primary/60 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Play className="h-6 w-6 text-vr-primary" />
                <CardTitle className="text-white">Play Games</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Browse and play our collection of immersive VR experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/games')}
                className="w-full bg-vr-primary hover:bg-vr-primary/90 text-black"
              >
                Browse Games
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Authentication Card - Show when not logged in */}
          {!user && (
            <Card className="bg-black/40 border-blue-500/30 hover:border-blue-500/60 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-400" />
                  <CardTitle className="text-white">Admin Access</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Sign in to access management and administrative features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Cards - Show based on user roles */}
          {user && isSuperAdmin() && (
            <Card className="bg-black/40 border-purple-500/30 hover:border-purple-500/60 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-white">Super Admin</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Full system administration and business analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/super-admin')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Super Admin Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {user && (isAdmin() || isSuperAdmin()) && (
            <Card className="bg-black/40 border-green-500/30 hover:border-green-500/60 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-green-400" />
                  <CardTitle className="text-white">Venue Admin</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Manage games, settings, and analytics for your venue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/admin')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  Admin Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {user && (isMachineAdmin() || isAdmin() || isSuperAdmin()) && (
            <Card className="bg-black/40 border-orange-500/30 hover:border-orange-500/60 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-orange-400" />
                  <CardTitle className="text-white">Machine Admin</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Machine-specific administration and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/machine-admin')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Machine Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="text-white">
            <div className="w-16 h-16 bg-vr-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-vr-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Immersive Experiences</h3>
            <p className="text-gray-300">
              Step into breathtaking virtual worlds with cutting-edge VR technology
            </p>
          </div>
          
          <div className="text-white">
            <div className="w-16 h-16 bg-vr-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-vr-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
            <p className="text-gray-300">
              Comprehensive admin tools for seamless kiosk operation and monitoring
            </p>
          </div>
          
          <div className="text-white">
            <div className="w-16 h-16 bg-vr-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-vr-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
            <p className="text-gray-300">
              Track performance, revenue, and customer engagement with detailed insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
