
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  Clock,
  Pause,
  Play,
  X,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock session duration in seconds (5 minutes for demo)
const MOCK_SESSION_DURATION = 300;

const Session = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const gameId = searchParams.get("gameId");
  const gameTitle = searchParams.get("title") || "VR Game";
  
  const [timeRemaining, setTimeRemaining] = useState(MOCK_SESSION_DURATION);
  const [isRunning, setIsRunning] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = (timeRemaining / MOCK_SESSION_DURATION) * 100;
  
  // Timer effect
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowEndDialog(true);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining]);
  
  // Warn user when 1 minute remains
  useEffect(() => {
    if (timeRemaining === 60) {
      toast({
        title: "1 minute remaining",
        description: "Your session will end soon.",
        variant: "default",
      });
    }
  }, [timeRemaining, toast]);
  
  const handlePauseResume = () => {
    setIsRunning(!isRunning);
    
    toast({
      title: isRunning ? "Session paused" : "Session resumed",
      description: isRunning ? "Timer has been paused." : "Timer has been resumed.",
    });
  };
  
  const handleEndSession = () => {
    setShowEndDialog(false);
    
    // In a real implementation, this would send a command to the C++ server
    toast({
      title: "Session ended",
      description: "Thank you for playing!",
    });
    
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };
  
  const handleExitPrompt = () => {
    setShowExitDialog(true);
  };
  
  const handleExit = () => {
    setShowExitDialog(false);
    
    // In a real implementation, this would send a command to the C++ server
    toast({
      title: "Exiting game",
      description: "Returning to home screen.",
    });
    
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };
  
  return (
    <MainLayout className="relative px-4 py-8 h-screen flex flex-col">
      <div className="absolute top-8 left-8">
        <Button 
          variant="ghost" 
          className="text-vr-muted hover:text-vr-text"
          onClick={handleExitPrompt}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Exit Game
        </Button>
      </div>
      
      {/* Session information */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="vr-card max-w-lg w-full">
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">{gameTitle}</h1>
            <p className="text-vr-muted mb-6">Session in progress</p>
            
            {/* Timer display */}
            <div className="w-full mb-4">
              <div className={`text-5xl font-bold mb-3 ${timeRemaining < 60 ? 'text-vr-accent animate-pulse' : 'text-vr-text'}`}>
                {formatTime(timeRemaining)}
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                className={isRunning ? "bg-vr-accent hover:bg-vr-accent/80" : "bg-vr-primary hover:bg-vr-primary/80"}
                onClick={handlePauseResume}
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="border-vr-primary/50 text-vr-text hover:bg-vr-primary/20"
                onClick={handleExitPrompt}
              >
                <X className="mr-2 h-4 w-4" />
                End Session
              </Button>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-vr-muted">
              <Clock className="h-5 w-5" />
              <span>Please wear your VR headset to continue playing</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 border border-vr-primary/10 rounded-lg bg-vr-dark/50 gap-2">
              <p className="text-sm text-vr-muted">
                For help or assistance, please ask a staff member
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Session end dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent className="bg-vr-dark border-vr-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Session Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Your session time has ended. Thank you for playing!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={handleEndSession}
              className="bg-vr-primary hover:bg-vr-primary/80"
            >
              Return to Home
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-vr-dark border-vr-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-vr-accent" />
              End Current Session?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your session? Any remaining time will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-vr-primary/30 hover:bg-vr-dark/60 hover:text-vr-text"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExit}
              className="bg-vr-accent hover:bg-vr-accent/80"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Session;
