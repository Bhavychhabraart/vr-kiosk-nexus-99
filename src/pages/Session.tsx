
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
  ArrowLeft,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { CommandCenterStatus } from "@/components/CommandCenterStatus";
import useCommandCenter from "@/hooks/useCommandCenter";

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
  const [gameStarted, setGameStarted] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  
  // Connect to command center
  const { 
    connectionState, 
    serverStatus, 
    launchGame, 
    endSession, 
    pauseSession, 
    resumeSession,
    isConnected
  } = useCommandCenter({
    onStatusChange: (status) => {
      // Update UI based on server status
      if (status.gameRunning && !gameStarted) {
        setGameStarted(true);
      }
    }
  });
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = (timeRemaining / MOCK_SESSION_DURATION) * 100;
  
  // Start the game when component mounts
  useEffect(() => {
    if (isConnected && gameId && !gameStarted) {
      launchGame(gameId, MOCK_SESSION_DURATION)
        .then(() => {
          setGameStarted(true);
          toast({
            title: "Game launched",
            description: "Your session has started",
          });
        })
        .catch(error => {
          toast({
            title: "Failed to launch game",
            description: "Please try again or contact staff",
            variant: "destructive",
          });
          console.error("Error launching game:", error);
        });
    }
  }, [isConnected, gameId, gameStarted, launchGame, toast]);
  
  // Timer effect
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;
    
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
      // Send command to end session
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
      // Send command to end session
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

  const handleRatingSubmit = () => {
    toast({
      title: "Thanks for your feedback!",
      description: "Your rating has been recorded.",
    });

    setTimeout(() => {
      navigate("/");
    }, 1000);
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
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-12 w-12 mx-1 cursor-pointer transition-all ${
                  star <= rating 
                    ? "text-vr-secondary fill-vr-secondary" 
                    : "text-gray-400"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          
          <Button 
            onClick={handleRatingSubmit}
            className="w-full py-6 bg-vr-secondary text-vr-dark hover:bg-vr-secondary/90"
            disabled={rating === 0}
          >
            Submit Rating
          </Button>
        </motion.div>
      </motion.div>
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
      
      {/* Session information */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="vr-card max-w-lg w-full backdrop-blur-md"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">{gameTitle}</h1>
            <p className="text-vr-muted mb-6">Session in progress</p>
            
            {/* Timer display */}
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
              <span>Please wear your VR headset to continue playing</span>
            </div>
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
