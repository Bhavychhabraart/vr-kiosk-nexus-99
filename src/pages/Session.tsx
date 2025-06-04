
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameLaunchStatus } from "@/components/ui/game-launch-status";
import {
  Play,
  Pause,
  Square,
  Clock,
  Star,
  Settings,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useCommandCenter from "@/hooks/useCommandCenter";

const Session = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const gameId = searchParams.get("gameId");
  const gameTitle = searchParams.get("title") || "VR Game";
  const duration = parseInt(searchParams.get("duration") || "1800");
  const rfidTag = searchParams.get("rfidTag");
  
  const [sessionStarted, setSessionStarted] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  
  const {
    serverStatus,
    isConnected,
    isLaunching,
    launchGame,
    endSession,
    pauseSession,
    resumeSession
  } = useCommandCenter({
    onStatusChange: (status) => {
      console.log('Session status update:', status);
    }
  });

  useEffect(() => {
    if (!gameId) {
      toast({
        title: "Invalid Session",
        description: "No game selected. Redirecting to games list.",
        variant: "destructive",
      });
      navigate("/games");
      return;
    }

    // Auto-start the game session when component mounts
    if (!sessionStarted && isConnected && !isLaunching && !serverStatus.gameRunning) {
      handleStartSession();
    }
  }, [gameId, isConnected, sessionStarted, isLaunching, serverStatus.gameRunning]);

  const handleStartSession = async () => {
    if (!gameId) return;
    
    try {
      setLaunchError(null);
      await launchGame(gameId, duration);
      setSessionStarted(true);
    } catch (error) {
      console.error('Failed to start session:', error);
      setLaunchError(error instanceof Error ? error.message : 'Failed to start session');
    }
  };

  const handlePauseResume = async () => {
    try {
      if (serverStatus.isPaused) {
        await resumeSession();
      } else {
        await pauseSession();
      }
    } catch (error) {
      console.error('Failed to toggle pause:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession();
      navigate("/games");
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionStatus = () => {
    if (launchError) return "error";
    if (isLaunching) return "launching";
    if (serverStatus.gameRunning) return "running";
    if (serverStatus.isPaused) return "paused";
    return "preparing";
  };

  const sessionStatus = getSessionStatus();

  return (
    <MainLayout className="relative">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Session Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-2">VR Session</h1>
          <p className="text-vr-muted">
            {gameTitle} • {Math.floor(duration / 60)} minutes
          </p>
        </motion.div>

        {/* Session Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="vr-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Session Status</span>
                <Badge variant={
                  sessionStatus === "running" ? "default" :
                  sessionStatus === "launching" ? "secondary" :
                  sessionStatus === "error" ? "destructive" :
                  "outline"
                }>
                  {sessionStatus === "running" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {sessionStatus === "launching" && <Play className="h-3 w-3 mr-1" />}
                  {sessionStatus === "error" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {sessionStatus.charAt(0).toUpperCase() + sessionStatus.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-3 bg-vr-dark/30 rounded-lg">
                <span className="text-sm">VR System Connection</span>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>

              {/* Game Status */}
              <div className="flex items-center justify-between p-3 bg-vr-dark/30 rounded-lg">
                <span className="text-sm">Game Status</span>
                <span className="text-sm font-medium">
                  {serverStatus.gameRunning ? "Running" : 
                   isLaunching ? "Starting..." : 
                   "Not Running"}
                </span>
              </div>

              {/* Timer */}
              {(serverStatus.gameRunning || serverStatus.isPaused) && (
                <div className="flex items-center justify-center p-6 bg-vr-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-vr-primary mr-2" />
                  <span className="text-2xl font-mono font-bold">
                    {formatTime(serverStatus.timeRemaining || 0)}
                  </span>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-3 justify-center">
                {serverStatus.gameRunning && (
                  <Button
                    onClick={handlePauseResume}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {serverStatus.isPaused ? (
                      <>
                        <Play className="h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  onClick={handleEndSession}
                  variant="destructive"
                  className="flex items-center gap-2"
                  disabled={isLaunching}
                >
                  <Square className="h-4 w-4" />
                  End Session
                </Button>
              </div>

              {/* Error Message */}
              {launchError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Launch Error</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{launchError}</p>
                  <Button
                    onClick={handleStartSession}
                    size="sm"
                    className="mt-3"
                    disabled={isLaunching}
                  >
                    Retry Launch
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className="vr-card">
            <CardHeader>
              <CardTitle className="text-lg">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-vr-muted">Game</span>
                <span className="font-medium">{gameTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-vr-muted">Duration</span>
                <span className="font-medium">{Math.floor(duration / 60)} minutes</span>
              </div>
              {rfidTag && (
                <div className="flex justify-between">
                  <span className="text-vr-muted">RFID Card</span>
                  <span className="font-medium font-mono text-xs">
                    {rfidTag.substring(0, 12)}...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="vr-card">
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-vr-muted">CPU Usage</span>
                <span className="font-medium">{serverStatus.cpuUsage || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-vr-muted">Memory Usage</span>
                <span className="font-medium">{serverStatus.memoryUsage || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-vr-muted">Active Game</span>
                <span className="font-medium">
                  {serverStatus.activeGame || "None"}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Launch Status Overlay */}
      <GameLaunchStatus
        isLaunching={isLaunching}
        gameRunning={serverStatus.gameRunning}
        gameTitle={gameTitle}
        error={launchError || undefined}
      />
    </MainLayout>
  );
};

export default Session;
