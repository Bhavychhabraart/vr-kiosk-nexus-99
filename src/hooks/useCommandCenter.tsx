
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import websocketService, { 
  ConnectionState, 
  CommandType, 
  ServerStatus 
} from '@/services/websocket';

interface CommandCenterOptions {
  onStatusChange?: (status: ServerStatus) => void;
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
  const launchGame = useCallback(async (gameId: string, durationSeconds: number, rfidTag?: string) => {
    try {
      const response = await websocketService.sendCommand(CommandType.LAUNCH_GAME, { 
        gameId, 
        durationSeconds,
        rfidTag 
      });
      
      // Store session start in database
      try {
        const sessionData = {
          game_id: gameId,
          duration_seconds: durationSeconds,
          rfid_tag: rfidTag,
          status: 'active',
        };
        
        // Implementation would typically store this in a database
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
        // Implementation would typically update the session in the database
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
  const submitRating = useCallback(async (gameId: string, rating: number, rfidTag?: string) => {
    try {
      // Send rating to the server
      await websocketService.sendCommand(CommandType.SUBMIT_RATING, { 
        gameId, 
        rating,
        rfidTag 
      });
      
      // Also store it in our database
      try {
        const ratingData = {
          game_id: gameId,
          rating: rating,
          rfid_tag: rfidTag,
          end_time: new Date().toISOString(),
          status: 'completed'
        };
        
        // Implementation would typically store this in a database
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
  };
};

export default useCommandCenter;
