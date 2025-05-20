
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
  SCAN_RFID = 'scanRfid',       // Command for RFID scanning
  VALIDATE_RFID = 'validateRfid', // Command for RFID validation
  REGISTER_RFID = 'registerRfid', // Command to register new RFID
  DEACTIVATE_RFID = 'deactivateRfid', // Command to deactivate RFID
  GET_RFID_HISTORY = 'getRfidHistory', // Get RFID card history
  SET_RFID_GAME_PERMISSION = 'setRfidGamePermission', // Set RFID card game permissions
  GET_DIAGNOSTICS = 'getDiagnostics', // Get system diagnostics
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
  auth?: string; // Optional authentication token
}

// Response interface
export interface CommandResponse {
  id: string; // Matches the command ID
  status: ResponseStatus;
  data?: any;
  error?: string;
  timestamp?: number;
}

// RFID Card data interface
export interface RfidCardData {
  tagId: string;
  name?: string;
  status: string;
  valid: boolean;
  authorized?: boolean;
  permissionLevel?: string;
  message?: string;
}

// Server status interface
export interface ServerStatus {
  connected: boolean;
  activeGame?: string;
  gameRunning: boolean;
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
    value: number;
    threshold: number;
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
  private reconnectDelay = 2000; // ms
  private commandCallbacks: Map<string, (response: CommandResponse) => void> = new Map();
  private connectionStateListeners: ((state: ConnectionState) => void)[] = [];
  private statusListeners: ((status: ServerStatus) => void)[] = [];
  private rfidListeners: ((rfidData: RfidCardData) => void)[] = [];
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
    // Set up default rate limits for commands
    this.setDefaultRateLimits();
  }

  // Set default rate limits for commands
  private setDefaultRateLimits() {
    // Global default limit: 20 calls per 10 seconds
    const globalDefault = { max: 20, window: 10000 };
    
    // Specific limits for certain commands
    this.commandRateLimits.set(CommandType.HEARTBEAT, { max: 6, window: 60000 }); // 6 per minute
    this.commandRateLimits.set(CommandType.GET_STATUS, { max: 30, window: 60000 }); // 30 per minute
    this.commandRateLimits.set(CommandType.SCAN_RFID, { max: 20, window: 10000 }); // 20 per 10 seconds
    
    // Default for other commands
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
        
        // Update max reconnect attempts
        this.maxReconnectAttempts = this.settings.reconnectAttempts;
        this.reconnectDelay = this.settings.reconnectDelay;
      }
    } catch (error) {
      console.warn('Failed to load WebSocket settings from database, using defaults', error);
      this.settings = { ...defaultSettings };
    }
  }
  
  // Set authentication token
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Check if a command is rate limited
  private isRateLimited(commandType: CommandType): boolean {
    const now = Date.now();
    const limit = this.commandRateLimits.get(commandType);
    
    if (!limit) return false;
    
    // Get previous calls within the time window
    const calls = Array.from(this.commandRateLimiter.entries())
      .filter(([cmd, time]) => cmd === commandType && now - time < limit.window)
      .length;
      
    return calls >= limit.max;
  }

  // Record command usage for rate limiting
  private recordCommandUsage(commandType: CommandType): void {
    const now = Date.now();
    this.commandRateLimiter.set(commandType, now);
    
    // Clean up old entries
    for (const [cmd, time] of this.commandRateLimiter.entries()) {
      const limit = this.commandRateLimits.get(cmd);
      if (limit && now - time > limit.window) {
        this.commandRateLimiter.delete(cmd);
      }
    }
  }

  // Connect to the Python WebSocket server
  async connect(customUrl?: string): Promise<void> {
    // Load settings from database if not done already
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
  
  // Send a command to the Python server
  public sendCommand(type: CommandType, params?: Record<string, any>): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }
      
      // Check rate limits
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
      
      // Add authentication token if available
      if (this.authToken) {
        command.auth = this.authToken;
      }
      
      // Store callback to resolve the promise when response is received
      this.commandCallbacks.set(id, (response) => {
        if (response.status === ResponseStatus.SUCCESS) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Unknown error'));
        }
      });
      
      // Record command usage for rate limiting
      this.recordCommandUsage(type);
      
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
  
  // Scan RFID tag
  public async scanRfid(tagId: string): Promise<RfidCardData> {
    try {
      const response = await this.sendCommand(CommandType.SCAN_RFID, { tagId });
      return response.data as RfidCardData;
    } catch (error) {
      console.error('Error scanning RFID:', error);
      throw error;
    }
  }
  
  // Validate RFID for a specific game
  public async validateRfid(tagId: string, gameId: string): Promise<RfidCardData> {
    try {
      const response = await this.sendCommand(CommandType.VALIDATE_RFID, { tagId, gameId });
      return response.data as RfidCardData;
    } catch (error) {
      console.error('Error validating RFID:', error);
      throw error;
    }
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
  
  // Subscribe to RFID events
  public onRfidEvent(listener: (rfidData: RfidCardData) => void): () => void {
    this.rfidListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.rfidListeners = this.rfidListeners.filter(l => l !== listener);
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
      
      // Handle RFID events
      if (response.data && 
          (response.data.tagId || response.data.rfidTag) && 
          (response.data.valid !== undefined || response.data.authorized !== undefined)) {
        this.notifyRfidListeners(response.data);
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
      } else {
        this.connect();
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
  
  // Notify RFID listeners of RFID events
  private notifyRfidListeners(rfidData: RfidCardData): void {
    this.rfidListeners.forEach(listener => listener(rfidData));
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
