
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import websocketService, { 
  ConnectionState, 
  CommandType, 
  ServerStatus
} from '@/services/websocket';

interface CommandCenterOptions {
  onStatusChange?: (status: ServerStatus) => void;
  onSystemAlert?: (alert: any) => void;
}

const useCommandCenter = (options: CommandCenterOptions = {}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    websocketService.getConnectionState()
  );
  const [serverStatus, setServerStatus] = useState<ServerStatus>(
    websocketService.getServerStatus()
  );
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    // Connect to the WebSocket server when the component mounts
    websocketService.connect();

    // Subscribe to connection state changes
    const unsubConnectionState = websocketService.onConnectionStateChange(
      (state) => {
        setConnectionState(state);
        console.log('Connection state changed:', state);
      }
    );

    // Subscribe to server status updates
    const unsubServerStatus = websocketService.onStatusUpdate((status) => {
      setServerStatus(status);
      
      // Handle launching state more intelligently
      const wasLaunching = isLaunching;
      const isCurrentlyLaunching = status.gameLaunching || false;
      
      setIsLaunching(isCurrentlyLaunching);
      
      // Clear launching state when game actually starts running
      if (wasLaunching && status.gameRunning && !isCurrentlyLaunching) {
        console.log('Game launch completed successfully');
        toast({
          title: "Game Launched",
          description: "VR game is now running successfully",
        });
      }
      
      options.onStatusChange?.(status);
      
      // Check for system alerts
      if (status.alerts && status.alerts.length > 0) {
        const newAlerts = status.alerts.filter(alert => {
          // Convert timestamp to number if it's a string, then compare
          const alertTime = typeof alert.timestamp === 'string' 
            ? Date.parse(alert.timestamp) 
            : alert.timestamp;
          return alertTime > Date.now() - 60000; // Show only alerts from the last minute
        });
        
        if (newAlerts.length > 0) {
          options.onSystemAlert?.(newAlerts[0]);
        }
      }
    });

    // Cleanup function
    return () => {
      unsubConnectionState();
      unsubServerStatus();
    };
  }, [options, isLaunching]);

  // Check if connected
  const isConnected = connectionState === ConnectionState.CONNECTED;

  // Launch a game with enhanced error handling and progress tracking
  const launchGame = useCallback(async (gameId: string, durationSeconds: number) => {
    try {
      setIsLaunching(true);
      
      console.log(`Launching game ${gameId} for ${durationSeconds} seconds`);
      
      const response = await websocketService.sendCommand(CommandType.LAUNCH_GAME, { 
        gameId, 
        sessionDuration: durationSeconds
      });
      
      // Store session start in database
      try {
        const sessionData = {
          game_id: gameId,
          duration_seconds: durationSeconds,
          status: 'active',
        };
        
        console.log('Starting new session:', sessionData);
      } catch (err) {
        console.error('Error recording session start:', err);
      }
      
      // Don't show success toast immediately - wait for actual game launch
      console.log('Game launch command sent successfully');
      
      return response;
    } catch (error) {
      console.error('Error launching game:', error);
      setIsLaunching(false);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to launch game';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Game launch is taking longer than expected. The VR system may be busy or require attention.';
        } else if (error.message.includes('VR runtime')) {
          errorMessage = 'VR runtime is not available. Please ensure SteamVR or your VR software is running.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Launch Failed",
        description: errorMessage,
      });
      
      throw error;
    }
  }, []);

  // End the current session
  const endSession = useCallback(async () => {
    try {
      const response = await websocketService.sendCommand(CommandType.END_SESSION);
      
      // Log session end in database
      try {
        console.log('Ending session');
      } catch (err) {
        console.error('Error recording session end:', err);
      }
      
      toast({
        title: "Session Ended",
        description: "VR session has been terminated successfully",
      });
      
      return response;
    } catch (error) {
      console.error('Error ending session:', error);
      
      toast({
        variant: "destructive",
        title: "End Session Failed",
        description: "Failed to end the VR session properly",
      });
      
      throw error;
    }
  }, []);

  // Pause the current session
  const pauseSession = useCallback(async () => {
    try {
      const response = await websocketService.sendCommand(CommandType.PAUSE_SESSION);
      
      toast({
        title: "Session Paused",
        description: "VR session has been paused",
      });
      
      return response;
    } catch (error) {
      console.error('Error pausing session:', error);
      
      toast({
        variant: "destructive",
        title: "Pause Failed",
        description: "Failed to pause the VR session",
      });
      
      throw error;
    }
  }, []);

  // Resume the current session
  const resumeSession = useCallback(async () => {
    try {
      const response = await websocketService.sendCommand(CommandType.RESUME_SESSION);
      
      toast({
        title: "Session Resumed",
        description: "VR session has been resumed",
      });
      
      return response;
    } catch (error) {
      console.error('Error resuming session:', error);
      
      toast({
        variant: "destructive",
        title: "Resume Failed",
        description: "Failed to resume the VR session",
      });
      
      throw error;
    }
  }, []);

  // Get the current server status
  const getServerStatus = useCallback(async () => {
    try {
      return await websocketService.sendCommand(CommandType.GET_STATUS);
    } catch (error) {
      console.error('Error getting server status:', error);
      throw error;
    }
  }, []);

  // Submit a game rating
  const submitRating = useCallback(async (gameId: string, rating: number) => {
    try {
      // Send rating to the server
      await websocketService.sendCommand(CommandType.SUBMIT_RATING, { 
        gameId, 
        rating
      });
      
      // Also store it in our database
      try {
        const ratingData = {
          game_id: gameId,
          rating: rating,
          end_time: new Date().toISOString(),
          status: 'completed'
        };
        
        console.log('Submitting rating:', ratingData);
      } catch (err) {
        console.error('Error recording rating:', err);
      }
      
      toast({
        title: "Rating Submitted",
        description: `Thank you for rating this game ${rating}/5 stars!`,
      });
      
      return true;
    } catch (error) {
      console.error('Error submitting rating:', error);
      
      toast({
        variant: "destructive",
        title: "Rating Failed",
        description: "Failed to submit your rating",
      });
      
      throw error;
    }
  }, []);

  // Get system metrics and diagnostics
  const getSystemDiagnostics = useCallback(async () => {
    try {
      const response = await websocketService.sendCommand(CommandType.GET_DIAGNOSTICS);
      return response.data;
    } catch (error) {
      console.error('Error getting system diagnostics:', error);
      throw error;
    }
  }, []);

  return {
    connectionState,
    serverStatus,
    isConnected,
    isLaunching,
    launchGame,
    endSession,
    pauseSession,
    resumeSession,
    getServerStatus,
    submitRating,
    getSystemDiagnostics
  };
};

export default useCommandCenter;
