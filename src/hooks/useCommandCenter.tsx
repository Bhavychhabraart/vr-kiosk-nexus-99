import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import websocketService, { 
  ConnectionState, 
  CommandType, 
  ServerStatus
} from '@/services/websocket';
import { useSessionTracking } from './useSessionTracking';

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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const { startSession, endSession, updateSessionStatus } = useSessionTracking();

  useEffect(() => {
    websocketService.connect();

    const unsubConnectionState = websocketService.onConnectionStateChange(
      (state) => {
        setConnectionState(state);
        console.log('Connection state changed:', state);
      }
    );

    const unsubServerStatus = websocketService.onStatusUpdate((status) => {
      setServerStatus(status);
      
      const wasLaunching = isLaunching;
      const isCurrentlyLaunching = status.gameLaunching || false;
      
      setIsLaunching(isCurrentlyLaunching);
      
      if (wasLaunching && status.gameRunning && !isCurrentlyLaunching) {
        console.log('Game launch completed successfully');
        toast({
          title: "Game Launched",
          description: "VR game is now running successfully",
        });
      }
      
      options.onStatusChange?.(status);
      
      if (status.alerts && status.alerts.length > 0) {
        const newAlerts = status.alerts.filter(alert => {
          const alertTime = typeof alert.timestamp === 'string' 
            ? Date.parse(alert.timestamp) 
            : alert.timestamp;
          return alertTime > Date.now() - 60000;
        });
        
        if (newAlerts.length > 0) {
          options.onSystemAlert?.(newAlerts[0]);
        }
      }
    });

    return () => {
      unsubConnectionState();
      unsubServerStatus();
    };
  }, [options, isLaunching]);

  const isConnected = connectionState === ConnectionState.CONNECTED;

  const launchGame = useCallback(async (gameId: string, durationSeconds: number, paymentData?: {
    method: 'rfid' | 'upi';
    amount: number;
    rfidTag?: string;
    venueId?: string;
  }) => {
    try {
      setIsLaunching(true);
      
      console.log(`Launching game ${gameId} for ${durationSeconds} seconds`);
      
      const response = await websocketService.sendCommand(CommandType.LAUNCH_GAME, { 
        gameId, 
        sessionDuration: durationSeconds
      });
      
      // Start session tracking if payment data is provided
      if (paymentData) {
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setCurrentSessionId(sessionId);
        
        await startSession({
          sessionId,
          gameId,
          venueId: paymentData.venueId,
          paymentMethod: paymentData.method,
          amountPaid: paymentData.amount,
          rfidTag: paymentData.rfidTag
        });
      }
      
      console.log('Game launch command sent successfully');
      return response;
    } catch (error) {
      console.error('Error launching game:', error);
      setIsLaunching(false);
      
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
  }, [startSession]);

  const endSessionCommand = useCallback(async (rating?: number) => {
    try {
      const response = await websocketService.sendCommand(CommandType.END_SESSION);
      
      // End session tracking if we have a current session
      if (currentSessionId) {
        await endSession(currentSessionId, rating);
        setCurrentSessionId(null);
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
  }, [currentSessionId, endSession]);

  const pauseSession = useCallback(async () => {
    try {
      const response = await websocketService.sendCommand(CommandType.PAUSE_SESSION);
      
      if (currentSessionId) {
        await updateSessionStatus(currentSessionId, 'paused');
      }
      
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
  }, [currentSessionId, updateSessionStatus]);

  const resumeSession = useCallback(async () => {
    try {
      const response = await websocketService.sendCommand(CommandType.RESUME_SESSION);
      
      if (currentSessionId) {
        await updateSessionStatus(currentSessionId, 'active');
      }
      
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
  }, [currentSessionId, updateSessionStatus]);

  const getServerStatus = useCallback(async () => {
    try {
      return await websocketService.sendCommand(CommandType.GET_STATUS);
    } catch (error) {
      console.error('Error getting server status:', error);
      throw error;
    }
  }, []);

  const submitRating = useCallback(async (gameId: string, rating: number) => {
    try {
      await websocketService.sendCommand(CommandType.SUBMIT_RATING, { 
        gameId, 
        rating
      });
      
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
    currentSessionId,
    launchGame,
    endSession: endSessionCommand,
    pauseSession,
    resumeSession,
    getServerStatus,
    submitRating,
    getSystemDiagnostics
  };
};

export default useCommandCenter;
