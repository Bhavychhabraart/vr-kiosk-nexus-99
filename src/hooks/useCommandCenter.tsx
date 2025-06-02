
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

  useEffect(() => {
    // Connect to the WebSocket server when the component mounts
    websocketService.connect();

    // Subscribe to connection state changes
    const unsubConnectionState = websocketService.onConnectionStateChange(
      (state) => {
        setConnectionState(state);
      }
    );

    // Subscribe to server status updates
    const unsubServerStatus = websocketService.onStatusUpdate((status) => {
      setServerStatus(status);
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
  }, [options]);

  // Check if connected
  const isConnected = connectionState === ConnectionState.CONNECTED;

  // Launch a game
  const launchGame = useCallback(async (gameId: string, durationSeconds: number) => {
    try {
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
      
      return response;
    } catch (error) {
      console.error('Error launching game:', error);
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
      
      return response;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }, []);

  // Pause the current session
  const pauseSession = useCallback(async () => {
    try {
      return await websocketService.sendCommand(CommandType.PAUSE_SESSION);
    } catch (error) {
      console.error('Error pausing session:', error);
      throw error;
    }
  }, []);

  // Resume the current session
  const resumeSession = useCallback(async () => {
    try {
      return await websocketService.sendCommand(CommandType.RESUME_SESSION);
    } catch (error) {
      console.error('Error resuming session:', error);
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
      
      return true;
    } catch (error) {
      console.error('Error submitting rating:', error);
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
