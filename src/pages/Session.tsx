import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  GamepadIcon,
  Star
} from "lucide-react";
import useCommandCenter from "@/hooks/useCommandCenter";
import { RatingInput } from "@/components/ui/rating-input";
import { toast } from "@/components/ui/use-toast";
import { useGames } from "@/hooks/useGames";

const Session = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { games, isLoading: gamesLoading } = useGames();
  
  // Get parameters from URL
  const gameId = searchParams.get("gameId");
  const gameTitle = searchParams.get("title") || "VR Game";
  const sessionDuration = parseInt(searchParams.get("duration") || "300");
  const sessionId = searchParams.get("sessionId");
  const rfidTag = searchParams.get("rfidTag");
  
  // Find the game data from the games list
  const gameData = games?.find(game => game.id === gameId);
  
  const [timeRemaining, setTimeRemaining] = useState(sessionDuration);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [sessionRating, setSessionRating] = useState(0);
  
  // Create payment data from URL parameters
  const paymentData = rfidTag ? {
    method: 'rfid' as const,
    amount: Math.floor(sessionDuration / 60) * 10, // ₹10 per minute
    rfidTag: rfidTag
  } : undefined;
  
  const { 
    launchGame, 
    endSession, 
    pauseSession, 
    resumeSession, 
    serverStatus,
    isLaunching,
    currentSessionId,
    submitRating
  } = useCommandCenter({
    onStatusChange: (status) => {
      setIsGameActive(status.gameRunning || false);
      if (status.timeRemaining !== undefined) {
        setTimeRemaining(status.timeRemaining);
      }
    }
  });

  useEffect(() => {
    // Add debugging to understand what's happening
    console.log('Session component mounted');
    console.log('Game ID from URL:', gameId);
    console.log('Game title from URL:', gameTitle);
    console.log('Session duration from URL:', sessionDuration);
    console.log('RFID tag from URL:', rfidTag);
    console.log('Session ID from URL:', sessionId);
    console.log('Found game data:', gameData);
    console.log('Games loading:', gamesLoading);
    
    // Check if we have the required parameters
    if (!gameId) {
      console.error('No game ID found in URL parameters');
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "No game selected. Redirecting to games page.",
      });
      setTimeout(() => {
        navigate('/games');
      }, 2000);
      return;
    }

    // Wait for games to load and game data to be available
    if (gamesLoading) {
      console.log('Still loading games...');
      return;
    }

    if (!gameData) {
      console.error('Game not found in games list');
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Selected game not found. Redirecting to games page.",
      });
      setTimeout(() => {
        navigate('/games');
      }, 2000);
      return;
    }

    // Auto-launch the game when component mounts and we have game data
    const autoLaunch = async () => {
      try {
        console.log('Auto-launching game:', gameData.id);
        await launchGame(gameData.id, sessionDuration, paymentData);
        console.log('Game launch initiated successfully');
      } catch (error) {
        console.error('Failed to auto-launch game:', error);
        toast({
          variant: "destructive",
          title: "Launch Failed",
          description: "Failed to start the VR session automatically",
        });
      }
    };

    autoLaunch();
  }, [gameId, gameData, gamesLoading, sessionDuration, paymentData, launchGame, navigate]);

  // Update time remaining
  useEffect(() => {
    if (!isGameActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, timeRemaining]);

  const handlePauseResume = async () => {
    try {
      if (serverStatus.isPaused) {
        await resumeSession();
      } else {
        await pauseSession();
      }
    } catch (error) {
      console.error('Failed to pause/resume session:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession(sessionRating > 0 ? sessionRating : undefined);
      if (sessionRating === 0) {
        setShowRating(true);
      } else {
        navigate('/games');
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleRatingSubmit = async () => {
    if (sessionRating > 0 && gameData) {
      try {
        await submitRating(gameData.id, sessionRating);
      } catch (error) {
        console.error('Failed to submit rating:', error);
      }
    }
    navigate('/games');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = sessionDuration > 0 ? 
    ((sessionDuration - timeRemaining) / sessionDuration) * 100 : 0;

  // Show loading state while we check for game data
  if (gamesLoading || !gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/80 border-vr-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {gamesLoading ? "Loading Session..." : "Game Not Found"}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {gamesLoading ? "Preparing your VR experience" : "Redirecting to games page..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showRating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/80 border-vr-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Rate Your Experience</CardTitle>
            <CardDescription className="text-gray-300">
              How was your VR session with {gameData.title}?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <RatingInput
                initialRating={sessionRating}
                onChange={setSessionRating}
                size="lg"
              />
            </div>
            <Button 
              onClick={handleRatingSubmit}
              className="w-full bg-vr-primary hover:bg-vr-primary/90"
              disabled={sessionRating === 0}
            >
              <Star className="mr-2 h-4 w-4" />
              Submit Rating
            </Button>
            <Button 
              onClick={() => navigate('/games')}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              Skip Rating
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Game Info Header */}
        <Card className="bg-black/80 border-vr-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <GamepadIcon className="h-8 w-8 text-vr-primary" />
                <div>
                  <CardTitle className="text-2xl text-white">{gameData.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    VR Gaming Session
                  </CardDescription>
                </div>
              </div>
              <Badge variant={isGameActive ? "default" : "secondary"} className="text-sm">
                {isLaunching ? "Launching..." : isGameActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Session Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-black/80 border-vr-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Clock className="mr-2 h-5 w-5 text-vr-secondary" />
                Time Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-vr-secondary mb-4">
                {formatTime(timeRemaining)}
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-gray-700"
              />
              <p className="text-sm text-gray-400 mt-2">
                {Math.round(progressPercentage)}% completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-vr-primary/30">
            <CardHeader>
              <CardTitle className="text-white">Session Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handlePauseResume}
                disabled={!isGameActive || isLaunching}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                {serverStatus.isPaused ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume Session
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Session
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleEndSession}
                disabled={isLaunching}
                variant="destructive"
                className="w-full"
              >
                <Square className="mr-2 h-4 w-4" />
                End Session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Session Info */}
        {currentSessionId && (
          <Card className="bg-black/80 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Session ID:</span>
                  <span className="ml-2 text-white font-mono">{currentSessionId}</span>
                </div>
                <div>
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="ml-2 text-white">{paymentData?.method?.toUpperCase() || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Amount Paid:</span>
                  <span className="ml-2 text-white">₹{paymentData?.amount || 0}</span>
                </div>
                <div>
                  <span className="text-gray-400">Duration:</span>
                  <span className="ml-2 text-white">{Math.floor(sessionDuration / 60)} minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Session;
