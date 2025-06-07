
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isCompleted, onboardingStatus } = useOnboarding();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Auto-redirect when setup is completed
  useEffect(() => {
    if (isCompleted && onboardingStatus?.venue_id) {
      const timer = setTimeout(() => {
        navigate('/machine-admin');
      }, 4000); // Give user time to see completion message
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onboardingStatus, navigate]);

  if (loading) {
    return (
      <MainLayout backgroundVariant="grid" withPattern intensity="low">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            </div>
            <p className="text-lg text-gray-600">Loading your arcade setup...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout backgroundVariant="grid" withPattern intensity="low">
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Setting Up Your VR Arcade
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            We're automatically configuring everything you need to start serving customers
          </p>
        </div>

        <OnboardingProgress />

        {isCompleted && (
          <div className="mt-8 text-center space-y-4">
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Setup Complete!
              </h3>
              <p className="text-green-700 mb-4">
                Your VR arcade is ready to serve customers. Redirecting to your dashboard...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Redirecting in a few seconds</span>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/machine-admin')} 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              Go to Machine Admin Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Onboarding;
