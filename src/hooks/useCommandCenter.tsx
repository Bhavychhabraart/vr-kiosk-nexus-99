
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import websocketService, { 
  ConnectionState, 
  CommandType, 
  ServerStatus
} from '@/services/websocket';
import { useSessionTracking } from './useSessionTracking';
import { useUserRoles } from './useUserRoles';

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
  const { userVenues, isMachineAdmin } = useUserRoles();

  // Get the user's venue ID for session tracking
  const getUserVenueId = useCallback(() => {
    if (userVenues && userVenues.length > 0) {
      return userVenues[0].id; // Use first venue
    }
    console.warn('No venue found for user, session tracking may be incomplete');
    return null;
  }, [userVenues]);

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
    method: 'rfid' | 'upi' | 'free';
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
      
      // Start session tracking with proper venue ID
      if (paymentData) {
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setCurrentSessionId(sessionId);
        
        // Get venue ID from payment data or user's assigned venue
        const venueId = paymentData.venueId || getUserVenueId();
        
        if (!venueId) {
          console.error('Cannot start session tracking: No venue ID available');
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "Venue information is missing. Session tracking disabled.",
          });
        } else {
          await startSession({
            sessionId,
            gameId,
            venueId, // Ensure venue ID is always provided
            paymentMethod: paymentData.method,
            amountPaid: paymentData.amount,
            rfidTag: paymentData.rfidTag
          });
        }
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
  }, [startSession, getUserVenueId]);

  const endSessionCommand = useCallback(async (rating?: number, sessionId?: string) => {
    try {
      console.log('Ending session with rating:', rating, 'sessionId:', sessionId);
      
      const response = await websocketService.sendCommand(CommandType.END_SESSION);
      
      // Use provided sessionId or fallback to currentSessionId
      const sessionToEnd = sessionId || currentSessionId;
      
      if (sessionToEnd) {
        console.log('Ending session tracking for:', sessionToEnd);
        await endSession(sessionToEnd, rating);
        
        // Clear current session if it matches the ended session
        if (sessionToEnd === currentSessionId) {
          setCurrentSessionId(null);
        }
      } else {
        console.warn('No session ID available for session tracking cleanup');
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
    getServerStatus,
    submitRating,
    getSystemDiagnostics
  };
};

export default useCommandCenter;
