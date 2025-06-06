
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  Wifi,
  Server,
  User,
  Settings,
  PlayCircle
} from "lucide-react";
import { useMachineSetup } from "@/hooks/useMachineSetup";
import type { SetupStatus, ValidateTokenResponse } from "@/types/setup";

// Import step components
import { WelcomeStep } from "./steps/WelcomeStep";
import { NetworkStep } from "./steps/NetworkStep";
import { RegistrationStep } from "./steps/RegistrationStep";
import { OwnerSetupStep } from "./steps/OwnerSetupStep";
import { SystemConfigStep } from "./steps/SystemConfigStep";
import { CompletionStep } from "./steps/CompletionStep";

const setupSteps = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Machine introduction and serial verification',
    icon: PlayCircle,
    status: 'not_started' as SetupStatus,
    component: WelcomeStep,
  },
  {
    id: 'network',
    title: 'Network Setup',
    description: 'Configure internet connectivity',
    icon: Wifi,
    status: 'network_configured' as SetupStatus,
    component: NetworkStep,
  },
  {
    id: 'registration',
    title: 'Machine Registration',
    description: 'Register with central server',
    icon: Server,
    status: 'machine_registered' as SetupStatus,
    component: RegistrationStep,
  },
  {
    id: 'owner',
    title: 'Owner Setup',
    description: 'Business and contact information',
    icon: User,
    status: 'owner_setup' as SetupStatus,
    component: OwnerSetupStep,
  },
  {
    id: 'system',
    title: 'System Configuration',
    description: 'Games, payments, and final settings',
    icon: Settings,
    status: 'system_configured' as SetupStatus,
    component: SystemConfigStep,
  },
  {
    id: 'complete',
    title: 'Setup Complete',
    description: 'Finalize and go live',
    icon: CheckCircle,
    status: 'completed' as SetupStatus,
    component: CompletionStep,
  },
];

export const SetupWizard = () => {
  const { setupStatus, isLoading } = useMachineSetup();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (setupStatus?.current_status) {
      const stepIndex = setupSteps.findIndex(step => step.status === setupStatus.current_status);
      if (stepIndex >= 0) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [setupStatus]);

  const currentStep = setupSteps[currentStepIndex];
  const CurrentStepComponent = currentStep.component;
  const progress = ((currentStepIndex + 1) / setupSteps.length) * 100;

  const goToNextStep = () => {
    if (currentStepIndex < setupSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const isStepCompleted = (stepIndex: number) => {
    if (!setupStatus?.current_status) return false;
    
    const stepStatus = setupSteps[stepIndex].status;
    const currentStatusIndex = setupSteps.findIndex(s => s.status === setupStatus.current_status);
    
    return stepIndex < currentStatusIndex || 
           (stepIndex === currentStatusIndex && setupStatus.current_status === 'completed');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/80 border-vr-primary/30">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary mx-auto mb-4"></div>
            <p className="text-white">Initializing setup wizard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            VR Kiosk Setup Wizard
          </h1>
          <p className="text-gray-300 text-lg">
            Let's get your new VR kiosk ready for operation
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 bg-black/60 border-gray-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Setup Progress</span>
              <Badge variant="secondary">{Math.round(progress)}% Complete</Badge>
            </div>
            <Progress value={progress} className="mb-4" />
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {setupSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = isStepCompleted(index);
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
                      ${isCompleted ? 'bg-green-500 text-white' : 
                        isCurrent ? 'bg-vr-primary text-black' : 
                        'bg-gray-600 text-gray-300'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs text-center max-w-16 ${
                      isCurrent ? 'text-vr-primary' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-black/80 border-vr-primary/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <currentStep.icon className="h-6 w-6 text-vr-primary" />
                  {currentStep.title}
                </CardTitle>
                <p className="text-gray-300">{currentStep.description}</p>
              </CardHeader>
              <CardContent>
                <CurrentStepComponent 
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                  setupStatus={setupStatus}
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
