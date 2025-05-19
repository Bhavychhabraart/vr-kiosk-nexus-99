
#!/usr/bin/env python3
import asyncio
import json
import logging
import os
import signal
import sys
from datetime import datetime
from typing import Dict, Set, Any, Optional, List

import websockets
from dotenv import load_dotenv

from command_handler import CommandHandler
from game_manager import GameManager
from session_manager import SessionManager
from system_monitor import SystemMonitor

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("vr_server.log"),
    ],
)
logger = logging.getLogger("vr-server")

# Global constants
HOST = os.getenv("VR_SERVER_HOST", "0.0.0.0")
PORT = int(os.getenv("VR_SERVER_PORT", "8081"))
GAMES_CONFIG_PATH = os.getenv("VR_GAMES_CONFIG", "games.json")
STATUS_BROADCAST_INTERVAL = int(os.getenv("VR_STATUS_INTERVAL", "5"))  # seconds


class WebSocketServer:
    """Main WebSocket server class that handles client connections and messages"""

    def __init__(self):
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.game_manager = GameManager(GAMES_CONFIG_PATH, logger)
        self.session_manager = SessionManager(logger, self.broadcast_status)
        self.system_monitor = SystemMonitor(logger)
        self.command_handler = CommandHandler(
            self.game_manager, 
            self.session_manager, 
            self.system_monitor,
            logger
        )
        self.running = False
        self.status_task = None

    async def register_client(self, websocket: websockets.WebSocketServerProtocol):
        """Register a new client connection"""
        self.clients.add(websocket)
        client_info = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        logger.info(f"Client connected: {client_info}")
        
        # Send initial welcome message and status
        await self.send_welcome_message(websocket)

    async def unregister_client(self, websocket: websockets.WebSocketServerProtocol):
        """Unregister a client connection"""
        self.clients.remove(websocket)
        client_info = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        logger.info(f"Client disconnected: {client_info}")

    async def send_welcome_message(self, websocket: websockets.WebSocketServerProtocol):
        """Send welcome message with server status to new client"""
        response = {
            "id": self.generate_id(),
            "status": "success",
            "data": {
                "status": self.get_server_status(),
                "message": "Connected to VR Command Center"
            },
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
        await websocket.send(json.dumps(response))

    async def broadcast_status(self):
        """Broadcast system status to all connected clients"""
        if not self.clients:
            return
            
        status_data = {
            "id": self.generate_id(),
            "status": "success",
            "data": {
                "status": self.get_server_status()
            },
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
        message = json.dumps(status_data)
        
        await asyncio.gather(
            *[client.send(message) for client in self.clients],
            return_exceptions=True
        )

    async def status_broadcast_loop(self):
        """Periodically broadcast system status to all clients"""
        while self.running:
            await self.broadcast_status()
            await asyncio.sleep(STATUS_BROADCAST_INTERVAL)

    async def handle_client(self, websocket: websockets.WebSocketServerProtocol):
        """Handle messages from a client connection"""
        await self.register_client(websocket)
        try:
            async for message in websocket:
                try:
                    command = json.loads(message)
                    logger.info(f"Received command: {command}")
                    
                    command_id = command.get('id')
                    command_type = command.get('type')
                    params = command.get('params', {})
                    
                    if not command_id or not command_type:
                        await self.send_error(websocket, command_id, "Invalid command format")
                        continue
                    
                    # Process the command
                    response = await self.command_handler.handle_command(
                        websocket, command_type, params, command_id
                    )
                    
                    # Send response if the command handler didn't already do so
                    if response:
                        await websocket.send(json.dumps(response))
                        
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON received: {message}")
                    await self.send_error(websocket, None, "Invalid JSON format")
                except Exception as e:
                    logger.exception(f"Error handling message: {e}")
                    await self.send_error(websocket, None, f"Internal server error: {str(e)}")
        except websockets.exceptions.ConnectionClosed:
            logger.info("Connection closed")
        finally:
            await self.unregister_client(websocket)

    async def send_error(self, websocket: websockets.WebSocketServerProtocol, command_id: Optional[str], error_message: str):
        """Send an error response to a client"""
        response = {
            "id": command_id or self.generate_id(),
            "status": "error",
            "error": error_message,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
        await websocket.send(json.dumps(response))

    def get_server_status(self) -> Dict[str, Any]:
        """Get the current server status"""
        return {
            "connected": True,
            "activeGame": self.game_manager.get_current_game_title(),
            "gameRunning": self.game_manager.is_game_running(),
            "isPaused": self.session_manager.is_paused(),
            "timeRemaining": self.session_manager.get_time_remaining(),
            "cpuUsage": self.system_monitor.get_cpu_usage(),
            "memoryUsage": self.system_monitor.get_memory_usage(),
            "diskSpace": self.system_monitor.get_disk_space()
        }

    def generate_id(self) -> str:
        """Generate a unique ID for messages"""
        timestamp = int(datetime.now().timestamp() * 1000)
        random_suffix = os.urandom(4).hex()
        return f"{timestamp}-{random_suffix}"

    async def start(self):
        """Start the WebSocket server"""
        self.running = True
        self.system_monitor.start()
        
        # Start the status broadcast task
        self.status_task = asyncio.create_task(self.status_broadcast_loop())
        
        # Start the websocket server
        async with websockets.serve(self.handle_client, HOST, PORT):
            logger.info(f"Server started on ws://{HOST}:{PORT}")
            
            # Keep the server running until stopped
            stop = asyncio.Future()
            await stop
            
    async def stop(self):
        """Stop the server gracefully"""
        logger.info("Shutting down server...")
        self.running = False
        
        # Stop the status broadcast task
        if self.status_task:
            self.status_task.cancel()
            try:
                await self.status_task
            except asyncio.CancelledError:
                pass
        
        # End any active game session
        if self.game_manager.is_game_running():
            self.game_manager.end_game()
        
        # Stop the system monitor
        self.system_monitor.stop()
        
        # Close all client connections
        if self.clients:
            close_tasks = [client.close() for client in self.clients]
            await asyncio.gather(*close_tasks, return_exceptions=True)
            self.clients.clear()
        
        logger.info("Server shutdown complete")


async def main():
    """Main entry point for the server"""
    server = WebSocketServer()
    
    # Set up signal handlers for graceful shutdown
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, lambda: asyncio.create_task(server.stop()))
    
    try:
        await server.start()
    except Exception as e:
        logger.exception(f"Server error: {e}")
    finally:
        await server.stop()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.exception(f"Fatal error: {e}")
        sys.exit(1)
