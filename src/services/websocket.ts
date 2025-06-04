import { toast } from "@/components/ui/use-toast";
import { WebSocketSettings } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Connection states for the WebSocket
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

// Command types for communication with Python server
export enum CommandType {
  LAUNCH_GAME = 'launchGame',
  END_SESSION = 'endSession',
  PAUSE_SESSION = 'pauseSession',
  RESUME_SESSION = 'resumeSession',
  GET_STATUS = 'getStatus',
  HEARTBEAT = 'heartbeat',
  SUBMIT_RATING = 'submitRating',
  GET_DIAGNOSTICS = 'getDiagnostics',
}

// Response status from Python server
export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL = 'partial',
  LAUNCHING = 'launching',
}

// Command interface
export interface Command {
  id: string;
  type: CommandType;
  params?: Record<string, any>;
  timestamp?: number;
  auth?: string;
}

// Response interface
export interface CommandResponse {
  id: string;
  status: ResponseStatus;
  data?: any;
  error?: string;
  timestamp?: number;
  progress?: number;
}

// Server status interface
export interface ServerStatus {
  connected: boolean;
  activeGame?: string;
  gameRunning: boolean;
  gameLaunching?: boolean;
  demoMode?: boolean;
  processRunning?: boolean;
  vrRuntimeStatus?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskSpace?: number;
  isPaused?: boolean;
  timeRemaining?: number;
  serverUptime?: number;
  connectedClients?: number;
  alerts?: Array<{
    type: string;
    message: string;
    value?: number;
    threshold?: number;
    timestamp: string;
  }>;
}

// Default WebSocket settings
const defaultSettings: WebSocketSettings = {
  url: 'ws://localhost:8081',
  reconnectAttempts: 5,
  reconnectDelay: 2000,
};

// Command timeout configurations (in milliseconds)
const COMMAND_TIMEOUTS = {
  [CommandType.LAUNCH_GAME]: 60000, // Increased to 60 seconds for game launch
  [CommandType.END_SESSION]: 15000,
  [CommandType.PAUSE_SESSION]: 5000,
  [CommandType.RESUME_SESSION]: 5000,
  [CommandType.GET_STATUS]: 10000, // Increased from 5000
  [CommandType.HEARTBEAT]: 15000, // Increased from 10000
  [CommandType.SUBMIT_RATING]: 10000,
  [CommandType.GET_DIAGNOSTICS]: 15000,
};

class WebSocketService {
  private socket: WebSocket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private commandCallbacks: Map<string, {
    resolve: (response: CommandResponse) => void;
    reject: (error: Error) => void;
    timeout: number;
  }> = new Map();
  private connectionStateListeners: ((state: ConnectionState) => void)[] = [];
  private statusListeners: ((status: ServerStatus) => void)[] = [];
  private heartbeatInterval: number | null = null;
  private heartbeatTimeout: number | null = null;
  private lastHeartbeatTime = 0;
  private commandRateLimiter: Map<CommandType, number> = new Map();
  private commandRateLimits: Map<CommandType, { max: number, window: number }> = new Map();
  private serverStatus: ServerStatus = {
    connected: false,
    gameRunning: false,
  };
  private settings: WebSocketSettings = { ...defaultSettings };
  private _initialized = false;
  private authToken: string | null = null;
  private connectionHealthCheck: number | null = null;
  private commandQueue: Command[] = [];
  private isProcessingQueue = false;
  private statusPollingInterval: number | null = null;

  constructor() {
    this.setDefaultRateLimits();
  }

  // Set default rate limits for commands
  private setDefaultRateLimits() {
    const globalDefault = { max: 20, window: 10000 };
    
    this.commandRateLimits.set(CommandType.HEARTBEAT, { max: 6, window: 60000 });
    this.commandRateLimits.set(CommandType.GET_STATUS, { max: 30, window: 60000 });
    this.commandRateLimits.set(CommandType.LAUNCH_GAME, { max: 3, window: 60000 }); // Limit game launches
    
    Object.values(CommandType).forEach(cmd => {
      if (!this.commandRateLimits.has(cmd as CommandType)) {
        this.commandRateLimits.set(cmd as CommandType, globalDefault);
      }
    });
  }

  // Initialize with settings from Supabase if available
  async initializeSettings(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 'websocket')
        .single();
      
      if (error) throw error;
      
      if (data && data.value) {
        const storedSettings = data.value as Record<string, any>;
        this.settings = {
          url: storedSettings.url || defaultSettings.url,
          reconnectAttempts: storedSettings.reconnect_attempts || defaultSettings.reconnectAttempts,
          reconnectDelay: storedSettings.reconnect_delay || defaultSettings.reconnectDelay
        };
        
        this.maxReconnectAttempts = this.settings.reconnectAttempts;
        this.reconnectDelay = this.settings.reconnectDelay;
      }
    } catch (error) {
      console.warn('Failed to load WebSocket settings from database, using defaults', error);
      this.settings = { ...defaultSettings };
    }
  }
  
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private isRateLimited(commandType: CommandType): boolean {
    const now = Date.now();
    const limit = this.commandRateLimits.get(commandType);
    
    if (!limit) return false;
    
    const calls = Array.from(this.commandRateLimiter.entries())
      .filter(([cmd, time]) => cmd === commandType && now - time < limit.window)
      .length;
      
    return calls >= limit.max;
  }

  private recordCommandUsage(commandType: CommandType): void {
    const now = Date.now();
    this.commandRateLimiter.set(commandType, now);
    
    // Cleanup old entries
    for (const [cmd, time] of this.commandRateLimiter.entries()) {
      const limit = this.commandRateLimits.get(cmd);
      if (limit && now - time > limit.window) {
        this.commandRateLimiter.delete(cmd);
      }
    }
  }

  async connect(customUrl?: string): Promise<void> {
    if (!this._initialized) {
      await this.initializeSettings();
      this._initialized = true;
    }

    const url = customUrl || this.settings.url;
    
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
  
  public disconnect(): void {
    this.cleanup();
    this.updateConnectionState(ConnectionState.DISCONNECTED);
  }

  private cleanup(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.heartbeatTimeout) {
      window.clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }

    if (this.connectionHealthCheck) {
      window.clearInterval(this.connectionHealthCheck);
      this.connectionHealthCheck = null;
    }

    this.stopStatusPolling();

    // Reject all pending commands
    this.commandCallbacks.forEach(({ reject, timeout }) => {
      window.clearTimeout(timeout);
      reject(new Error('Connection closed'));
    });
    this.commandCallbacks.clear();
  }
  
  public sendCommand(type: CommandType, params?: Record<string, any>): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        // Queue the command if we're reconnecting
        if (this.connectionState === ConnectionState.RECONNECTING) {
          const command: Command = {
            id: this.generateCommandId(),
            type,
            params,
            timestamp: Date.now(),
          };
          this.commandQueue.push(command);
          
          // Store the callback for when we process the queue
          this.commandCallbacks.set(command.id, { resolve, reject, timeout: 0 });
          return;
        }
        
        reject(new Error('WebSocket is not connected'));
        return;
      }
      
      if (this.isRateLimited(type)) {
        reject(new Error('Rate limit exceeded for this command type'));
        return;
      }
      
      const id = this.generateCommandId();
      const command: Command = {
        id,
        type,
        params,
        timestamp: Date.now(),
      };
      
      if (this.authToken) {
        command.auth = this.authToken;
      }

      // Set up timeout based on command type
      const timeoutDuration = COMMAND_TIMEOUTS[type] || 10000;
      const timeoutId = window.setTimeout(() => {
        if (this.commandCallbacks.has(id)) {
          this.commandCallbacks.delete(id);
          reject(new Error(`Command timed out after ${timeoutDuration}ms`));
        }
      }, timeoutDuration);
      
      this.commandCallbacks.set(id, { resolve, reject, timeout: timeoutId });
      this.recordCommandUsage(type);
      
      // Add progress feedback for game launch
      if (type === CommandType.LAUNCH_GAME) {
        this.updateServerStatus({
          ...this.serverStatus,
          gameLaunching: true,
        });
        
        toast({
          title: "Launching Game",
          description: "Starting VR game, this may take a moment...",
        });
      }
      
      this.socket.send(JSON.stringify(command));
    });
  }
  
  public onConnectionStateChange(listener: (state: ConnectionState) => void): () => void {
    this.connectionStateListeners.push(listener);
    listener(this.connectionState);
    
    return () => {
      this.connectionStateListeners = this.connectionStateListeners.filter(l => l !== listener);
    };
  }
  
  public onStatusUpdate(listener: (status: ServerStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.serverStatus);
    
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }
  
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  public getServerStatus(): ServerStatus {
    return this.serverStatus;
  }
  
  private startStatusPolling(): void {
    if (this.statusPollingInterval) {
      window.clearInterval(this.statusPollingInterval);
    }

    this.statusPollingInterval = window.setInterval(async () => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          await this.sendCommand(CommandType.GET_STATUS);
        } catch (error) {
          console.warn('Status polling failed:', error);
        }
      }
    }, 5000); // Poll every 5 seconds
  }

  private stopStatusPolling(): void {
    if (this.statusPollingInterval) {
      window.clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
  }

  private handleOpen = () => {
    console.log('WebSocket connection opened');
    this.reconnectAttempts = 0;
    this.updateConnectionState(ConnectionState.CONNECTED);
    this.startHeartbeat();
    this.startConnectionHealthCheck();
    this.startStatusPolling();
    this.processCommandQueue();
    
    // Get initial status with better error handling
    this.sendCommand(CommandType.GET_STATUS)
      .catch(error => {
        console.warn('Failed to get initial status:', error);
        // Don't retry immediately, let polling handle it
      });
    
    toast({
      title: "Connected to VR System",
      description: "Communication established successfully",
    });
  };
  
  private handleClose = (event: CloseEvent) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
    this.cleanup();
    
    if (this.connectionState !== ConnectionState.DISCONNECTED) {
      this.attemptReconnect();
    }
  };
  
  private handleMessage = (event: MessageEvent) => {
    try {
      let response: CommandResponse;
      
      // Handle malformed or undefined responses
      if (!event.data || event.data === 'undefined') {
        console.warn('Received undefined or empty WebSocket message');
        return;
      }
      
      try {
        response = JSON.parse(event.data);
      } catch (parseError) {
        console.error('Failed to parse WebSocket message:', event.data, parseError);
        return;
      }
      
      // Validate response structure
      if (!response || typeof response !== 'object') {
        console.warn('Invalid response structure:', response);
        return;
      }
      
      console.log('Status update received:', response.data);
      
      if (response.id && this.commandCallbacks.has(response.id)) {
        const { resolve, reject, timeout } = this.commandCallbacks.get(response.id)!;
        window.clearTimeout(timeout);
        
        if (response.status === ResponseStatus.SUCCESS || response.status === ResponseStatus.LAUNCHING) {
          // Handle launching status for game commands
          if (response.status === ResponseStatus.LAUNCHING) {
            this.updateServerStatus({
              ...this.serverStatus,
              gameLaunching: true,
            });
            
            toast({
              title: "Game Starting",
              description: "VR game is starting up...",
            });
            
            // Don't resolve yet, wait for the final success response
            return;
          }
          
          resolve(response);
        } else {
          reject(new Error(response.error || 'Unknown error'));
        }
        this.commandCallbacks.delete(response.id);
      }
      
      // Update server status from any response
      if (response.data && response.data.status) {
        this.updateServerStatus(response.data.status);
      }
      
      // Update heartbeat tracking
      this.lastHeartbeatTime = Date.now();
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };
  
  private handleError = (event: Event) => {
    console.error('WebSocket error:', event);
    toast({
      variant: "destructive",
      title: "Communication Error",
      description: "VR system communication error. Attempting to reconnect...",
    });
  };
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateConnectionState(ConnectionState.FAILED);
      toast({
        variant: "destructive",
        title: "Reconnection Failed",
        description: "Maximum reconnect attempts reached. Please check VR system status.",
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
      } else {
        this.connect();
      }
    }, this.reconnectDelay * Math.min(this.reconnectAttempts, 3)); // Cap backoff
  }
  
  private updateConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.connectionStateListeners.forEach(listener => listener(state));
    
    this.updateServerStatus({
      ...this.serverStatus,
      connected: state === ConnectionState.CONNECTED,
    });
  }
  
  private updateServerStatus(status: Partial<ServerStatus>): void {
    const previousStatus = { ...this.serverStatus };
    this.serverStatus = { ...this.serverStatus, ...status };
    
    // Log significant status changes for debugging
    if (previousStatus.gameRunning !== status.gameRunning) {
      console.log(`Game running status changed: ${previousStatus.gameRunning} -> ${status.gameRunning}`);
      
      // Clear launching state when game actually starts running
      if (status.gameRunning && this.serverStatus.gameLaunching) {
        this.serverStatus.gameLaunching = false;
        toast({
          title: "Game Launched Successfully",
          description: "VR game is now running",
        });
      }
    }
    
    // Auto-clear launching state after timeout if game doesn't start
    if (status.gameLaunching && !status.gameRunning) {
      setTimeout(() => {
        if (this.serverStatus.gameLaunching && !this.serverStatus.gameRunning) {
          console.log('Auto-clearing launching state after timeout');
          this.serverStatus.gameLaunching = false;
          this.statusListeners.forEach(listener => listener(this.serverStatus));
        }
      }, 30000); // Clear after 30 seconds if game hasn't started
    }
    
    this.statusListeners.forEach(listener => listener(this.serverStatus));
  }
  
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
    }
    
    this.lastHeartbeatTime = Date.now();
    
    this.heartbeatInterval = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendCommand(CommandType.HEARTBEAT)
          .then(() => {
            // Heartbeat successful
            if (this.heartbeatTimeout) {
              window.clearTimeout(this.heartbeatTimeout);
            }
          })
          .catch(error => {
            console.error('Heartbeat error:', error);
            // Don't immediately disconnect on heartbeat failure
            // Let the connection health check handle it
          });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private startConnectionHealthCheck(): void {
    if (this.connectionHealthCheck) {
      window.clearInterval(this.connectionHealthCheck);
    }

    this.connectionHealthCheck = window.setInterval(() => {
      const now = Date.now();
      const timeSinceLastHeartbeat = now - this.lastHeartbeatTime;
      
      // If we haven't heard from the server in 2 minutes, consider connection unhealthy
      if (timeSinceLastHeartbeat > 120000) {
        console.warn('Connection appears unhealthy, triggering reconnect');
        this.handleClose(new CloseEvent('close', { code: 1006, reason: 'Connection timeout' }));
      }
    }, 60000); // Check every minute
  }

  private processCommandQueue(): void {
    if (this.isProcessingQueue || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const queueToProcess = [...this.commandQueue];
    this.commandQueue = [];

    console.log(`Processing ${queueToProcess.length} queued commands`);

    queueToProcess.forEach(command => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(command));
      } else {
        // Re-queue if connection is lost again
        this.commandQueue.push(command);
      }
    });

    this.isProcessingQueue = false;
  }
  
  private generateCommandId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const websocketService = new WebSocketService();

export default websocketService;
