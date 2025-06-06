
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { useMachineSetup } from "@/hooks/useMachineSetup";

const SetupWizardPage = () => {
  const navigate = useNavigate();
  const { setupStatus, setupToken } = useMachineSetup();

  useEffect(() => {
    // If setup is completed, redirect to appropriate page
    if (setupStatus?.current_status === 'completed') {
      navigate('/games');
      return;
    }

    // If no setup token exists, this might be an invalid access
    // In a real scenario, you might want to redirect to a different page
    // or show an error message
  }, [setupStatus, setupToken, navigate]);

  return <SetupWizard />;
};

export default SetupWizardPage;
