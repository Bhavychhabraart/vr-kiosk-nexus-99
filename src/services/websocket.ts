
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
}

// Server status interface
export interface ServerStatus {
  connected: boolean;
  activeGame?: string;
  gameRunning: boolean;
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

class WebSocketService {
  private socket: WebSocket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private commandCallbacks: Map<string, (response: CommandResponse) => void> = new Map();
  private connectionStateListeners: ((state: ConnectionState) => void)[] = [];
  private statusListeners: ((status: ServerStatus) => void)[] = [];
  private heartbeatInterval: number | null = null;
  private commandRateLimiter: Map<CommandType, number> = new Map();
  private commandRateLimits: Map<CommandType, { max: number, window: number }> = new Map();
  private serverStatus: ServerStatus = {
    connected: false,
    gameRunning: false,
  };
  private settings: WebSocketSettings = { ...defaultSettings };
  private _initialized = false;
  private authToken: string | null = null;

  constructor() {
    this.setDefaultRateLimits();
  }

  // Set default rate limits for commands
  private setDefaultRateLimits() {
    const globalDefault = { max: 20, window: 10000 };
    
    this.commandRateLimits.set(CommandType.HEARTBEAT, { max: 6, window: 60000 });
    this.commandRateLimits.set(CommandType.GET_STATUS, { max: 30, window: 60000 });
    
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
  
  public sendCommand(type: CommandType, params?: Record<string, any>): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
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
      
      this.commandCallbacks.set(id, (response) => {
        if (response.status === ResponseStatus.SUCCESS) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Unknown error'));
        }
      });
      
      this.recordCommandUsage(type);
      
      this.socket.send(JSON.stringify(command));
      
      setTimeout(() => {
        if (this.commandCallbacks.has(id)) {
          this.commandCallbacks.delete(id);
          reject(new Error('Command timed out'));
        }
      }, 10000);
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
  
  private handleOpen = () => {
    this.reconnectAttempts = 0;
    this.updateConnectionState(ConnectionState.CONNECTED);
    this.startHeartbeat();
    
    this.sendCommand(CommandType.GET_STATUS)
      .catch(error => console.error('Failed to get initial status:', error));
    
    toast({
      title: "Connected to VR System",
      description: "Communication established successfully",
    });
  };
  
  private handleClose = (event: CloseEvent) => {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.connectionState !== ConnectionState.DISCONNECTED) {
      this.attemptReconnect();
    }
  };
  
  private handleMessage = (event: MessageEvent) => {
    try {
      const response: CommandResponse = JSON.parse(event.data);
      
      if (response.id && this.commandCallbacks.has(response.id)) {
        const callback = this.commandCallbacks.get(response.id)!;
        callback(response);
        this.commandCallbacks.delete(response.id);
      }
      
      if (response.data && response.data.status) {
        this.updateServerStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };
  
  private handleError = (event: Event) => {
    console.error('WebSocket error:', event);
    toast({
      variant: "destructive",
      title: "Communication Error",
      description: "VR system communication error. Please try reconnecting or contact support.",
    });
  };
  
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
      } else {
        this.connect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
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
    }
    
    if (previousStatus.demoMode !== status.demoMode) {
      console.log(`Demo mode status changed: ${previousStatus.demoMode} -> ${status.demoMode}`);
    }
    
    if (previousStatus.processRunning !== status.processRunning) {
      console.log(`Process running status changed: ${previousStatus.processRunning} -> ${status.processRunning}`);
    }
    
    this.statusListeners.forEach(listener => listener(this.serverStatus));
  }
  
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendCommand(CommandType.HEARTBEAT)
          .catch(error => console.error('Heartbeat error:', error));
      }
    }, 30000);
  }
  
  private generateCommandId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const websocketService = new WebSocketService();

export default websocketService;
