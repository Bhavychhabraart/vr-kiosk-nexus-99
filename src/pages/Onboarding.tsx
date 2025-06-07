
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onboardingStatus, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout backgroundVariant="grid" withPattern intensity="low">
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent mb-4">
            Setting Up Your VR Arcade
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            We're automatically configuring everything you need to start serving customers
          </p>
        </div>

        <OnboardingProgress />

        {isCompleted && (
          <div className="mt-8 text-center">
            <p className="text-green-600 font-medium mb-4">
              🎉 Setup Complete! Redirecting to your admin dashboard...
            </p>
            <Button onClick={() => navigate('/machine-admin')} className="flex items-center gap-2">
              Go to Admin Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Onboarding;
