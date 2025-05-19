
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, Callable

import websockets

class CommandHandler:
    """Handle incoming commands and route them to appropriate handlers"""
    
    def __init__(self, game_manager, session_manager, system_monitor, logger):
        self.game_manager = game_manager
        self.session_manager = session_manager
        self.system_monitor = system_monitor
        self.logger = logger
        
        # Register command handlers
        self.command_handlers = {
            "launchGame": self.handle_launch_game,
            "endSession": self.handle_end_session,
            "pauseSession": self.handle_pause_session,
            "resumeSession": self.handle_resume_session,
            "getStatus": self.handle_get_status,
            "heartbeat": self.handle_heartbeat,
        }
    
    async def handle_command(
        self, 
        websocket: websockets.WebSocketServerProtocol,
        command_type: str, 
        params: Dict[str, Any], 
        command_id: str
    ) -> Optional[Dict[str, Any]]:
        """Route commands to appropriate handler"""
        handler = self.command_handlers.get(command_type)
        
        if not handler:
            return self.create_error_response(
                command_id, 
                f"Unknown command: {command_type}"
            )
        
        try:
            response = await handler(websocket, params, command_id)
            return response
        except Exception as e:
            self.logger.exception(f"Error handling command {command_type}: {e}")
            return self.create_error_response(
                command_id, 
                f"Error processing command {command_type}: {str(e)}"
            )
    
    async def handle_launch_game(
        self, 
        websocket: websockets.WebSocketServerProtocol, 
        params: Dict[str, Any], 
        command_id: str
    ) -> Dict[str, Any]:
        """Launch a game"""
        game_id = params.get("gameId")
        session_duration = params.get("sessionDuration", 300)
        
        if not game_id:
            return self.create_error_response(command_id, "Game ID is required")
        
        self.logger.info(f"Launching game {game_id} with duration {session_duration} seconds")
        
        # Launch the game
        success, game_info = self.game_manager.launch_game(game_id)
        if not success:
            return self.create_error_response(
                command_id, 
                f"Failed to launch game {game_id}"
            )
        
        # Start the session timer
        self.session_manager.start_timer(session_duration)
        
        # Return success response
        return self.create_success_response(command_id, {
            "gameId": game_id,
            "title": game_info["title"],
            "running": True,
        })
    
    async def handle_end_session(
        self, 
        websocket: websockets.WebSocketServerProtocol, 
        params: Dict[str, Any], 
        command_id: str
    ) -> Dict[str, Any]:
        """End the current session"""
        self.logger.info("Ending session")
        
        was_running = self.game_manager.is_game_running()
        
        # End the game and stop the timer
        self.game_manager.end_game()
        self.session_manager.stop_timer()
        
        return self.create_success_response(command_id, {
            "wasRunning": was_running,
            "message": "Session ended successfully"
        })
    
    async def handle_pause_session(
        self, 
        websocket: websockets.WebSocketServerProtocol, 
        params: Dict[str, Any], 
        command_id: str
    ) -> Dict[str, Any]:
        """Pause the current session"""
        self.logger.info("Pausing session")
        
        if not self.game_manager.is_game_running():
            return self.create_error_response(
                command_id, 
                "No active session to pause"
            )
        
        success = self.session_manager.pause_timer()
        if not success:
            return self.create_error_response(
                command_id, 
                "Failed to pause session"
            )
        
        return self.create_success_response(command_id, {
            "paused": True,
            "timeRemaining": self.session_manager.get_time_remaining()
        })
    
    async def handle_resume_session(
        self, 
        websocket: websockets.WebSocketServerProtocol, 
        params: Dict[str, Any], 
        command_id: str
    ) -> Dict[str, Any]:
        """Resume the current session"""
        self.logger.info("Resuming session")
        
        if not self.game_manager.is_game_running():
            return self.create_error_response(
                command_id, 
                "No active session to resume"
            )
        
        success = self.session_manager.resume_timer()
        if not success:
            return self.create_error_response(
                command_id, 
                "Failed to resume session"
            )
        
        return self.create_success_response(command_id, {
            "paused": False,
            "timeRemaining": self.session_manager.get_time_remaining()
        })
    
    async def handle_get_status(
        self, 
        websocket: websockets.WebSocketServerProtocol, 
        params: Dict[str, Any], 
        command_id: str
    ) -> Dict[str, Any]:
        """Get the current server status"""
        self.logger.info("Getting status")
        
        # Collect status from all components
        status = {
            "connected": True,
            "activeGame": self.game_manager.get_current_game_title(),
            "gameRunning": self.game_manager.is_game_running(),
            "isPaused": self.session_manager.is_paused(),
            "timeRemaining": self.session_manager.get_time_remaining(),
            "cpuUsage": self.system_monitor.get_cpu_usage(),
            "memoryUsage": self.system_monitor.get_memory_usage(),
            "diskSpace": self.system_monitor.get_disk_space(),
        }
        
        return self.create_success_response(command_id, {"status": status})
    
    async def handle_heartbeat(
        self, 
        websocket: websockets.WebSocketServerProtocol, 
        params: Dict[str, Any], 
        command_id: str
    ) -> Dict[str, Any]:
        """Handle heartbeat to keep connection alive"""
        return self.create_success_response(command_id, {
            "timestamp": int(datetime.now().timestamp() * 1000)
        })
    
    def create_success_response(self, command_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a success response"""
        return {
            "id": command_id,
            "status": "success",
            "data": data,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
    
    def create_error_response(self, command_id: str, error_message: str) -> Dict[str, Any]:
        """Create an error response"""
        return {
            "id": command_id,
            "status": "error",
            "error": error_message,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
