
import { useState, useEffect, useCallback } from 'react';
import websocketService, { 
  ConnectionState, 
  CommandType,
  ServerStatus,
  CommandResponse
} from '@/services/websocket';

// Environment variables (in a real implementation, this would be in .env)
const WS_SERVER_URL = import.meta.env.VITE_WS_SERVER_URL || 'ws://localhost:8081';

interface UseCommandCenterOptions {
  autoConnect?: boolean;
  onStatusChange?: (status: ServerStatus) => void;
  onConnectionChange?: (state: ConnectionState) => void;
}

export function useCommandCenter(options: UseCommandCenterOptions = {}) {
  const { autoConnect = true, onStatusChange, onConnectionChange } = options;
  
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    websocketService.getConnectionState()
  );
  
  const [serverStatus, setServerStatus] = useState<ServerStatus>(
    websocketService.getServerStatus()
  );

  // Connect to WebSocket server
  const connect = useCallback(() => {
    websocketService.connect(WS_SERVER_URL);
  }, []);
  
  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);
  
  // Launch a game
  const launchGame = useCallback(async (gameId: string, sessionDuration: number) => {
    try {
      const response = await websocketService.sendCommand(CommandType.LAUNCH_GAME, {
        gameId,
        sessionDuration
      });
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
      return response;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }, []);
  
  // Pause the current session
  const pauseSession = useCallback(async () => {
    try {
      const response = await websocketService.sendCommand(CommandType.PAUSE_SESSION);
      return response;
    } catch (error) {
      console.error('Error pausing session:', error);
      throw error;
    }
  }, []);
  
  // Resume the current session
  const resumeSession = useCallback(async () => {
    try {
      const response = await websocketService.sendCommand(CommandType.RESUME_SESSION);
      return response;
    } catch (error) {
      console.error('Error resuming session:', error);
      throw error;
    }
  }, []);
  
  // Submit game rating
  const submitRating = useCallback(async (gameId: string, rating: number) => {
    try {
      const response = await websocketService.sendCommand(CommandType.SUBMIT_RATING, {
        gameId,
        rating
      });
      return response;
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }, []);
  
  // Get server status
  const getStatus = useCallback(async () => {
    try {
      const response = await websocketService.sendCommand(CommandType.GET_STATUS);
      return response;
    } catch (error) {
      console.error('Error getting status:', error);
      throw error;
    }
  }, []);
  
  // Send a custom command
  const sendCommand = useCallback(async (type: CommandType, params?: Record<string, any>) => {
    try {
      const response = await websocketService.sendCommand(type, params);
      return response;
    } catch (error) {
      console.error(`Error sending command ${type}:`, error);
      throw error;
    }
  }, []);

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribeConnection = websocketService.onConnectionStateChange((state) => {
      setConnectionState(state);
      if (onConnectionChange) {
        onConnectionChange(state);
      }
    });
    
    // Subscribe to server status updates
    const unsubscribeStatus = websocketService.onStatusUpdate((status) => {
      setServerStatus(status);
      if (onStatusChange) {
        onStatusChange(status);
      }
    });
    
    // Auto connect if enabled
    if (autoConnect) {
      connect();
    }
    
    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeConnection();
      unsubscribeStatus();
    };
  }, [autoConnect, connect, onConnectionChange, onStatusChange]);

  return {
    connectionState,
    serverStatus,
    connect,
    disconnect,
    launchGame,
    endSession,
    pauseSession,
    resumeSession,
    submitRating,
    getStatus,
    sendCommand,
    isConnected: connectionState === ConnectionState.CONNECTED,
    isConnecting: connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.RECONNECTING,
  };
}

export default useCommandCenter;
