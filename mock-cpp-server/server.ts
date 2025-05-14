
// This is a mock implementation of a C++ WebSocket server for testing
// In a real implementation, this would be written in C++ using a library like Boost.Beast
// To run this: npm install ws && npx ts-node server.ts

import * as WebSocket from 'ws';
import { randomUUID } from 'crypto';

const PORT = 8081;

// Mock game data
const games = {
  '1': { id: '1', title: 'Beat Saber', executable: 'beatsaber.exe' },
  '2': { id: '2', title: 'Half-Life: Alyx', executable: 'hlvr.exe' },
  '3': { id: '3', title: 'VRChat', executable: 'vrchat.exe' },
};

// Server state
const state = {
  activeGameId: null,
  gameProcess: null,
  isRunning: false,
  isPaused: false,
  sessionDuration: 0,
  timeRemaining: 0,
  sessionTimer: null,
};

// Command handlers
const commandHandlers = {
  launchGame: (ws: WebSocket, params: any, commandId: string) => {
    const { gameId, sessionDuration } = params;
    
    if (!games[gameId]) {
      sendResponse(ws, commandId, 'error', null, `Game with ID ${gameId} not found`);
      return;
    }
    
    console.log(`Launching game ${gameId}: ${games[gameId].title}`);
    
    // In a real C++ implementation, this would execute the game process
    // For this mock, we'll simulate success after a short delay
    setTimeout(() => {
      state.activeGameId = gameId;
      state.isRunning = true;
      state.isPaused = false;
      state.sessionDuration = sessionDuration;
      state.timeRemaining = sessionDuration;
      
      // Clear any existing timer
      if (state.sessionTimer) {
        clearInterval(state.sessionTimer);
      }
      
      // Start countdown timer
      state.sessionTimer = setInterval(() => {
        if (!state.isPaused && state.timeRemaining > 0) {
          state.timeRemaining--;
          
          // Send status updates periodically
          if (state.timeRemaining % 10 === 0) {
            broadcastStatus();
          }
          
          if (state.timeRemaining <= 0) {
            endGame();
          }
        }
      }, 1000);
      
      sendResponse(ws, commandId, 'success', {
        gameId,
        title: games[gameId].title,
        running: true,
      });
      
      broadcastStatus();
    }, 1000);
  },
  
  endSession: (ws: WebSocket, params: any, commandId: string) => {
    console.log('Ending session');
    
    const wasRunning = state.isRunning;
    endGame();
    
    sendResponse(ws, commandId, 'success', {
      wasRunning,
      message: 'Session ended successfully',
    });
    
    broadcastStatus();
  },
  
  pauseSession: (ws: WebSocket, params: any, commandId: string) => {
    console.log('Pausing session');
    
    if (!state.isRunning) {
      sendResponse(ws, commandId, 'error', null, 'No active session to pause');
      return;
    }
    
    state.isPaused = true;
    
    sendResponse(ws, commandId, 'success', {
      paused: true,
      timeRemaining: state.timeRemaining,
    });
    
    broadcastStatus();
  },
  
  resumeSession: (ws: WebSocket, params: any, commandId: string) => {
    console.log('Resuming session');
    
    if (!state.isRunning) {
      sendResponse(ws, commandId, 'error', null, 'No active session to resume');
      return;
    }
    
    state.isPaused = false;
    
    sendResponse(ws, commandId, 'success', {
      paused: false,
      timeRemaining: state.timeRemaining,
    });
    
    broadcastStatus();
  },
  
  getStatus: (ws: WebSocket, params: any, commandId: string) => {
    console.log('Getting status');
    
    sendResponse(ws, commandId, 'success', {
      status: getServerStatus(),
    });
  },
  
  heartbeat: (ws: WebSocket, params: any, commandId: string) => {
    sendResponse(ws, commandId, 'success', {
      timestamp: Date.now(),
    });
  },
};

// Create WebSocket server
const server = new WebSocket.Server({ port: PORT });
const clients = new Set<WebSocket>();

// Send response to client
function sendResponse(ws: WebSocket, commandId: string, status: string, data: any, error?: string) {
  ws.send(JSON.stringify({
    id: commandId,
    status,
    data,
    error,
    timestamp: Date.now(),
  }));
}

// Broadcast status to all clients
function broadcastStatus() {
  const status = getServerStatus();
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        id: randomUUID(),
        status: 'success',
        data: { status },
        timestamp: Date.now(),
      }));
    }
  });
}

// Get server status
function getServerStatus() {
  return {
    connected: true,
    activeGame: state.activeGameId ? games[state.activeGameId].title : null,
    gameRunning: state.isRunning,
    isPaused: state.isPaused,
    timeRemaining: state.timeRemaining,
    cpuUsage: Math.floor(Math.random() * 30) + 10, // Mock CPU usage
    memoryUsage: Math.floor(Math.random() * 40) + 20, // Mock memory usage
  };
}

// End the current game
function endGame() {
  if (state.sessionTimer) {
    clearInterval(state.sessionTimer);
    state.sessionTimer = null;
  }
  
  state.isRunning = false;
  state.isPaused = false;
  state.activeGameId = null;
  state.timeRemaining = 0;
}

// Handle WebSocket connections
server.on('connection', (ws) => {
  console.log('Client connected');
  
  clients.add(ws);
  
  // Send initial status
  setTimeout(() => {
    sendResponse(ws, randomUUID(), 'success', {
      status: getServerStatus(),
      message: 'Connected to VR Command Center'
    });
  }, 500);
  
  // Handle messages
  ws.on('message', (message) => {
    try {
      const command = JSON.parse(message.toString());
      console.log('Received command:', command);
      
      const { id, type, params } = command;
      
      if (commandHandlers[type]) {
        commandHandlers[type](ws, params, id);
      } else {
        sendResponse(ws, id, 'error', null, `Unknown command: ${type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

console.log(`Mock C++ WebSocket server running on port ${PORT}`);
