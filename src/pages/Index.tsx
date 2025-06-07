
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { VrIcon, PremiumVrIcon } from "@/components/icons/VrIcon";
import { Play, Users, Settings, Crown, Wrench, UserPlus, ArrowRight } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { isSuperAdmin, isMachineAdmin } = useUserRoles();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <MainLayout backgroundVariant="orbs" withPattern intensity="medium">
      <div className={`space-y-20 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Hero Section */}
        <section className="text-center space-y-8 py-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-vr-primary via-vr-secondary to-vr-accent bg-clip-text text-transparent leading-tight">
              Ultimate VR Experience
            </h1>
            <p className="text-xl md:text-2xl text-vr-muted max-w-3xl mx-auto leading-relaxed">
              Step into immersive worlds with our cutting-edge VR kiosk management system. 
              Experience the future of entertainment today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/games">
              <Button size="lg" className="bg-gradient-to-r from-vr-primary to-vr-secondary hover:from-vr-primary/80 hover:to-vr-secondary/80 text-white px-8 py-6 text-lg h-auto">
                <Play className="w-5 h-5 mr-2" />
                Explore Games
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            {user && isSuperAdmin && (
              <Link to="/user-setup">
                <Button size="lg" variant="outline" className="border-vr-primary/30 text-vr-primary hover:bg-vr-primary/10 px-8 py-6 text-lg h-auto">
                  <UserPlus className="w-5 h-5 mr-2" />
                  User Setup
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8">
          <Card className="bg-vr-dark/50 border-vr-primary/20 backdrop-blur-sm hover:border-vr-primary/40 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-vr-primary/10 w-fit group-hover:bg-vr-primary/20 transition-colors">
                <VrIcon className="w-8 h-8 text-vr-primary" />
              </div>
              <CardTitle className="text-vr-light">Immersive Games</CardTitle>
              <CardDescription className="text-vr-muted">
                Discover a vast library of VR games and experiences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-vr-dark/50 border-vr-secondary/20 backdrop-blur-sm hover:border-vr-secondary/40 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-vr-secondary/10 w-fit group-hover:bg-vr-secondary/20 transition-colors">
                <Settings className="w-8 h-8 text-vr-secondary" />
              </div>
              <CardTitle className="text-vr-light">Smart Management</CardTitle>
              <CardDescription className="text-vr-muted">
                Intelligent kiosk management with real-time analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-vr-dark/50 border-vr-accent/20 backdrop-blur-sm hover:border-vr-accent/40 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-vr-accent/10 w-fit group-hover:bg-vr-accent/20 transition-colors">
                <PremiumVrIcon className="w-8 h-8 text-vr-accent" />
              </div>
              <CardTitle className="text-vr-light">Premium Experience</CardTitle>
              <CardDescription className="text-vr-muted">
                High-quality VR hardware and seamless user experience
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* User Dashboard Section */}
        {user && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-vr-light mb-4">
                Welcome back, {user.email?.split('@')[0]}!
              </h2>
              <div className="flex items-center justify-center gap-2 text-vr-muted">
                <Users className="w-5 h-5" />
                <span>Role: </span>
                {isSuperAdmin && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Crown className="w-4 h-4" />
                    Super Admin
                  </span>
                )}
                {isMachineAdmin && !isSuperAdmin && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <Wrench className="w-4 h-4" />
                    Machine Admin
                  </span>
                )}
                {!isSuperAdmin && !isMachineAdmin && (
                  <span className="text-vr-muted">User</span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/games">
                <Card className="bg-vr-dark/50 border-vr-primary/20 backdrop-blur-sm hover:border-vr-primary/40 transition-all duration-300 cursor-pointer group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vr-light group-hover:text-vr-primary transition-colors">
                      <Play className="w-5 h-5" />
                      Browse Games
                    </CardTitle>
                    <CardDescription className="text-vr-muted">
                      Explore our VR game library
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {isMachineAdmin && (
                <Link to="/machine-admin">
                  <Card className="bg-vr-dark/50 border-blue-400/20 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-300 cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-vr-light group-hover:text-blue-400 transition-colors">
                        <Wrench className="w-5 h-5" />
                        Machine Admin
                      </CardTitle>
                      <CardDescription className="text-vr-muted">
                        Manage your VR machines
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )}

              {isSuperAdmin && (
                <>
                  <Link to="/super-admin">
                    <Card className="bg-vr-dark/50 border-yellow-400/20 backdrop-blur-sm hover:border-yellow-400/40 transition-all duration-300 cursor-pointer group">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-vr-light group-hover:text-yellow-400 transition-colors">
                          <Crown className="w-5 h-5" />
                          Super Admin
                        </CardTitle>
                        <CardDescription className="text-vr-muted">
                          System-wide administration
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/user-setup">
                    <Card className="bg-vr-dark/50 border-vr-secondary/20 backdrop-blur-sm hover:border-vr-secondary/40 transition-all duration-300 cursor-pointer group">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-vr-light group-hover:text-vr-secondary transition-colors">
                          <UserPlus className="w-5 h-5" />
                          User Setup
                        </CardTitle>
                        <CardDescription className="text-vr-muted">
                          Assign venues to users
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </>
              )}

              <Link to="/admin">
                <Card className="bg-vr-dark/50 border-vr-accent/20 backdrop-blur-sm hover:border-vr-accent/40 transition-all duration-300 cursor-pointer group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vr-light group-hover:text-vr-accent transition-colors">
                      <Settings className="w-5 h-5" />
                      Admin Panel
                    </CardTitle>
                    <CardDescription className="text-vr-muted">
                      General administration
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </section>
        )}

        {/* Call to Action */}
        {!user && (
          <section className="text-center space-y-6 py-12 bg-gradient-to-r from-vr-primary/10 to-vr-secondary/10 rounded-2xl border border-vr-primary/20">
            <h2 className="text-3xl font-bold text-vr-light">Ready to Start?</h2>
            <p className="text-vr-muted max-w-2xl mx-auto">
              Join thousands of users experiencing the future of VR entertainment. 
              Sign up today and get access to our complete VR ecosystem.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-vr-primary to-vr-secondary hover:from-vr-primary/80 hover:to-vr-secondary/80 text-white px-8 py-6 text-lg h-auto">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
