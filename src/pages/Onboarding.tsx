
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingProgress } from "@/components/ui/onboarding-progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onboardingStatus, isLoading, triggerAutoSetup } = useOnboarding();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // If no onboarding status exists after loading is complete, trigger auto-setup
    if (!isLoading && !onboardingStatus) {
      console.log('No onboarding status found after loading, triggering auto-setup');
      triggerAutoSetup();
    }

    // Redirect to admin when onboarding is completed
    if (onboardingStatus?.status === 'completed') {
      toast({
        title: "Welcome to your VR Arcade!",
        description: "Your machine is ready and all games are installed. Start serving customers now!",
      });
      
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    }

    // Handle failed onboarding
    if (onboardingStatus?.status === 'failed') {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: onboardingStatus.error_message || "There was an error setting up your VR machine. Please contact support.",
      });
    }
  }, [user, onboardingStatus, isLoading, navigate, triggerAutoSetup]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vr-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Checking your setup status...</div>
        </div>
      </div>
    );
  }

  // Show message for users being redirected (existing setups)
  if (!onboardingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vr-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Preparing your dashboard...</div>
          <div className="text-gray-300 text-sm mt-2">Detecting existing setup...</div>
        </div>
      </div>
    );
  }

  return <OnboardingProgress status={onboardingStatus} />;
};

export default Onboarding;
