
import { toast } from "@/components/ui/use-toast";

// Connection states for the WebSocket
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

// Command types for communication with C++ server
export enum CommandType {
  LAUNCH_GAME = 'launchGame',
  END_SESSION = 'endSession',
  PAUSE_SESSION = 'pauseSession',
  RESUME_SESSION = 'resumeSession',
  GET_STATUS = 'getStatus',
  HEARTBEAT = 'heartbeat',
}

// Response status from C++ server
export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL = 'partial',
}

// Command interface
export interface Command {
  id: string;
  type: CommandType;
  params?: Record<string, any>;
  timestamp?: number;
}

// Response interface
export interface CommandResponse {
  id: string; // Matches the command ID
  status: ResponseStatus;
  data?: any;
  error?: string;
  timestamp?: number;
}

// Server status interface
export interface ServerStatus {
  connected: boolean;
  activeGame?: string;
  gameRunning: boolean;
  cpuUsage?: number;
  memoryUsage?: number;
  diskSpace?: number;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // ms
  private commandCallbacks: Map<string, (response: CommandResponse) => void> = new Map();
  private connectionStateListeners: ((state: ConnectionState) => void)[] = [];
  private statusListeners: ((status: ServerStatus) => void)[] = [];
  private heartbeatInterval: number | null = null;
  private serverStatus: ServerStatus = {
    connected: false,
    gameRunning: false,
  };

  // Connect to the C++ WebSocket server
  public connect(url: string): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.updateConnectionState(ConnectionState.CONNECTING);
    
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = this.handleOpen;
      this.socket.onclose = this.handleClose;
      this.socket.onmessage = this.handleMessage;
      this.socket.onerror = this.handleError;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.updateConnectionState(ConnectionState.FAILED);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to VR system. Please check if the VR system is running.",
      });
    }
  }
  
  // Disconnect from the server
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.updateConnectionState(ConnectionState.DISCONNECTED);
  }
  
  // Send a command to the C++ server
  public sendCommand(type: CommandType, params?: Record<string, any>): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }
      
      const id = this.generateCommandId();
      const command: Command = {
        id,
        type,
        params,
        timestamp: Date.now(),
      };
      
      // Store callback to resolve the promise when response is received
      this.commandCallbacks.set(id, (response) => {
        if (response.status === ResponseStatus.SUCCESS) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Unknown error'));
        }
      });
      
      // Send command to server
      this.socket.send(JSON.stringify(command));
      
      // Set timeout to reject if no response
      setTimeout(() => {
        if (this.commandCallbacks.has(id)) {
          this.commandCallbacks.delete(id);
          reject(new Error('Command timed out'));
        }
      }, 10000); // 10 second timeout
    });
  }
  
  // Subscribe to connection state changes
  public onConnectionStateChange(listener: (state: ConnectionState) => void): () => void {
    this.connectionStateListeners.push(listener);
    // Immediately notify with current state
    listener(this.connectionState);
    
    // Return unsubscribe function
    return () => {
      this.connectionStateListeners = this.connectionStateListeners.filter(l => l !== listener);
    };
  }
  
  // Subscribe to server status updates
  public onStatusUpdate(listener: (status: ServerStatus) => void): () => void {
    this.statusListeners.push(listener);
    // Immediately notify with current status
    listener(this.serverStatus);
    
    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }
  
  // Get current connection state
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  // Get current server status
  public getServerStatus(): ServerStatus {
    return this.serverStatus;
  }
  
  // Handle WebSocket open event
  private handleOpen = () => {
    this.reconnectAttempts = 0;
    this.updateConnectionState(ConnectionState.CONNECTED);
    this.startHeartbeat();
    
    // Request initial status
    this.sendCommand(CommandType.GET_STATUS)
      .catch(error => console.error('Failed to get initial status:', error));
    
    toast({
      title: "Connected to VR System",
      description: "Communication established successfully",
    });
  };
  
  // Handle WebSocket close event
  private handleClose = (event: CloseEvent) => {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.connectionState !== ConnectionState.DISCONNECTED) {
      this.attemptReconnect();
    }
  };
  
  // Handle WebSocket message event
  private handleMessage = (event: MessageEvent) => {
    try {
      const response: CommandResponse = JSON.parse(event.data);
      
      // Handle command response
      if (response.id && this.commandCallbacks.has(response.id)) {
        const callback = this.commandCallbacks.get(response.id)!;
        callback(response);
        this.commandCallbacks.delete(response.id);
      }
      
      // Handle status updates
      if (response.data && response.data.status) {
        this.updateServerStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };
  
  // Handle WebSocket error event
  private handleError = (event: Event) => {
    console.error('WebSocket error:', event);
    toast({
      variant: "destructive",
      title: "Communication Error",
      description: "VR system communication error. Please try reconnecting or contact support.",
    });
  };
  
  // Attempt to reconnect to the server
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateConnectionState(ConnectionState.FAILED);
      toast({
        variant: "destructive",
        title: "Reconnection Failed",
        description: "Maximum reconnect attempts reached. Please restart the application.",
      });
      return;
    }
    
    this.updateConnectionState(ConnectionState.RECONNECTING);
    this.reconnectAttempts++;
    
    toast({
      variant: "default",
      title: "Reconnecting",
      description: `Attempting to reconnect to VR system (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    });
    
    setTimeout(() => {
      if (this.socket && this.socket.url) {
        this.connect(this.socket.url);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }
  
  // Update connection state and notify listeners
  private updateConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.connectionStateListeners.forEach(listener => listener(state));
    
    // Update server status connected property
    this.updateServerStatus({
      ...this.serverStatus,
      connected: state === ConnectionState.CONNECTED,
    });
  }
  
  // Update server status and notify listeners
  private updateServerStatus(status: Partial<ServerStatus>): void {
    this.serverStatus = { ...this.serverStatus, ...status };
    this.statusListeners.forEach(listener => listener(this.serverStatus));
  }
  
  // Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendCommand(CommandType.HEARTBEAT)
          .catch(error => console.error('Heartbeat error:', error));
      }
    }, 30000); // 30 seconds
  }
  
  // Generate a unique command ID
  private generateCommandId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService();

export default websocketService;
