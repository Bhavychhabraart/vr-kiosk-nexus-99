import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  Loader2,
  Monitor
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import CommandCenterStatus from "@/components/CommandCenterStatus";
import useCommandCenter from "@/hooks/useCommandCenter";
import { RatingInput } from "@/components/ui/rating-input";

const Session = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const gameId = searchParams.get("gameId");
  const gameTitle = searchParams.get("title") || "VR Game";
  const durationParam = searchParams.get("duration");
  const selectedDuration = durationParam ? parseInt(durationParam) : 1800; // Default 30 minutes
  
  const [timeRemaining, setTimeRemaining] = useState(selectedDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLaunching, setIsLaunching] = useState(true);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [launchAttempted, setLaunchAttempted] = useState(false);
  
  // Add ref to store timeout ID
  const launchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Connect to command center
  const { 
    connectionState, 
    serverStatus, 
    launchGame,
    endSession, 
    pauseSession, 
    resumeSession,
    submitRating,
    isConnected
  } = useCommandCenter({
    onStatusChange: (status) => {
      console.log('Status update received:', status);
      
      // Always sync time remaining and pause state from server
      if (status.timeRemaining !== undefined) {
        setTimeRemaining(status.timeRemaining);
        setIsRunning(!status.isPaused);
      }
      
      // Check if game session is active (simplified logic)
      if (status.gameRunning && !gameStarted) {
        console.log('Game session detected as active');
        setGameStarted(true);
        setIsRunning(!status.isPaused);
        setIsLaunching(false);
        
        // Clear the launch timeout since game started successfully
        if (launchTimeoutRef.current) {
          clearTimeout(launchTimeoutRef.current);
          launchTimeoutRef.current = null;
        }
        
        // Check for demo mode
        if (status.demoMode) {
          setDemoMode(true);
          toast({
            title: "Demo Mode Active",
            description: `${gameTitle} session started in demo mode. VR runtime not available.`,
            variant: "default",
          });
        } else {
          setDemoMode(false);
          toast({
            title: "Game Session Started",
            description: `${gameTitle} session is now active. ${status.processRunning ? 'Game is running.' : 'Game process has exited but session continues.'}`,
          });
        }
      }
      
      // Handle process state changes for already started games
      if (status.gameRunning && gameStarted) {
        // Update demo mode status
        if (status.demoMode !== demoMode) {
          setDemoMode(status.demoMode || false);
        }
        
        // Notify if game process exits during session
        if (!status.processRunning && !demoMode && status.processRunning !== undefined) {
          toast({
            title: "Game Process Exited",
            description: "Game closed but session timer continues. You can end the session or the game may restart automatically.",
            variant: "default",
          });
        }
      }
      
      // Check for session end
      if (!status.gameRunning && gameStarted) {
        console.log('Game session ended by server');
        setGameStarted(false);
        setIsRunning(false);
        setShowRating(true);
      }
      
      // Check for VR runtime alerts
      if (status.alerts && status.alerts.length > 0) {
        const vrAlerts = status.alerts.filter(
          alert => alert.message.includes('VR runtime') || alert.message.includes('SteamVR')
        );
        
        if (vrAlerts.length > 0 && !demoMode) {
          console.log('VR runtime alert detected');
        }
      }
      
      // Check for critical system alerts
      if (status.alerts && status.alerts.length > 0) {
        const criticalAlerts = status.alerts.filter(
          alert => alert.type === 'critical' && 
          new Date(alert.timestamp).getTime() > Date.now() - (30 * 1000)
        );
        
        if (criticalAlerts.length > 0) {
          toast({
            title: "System Alert",
            description: criticalAlerts[0].message,
            variant: "destructive",
          });
        }
      }
    }
  });
  
  // Auto-launch game when component mounts
  useEffect(() => {
    if (!gameId) {
      toast({
        title: "Invalid Session",
        description: "No game selected. Please select a game first.",
        variant: "destructive",
      });
      navigate("/games");
      return;
    }

    if (!isConnected) {
      setLaunchError("VR system is not connected. Please contact staff.");
      setIsLaunching(false);
      return;
    }

    // Only launch once
    if (launchAttempted) {
      return;
    }

    // Launch the game automatically
    const performLaunch = async () => {
      try {
        setLaunchAttempted(true);
        console.log(`Launching game ${gameId} with duration ${selectedDuration} seconds`);
        await launchGame(gameId, selectedDuration);
        
        // Set a timeout to detect if launch failed - store the timeout reference
        launchTimeoutRef.current = setTimeout(() => {
          // Only show error if we're still launching and no game has started
          if (isLaunching && !gameStarted) {
            console.log('Launch timeout triggered - no successful game start detected');
            setLaunchError("Game launch timeout. The VR system may not be properly configured.");
            setIsLaunching(false);
          }
        }, 15000); // 15 second timeout
        
      } catch (error) {
        console.error("Failed to launch game:", error);
        setLaunchError("Failed to start the game. Please try again.");
        setIsLaunching(false);
        toast({
          title: "Launch Failed",
          description: "Could not start the game. Please contact staff.",
          variant: "destructive",
        });
      }
    };

    if (isConnected && !launchAttempted) {
      performLaunch();
    }

    // Cleanup function to clear timeout when component unmounts
    return () => {
      if (launchTimeoutRef.current) {
        clearTimeout(launchTimeoutRef.current);
        launchTimeoutRef.current = null;
      }
    };
  }, [gameId, selectedDuration, isConnected, launchGame, navigate, toast, launchAttempted, isLaunching, gameStarted]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = (timeRemaining / selectedDuration) * 100;
  
  // Timer effect - only run when game is started and running
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0 || !gameStarted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          setShowRating(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, gameStarted]);
  
  // Warn user when 1 minute remains
  useEffect(() => {
    if (timeRemaining === 60 && gameStarted) {
      toast({
        title: "1 minute remaining",
        description: "Your session will end soon.",
        variant: "default",
      });
    }
  }, [timeRemaining, toast, gameStarted]);
  
  const handlePauseResume = async () => {
    try {
      if (isRunning) {
        await pauseSession();
        setIsRunning(false);
        toast({
          title: "Session paused",
          description: "Timer has been paused.",
        });
      } else {
        await resumeSession();
        setIsRunning(true);
        toast({
          title: "Session resumed",
          description: "Timer has been resumed.",
        });
      }
    } catch (error) {
      console.error("Error toggling pause/resume:", error);
      toast({
        title: "Action failed",
        description: "Failed to pause/resume session. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleEndSession = async () => {
    setShowEndDialog(false);
    
    try {
      await endSession();
      setShowRating(true);
    } catch (error) {
      console.error("Error ending session:", error);
      toast({
        title: "Error ending session",
        description: "Please try again or contact staff.",
        variant: "destructive",
      });
    }
  };
  
  const handleExitPrompt = () => {
    setShowExitDialog(true);
  };
  
  const handleExit = async () => {
    setShowExitDialog(false);
    
    try {
      await endSession();
      
      toast({
        title: "Exiting game",
        description: "Returning to home screen.",
      });
      
      setShowRating(true);
    } catch (error) {
      console.error("Error exiting session:", error);
      toast({
        title: "Error exiting",
        description: "Please try again or contact staff.",
        variant: "destructive",
      });
    }
  };

  const handleRatingSubmit = async () => {
    if (!gameId || rating === 0) return;
    
    setSubmittingRating(true);
    
    try {
      await submitRating(gameId, rating);
      
      toast({
        title: "Thanks for your feedback!",
        description: "Your rating has been recorded.",
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Rating submission failed",
        description: "Could not save your rating. Please try again.",
        variant: "destructive",
      });
      setSubmittingRating(false);
    }
  };
  
  const handleRetryLaunch = () => {
    setLaunchError(null);
    setIsLaunching(true);
    // Trigger re-launch by navigating back and forth
    window.location.reload();
  };
  
  // If showing rating screen
  if (showRating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center relative bg-vr-dark"
      >
        <ParticlesBackground />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="vr-card max-w-md w-full z-10 p-8"
        >
          <h2 className="text-2xl font-bold mb-2 text-center">How was your experience?</h2>
          <p className="text-vr-muted text-center mb-8">Rate your session playing {gameTitle}</p>
          
          <div className="flex justify-center mb-8">
            <RatingInput 
              size="lg" 
              onChange={setRating} 
              initialRating={rating}
            />
          </div>
          
          <Button 
            onClick={handleRatingSubmit}
            className="w-full py-6 bg-vr-secondary text-vr-dark hover:bg-vr-secondary/90"
            disabled={rating === 0 || submittingRating}
          >
            {submittingRating ? "Submitting..." : "Submit Rating"}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // If launch failed, show error screen
  if (launchError) {
    return (
      <MainLayout className="relative px-4 py-8 h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-8 left-8"
        >
          <Button 
            variant="ghost" 
            className="text-vr-muted hover:text-vr-text flex items-center gap-2"
            onClick={() => navigate("/games")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
        </motion.div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="vr-card max-w-lg w-full backdrop-blur-md text-center"
          >
            <AlertCircle className="h-16 w-16 text-vr-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Launch Failed</h2>
            <p className="text-vr-muted mb-8">{launchError}</p>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleRetryLaunch}
                className="bg-vr-primary hover:bg-vr-primary/80"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/games")}
                className="border-vr-primary/50"
              >
                Back to Games
              </Button>
            </div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  // If launching, show loading screen
  if (isLaunching) {
    return (
      <MainLayout className="relative px-4 py-8 h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-8 left-8 flex items-center gap-4"
        >
          <Button 
            variant="ghost" 
            className="text-vr-muted hover:text-vr-text flex items-center gap-2"
            onClick={() => navigate("/games")}
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel Launch
          </Button>
          <CommandCenterStatus showLabel={true} />
        </motion.div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="vr-card max-w-lg w-full backdrop-blur-md text-center"
          >
            <Loader2 className="h-16 w-16 text-vr-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-4">Launching {gameTitle}</h2>
            <p className="text-vr-muted mb-8">
              Initializing VR environment and starting game session...
            </p>
            <div className="text-sm text-vr-muted">
              Duration: {Math.floor(selectedDuration / 60)} minutes
            </div>
            <div className="text-xs text-vr-muted/70 mt-4">
              If VR runtime is not available, session will continue in demo mode
            </div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout className="relative px-4 py-8 h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-8 left-8 flex items-center gap-4"
      >
        <Button 
          variant="ghost" 
          className="text-vr-muted hover:text-vr-text flex items-center gap-2"
          onClick={handleExitPrompt}
        >
          <ArrowLeft className="h-4 w-4" />
          Exit Game
        </Button>
        <CommandCenterStatus showLabel={true} />
      </motion.div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="vr-card max-w-lg w-full backdrop-blur-md"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{gameTitle}</h1>
              {demoMode && (
                <div className="flex items-center gap-1 px-2 py-1 bg-vr-accent/20 rounded-full">
                  <Monitor className="h-4 w-4 text-vr-accent" />
                  <span className="text-xs text-vr-accent font-medium">DEMO</span>
                </div>
              )}
            </div>
            <p className="text-vr-muted mb-6">
              {demoMode ? "Demo session in progress" : "Session in progress"}
            </p>
            
            <div className="w-full mb-6">
              <motion.div 
                className={`text-6xl font-bold mb-4 ${
                  timeRemaining < 60 ? 'text-vr-accent animate-pulse' : 'text-vr-text'
                }`}
                animate={{ scale: [1, 1.03, 1], opacity: [1, 1, 1] }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  repeatType: "reverse"
                }}
              >
                {formatTime(timeRemaining)}
              </motion.div>
              
              <div className="relative h-4 w-full bg-vr-dark/50 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-vr-secondary to-vr-primary rounded-full"
                  initial={{ width: `${progress}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", damping: 20 }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                className={`px-6 py-6 flex items-center gap-2 ${
                  isRunning 
                    ? "bg-vr-accent hover:bg-vr-accent/80" 
                    : "bg-vr-primary hover:bg-vr-primary/80"
                }`}
                onClick={handlePauseResume}
                disabled={!isConnected || !gameStarted}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5" />
                    <span className="text-lg">Pause Session</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span className="text-lg">Resume Session</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="border-vr-primary/50 text-vr-text hover:bg-vr-primary/20 px-6 py-6"
                onClick={handleExitPrompt}
                disabled={!isConnected}
              >
                <X className="h-5 w-5 mr-2" />
                <span className="text-lg">End Session</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-vr-muted">
              <Clock className="h-5 w-5" />
              <span>
                {demoMode 
                  ? "Demo mode - VR headset not required" 
                  : "Please wear your VR headset to continue playing"
                }
              </span>
            </div>
            {demoMode && (
              <div className="text-xs text-vr-muted/70 bg-vr-accent/10 p-3 rounded-lg">
                Running in demo mode because VR runtime is not available. 
                Session timer and controls work normally for testing purposes.
              </div>
            )}
          </div>
        </motion.div>
      </div>

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

// Particle background component
const ParticlesBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="particle"
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            background: `rgba(0, 234, 255, ${Math.random() * 0.5 + 0.1})`,
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(0, 234, 255, 0.5)',
            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-radial from-vr-primary/5 to-transparent" />
    </div>
  );
};

export default Session;
