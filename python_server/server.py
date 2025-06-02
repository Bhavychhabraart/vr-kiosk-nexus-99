#!/usr/bin/env python3
import asyncio
import json
import logging
import os
import signal
import sys
from datetime import datetime
from typing import Dict, Set, Any, Optional, List
import ipaddress

import websockets
from dotenv import load_dotenv

from command_handler import CommandHandler
from game_manager import GameManager
from session_manager import SessionManager
from system_monitor import SystemMonitor
from database import Database

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
DATABASE_PATH = os.getenv("VR_DATABASE", "vr_kiosk.db")
STATUS_BROADCAST_INTERVAL = int(os.getenv("VR_STATUS_INTERVAL", "5"))  # seconds
MAX_CLIENTS = int(os.getenv("VR_MAX_CLIENTS", "10"))
ALLOWED_HOSTS = os.getenv("VR_ALLOWED_HOSTS", "").split(",")  # comma-separated list of allowed IPs


class WebSocketServer:
    """Main WebSocket server class that handles client connections and messages"""

    def __init__(self):
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.database = Database(DATABASE_PATH, logger)
        self.system_monitor = SystemMonitor(logger)
        self.game_manager = GameManager(GAMES_CONFIG_PATH, self.database, logger)
        self.session_manager = SessionManager(logger, self.broadcast_status)
        
        # Set up game manager status callback
        self.game_manager.set_status_callback(self.broadcast_status)
        
        self.command_handler = CommandHandler(
            self.game_manager, 
            self.session_manager, 
            self.system_monitor,
            self.database,
            logger
        )
        self.running = False
        self.status_task = None
        self.client_info = {}  # Store client connection information

    async def register_client(self, websocket: websockets.WebSocketServerProtocol):
        """Register a new client connection"""
        # Check if max clients reached
        if len(self.clients) >= MAX_CLIENTS:
            logger.warning(f"Max clients reached ({MAX_CLIENTS}), rejecting connection")
            await websocket.close(1008, "Maximum number of connections reached")
            return False
        
        # Get client IP
        client_ip = websocket.remote_address[0]
        
        # Check if client IP is allowed
        if ALLOWED_HOSTS and ALLOWED_HOSTS[0]:  # If allowed hosts is specified and not empty
            ip_allowed = False
            
            try:
                # Check if the client IP matches any allowed IP or subnet
                client_ip_obj = ipaddress.ip_address(client_ip)
                
                for allowed in ALLOWED_HOSTS:
                    if not allowed:  # Skip empty entries
                        continue
                        
                    try:
                        # Try to parse as network
                        if '/' in allowed:
                            network = ipaddress.ip_network(allowed, strict=False)
                            if client_ip_obj in network:
                                ip_allowed = True
                                break
                        # Try to parse as single IP
                        else:
                            allowed_ip = ipaddress.ip_address(allowed)
                            if client_ip_obj == allowed_ip:
                                ip_allowed = True
                                break
                    except ValueError:
                        logger.warning(f"Invalid IP or subnet in allowed hosts: {allowed}")
                        continue
            except ValueError:
                logger.warning(f"Could not parse client IP: {client_ip}")
                
            if not ip_allowed:
                logger.warning(f"Connection from unauthorized IP: {client_ip}")
                await websocket.close(1008, "Connection not allowed from this IP address")
                return False
        
        # Store client information
        self.clients.add(websocket)
        client_info = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        self.client_info[websocket] = {
            'ip': websocket.remote_address[0],
            'port': websocket.remote_address[1],
            'connected_at': datetime.now(),
            'messages_received': 0,
            'messages_sent': 0,
        }
        
        logger.info(f"Client connected: {client_info}")
        
        # Send initial welcome message and status
        await self.send_welcome_message(websocket)
        return True

    async def unregister_client(self, websocket: websockets.WebSocketServerProtocol):
        """Unregister a client connection"""
        self.clients.remove(websocket)
        client_info = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        
        # Remove client info
        if websocket in self.client_info:
            info = self.client_info[websocket]
            connected_duration = datetime.now() - info['connected_at']
            logger.info(f"Client {client_info} disconnected after {connected_duration.total_seconds():.1f}s, " +
                       f"messages: {info['messages_received']} received, {info['messages_sent']} sent")
            del self.client_info[websocket]
        else:
            logger.info(f"Client disconnected: {client_info}")

    async def send_welcome_message(self, websocket: websockets.WebSocketServerProtocol):
        """Send welcome message with server status to new client"""
        response = {
            "id": self.generate_id(),
            "status": "success",
            "data": {
                "status": self.get_server_status(),
                "message": "Connected to VR Command Center",
                "serverVersion": "1.1.0",
                "serverTime": datetime.now().isoformat()
            },
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
        await websocket.send(json.dumps(response))
        
        # Update message counter
        if websocket in self.client_info:
            self.client_info[websocket]['messages_sent'] += 1

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
        
        logger.debug(f"Broadcasting status: {status_data['data']['status']}")
        
        # Send to all clients
        for client in self.clients.copy():  # Use copy to avoid modification during iteration
            try:
                await client.send(message)
                if client in self.client_info:
                    self.client_info[client]['messages_sent'] += 1
            except websockets.exceptions.ConnectionClosed:
                logger.debug(f"Client already closed during broadcast")
                # Client will be removed in handle_client
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")

    async def status_broadcast_loop(self):
        """Periodically broadcast system status to all clients"""
        while self.running:
            try:
                await self.broadcast_status()
                await asyncio.sleep(STATUS_BROADCAST_INTERVAL)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in status broadcast loop: {e}")
                await asyncio.sleep(1)  # Avoid tight loop on error

    async def handle_client(self, websocket: websockets.WebSocketServerProtocol):
        """Handle messages from a client connection"""
        if not await self.register_client(websocket):
            return  # Registration failed
            
        try:
            async for message in websocket:
                try:
                    # Update message counter
                    if websocket in self.client_info:
                        self.client_info[websocket]['messages_received'] += 1
                    
                    # Parse the message
                    command = json.loads(message)
                    logger.info(f"Received command: {command.get('type')} (id: {command.get('id')})")
                    
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
                        if websocket in self.client_info:
                            self.client_info[websocket]['messages_sent'] += 1
                        
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON received: {message}")
                    await self.send_error(websocket, None, "Invalid JSON format")
                except asyncio.CancelledError:
                    raise  # Allow cancellation to propagate
                except Exception as e:
                    logger.exception(f"Error handling message: {e}")
                    await self.send_error(websocket, None, f"Internal server error: {str(e)}")
        except websockets.exceptions.ConnectionClosed as e:
            logger.info(f"Connection closed: {e}")
        except Exception as e:
            logger.exception(f"Unexpected error in client handler: {e}")
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
        if websocket in self.client_info:
            self.client_info[websocket]['messages_sent'] += 1

    def get_server_status(self) -> Dict[str, Any]:
        """Get the current server status"""
        game_status = self.game_manager.get_status()
        
        status = {
            "connected": True,
            "activeGame": self.game_manager.get_current_game_title(),
            "gameRunning": game_status.get("running", False),
            "demoMode": game_status.get("demo_mode", False),
            "processRunning": game_status.get("process_running", False),
            "isPaused": self.session_manager.is_paused(),
            "timeRemaining": self.session_manager.get_time_remaining(),
            "cpuUsage": self.system_monitor.get_cpu_usage(),
            "memoryUsage": self.system_monitor.get_memory_usage(),
            "diskSpace": self.system_monitor.get_disk_space(),
            "serverUptime": self.system_monitor.get_system_uptime(),
            "connectedClients": len(self.clients),
            "alerts": self.system_monitor.get_recent_alerts(3)  # Get last 3 alerts
        }
        
        # Add VR runtime status if game failed to start
        if game_status.get("demo_mode"):
            status["vrRuntimeStatus"] = "not_available"
            status["alerts"] = status.get("alerts", []) + [{
                "type": "warning",
                "message": "VR runtime not available - running in demo mode",
                "timestamp": datetime.now().isoformat()
            }]
        
        return status

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
        async with websockets.serve(self.handle_client, HOST, PORT,
                                   ping_interval=30,  # Send ping every 30 seconds
                                   ping_timeout=10,   # Wait 10 seconds for pong
                                   max_size=1048576,  # Max message size: 1MB
                                   max_queue=32):     # Max pending messages
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
        
        # Close database connection
        self.database.close()
        
        # Close all client connections
        if self.clients:
            close_tasks = [client.close(1001, "Server shutting down") for client in self.clients]
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
