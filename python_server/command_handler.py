
import asyncio
import json
import logging
import uuid
from enum import Enum
from datetime import datetime
from typing import Dict, Any, Optional, List

import websockets

class CommandType(str, Enum):
    LAUNCH_GAME = "launchGame"
    END_SESSION = "endSession"
    PAUSE_SESSION = "pauseSession"
    RESUME_SESSION = "resumeSession"
    GET_STATUS = "getStatus"
    HEARTBEAT = "heartbeat"
    SUBMIT_RATING = "submitRating"
    GET_DIAGNOSTICS = "getDiagnostics"

class ResponseStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    PARTIAL = "partial"

class CommandHandler:
    """Handles commands received from WebSocket clients"""
    
    def __init__(self, game_manager, session_manager, system_monitor, database, logger):
        self.game_manager = game_manager
        self.session_manager = session_manager
        self.system_monitor = system_monitor
        self.database = database
        self.logger = logger
        self.current_session_id = None
        
    async def handle_command(self, websocket, command_type, params, command_id):
        """Process a command from a client and return a response"""
        try:
            if command_type == CommandType.LAUNCH_GAME:
                return await self.handle_launch_game(websocket, params, command_id)
            elif command_type == CommandType.END_SESSION:
                return await self.handle_end_session(websocket, command_id)
            elif command_type == CommandType.PAUSE_SESSION:
                return await self.handle_pause_session(websocket, command_id)
            elif command_type == CommandType.RESUME_SESSION:
                return await self.handle_resume_session(websocket, command_id)
            elif command_type == CommandType.GET_STATUS:
                return await self.handle_get_status(websocket, command_id)
            elif command_type == CommandType.HEARTBEAT:
                return await self.handle_heartbeat(websocket, command_id)
            elif command_type == CommandType.SUBMIT_RATING:
                return await self.handle_submit_rating(websocket, params, command_id)
            elif command_type == CommandType.GET_DIAGNOSTICS:
                return await self.handle_get_diagnostics(websocket, command_id)
            else:
                return self.create_error_response(
                    command_id, f"Unknown command type: {command_type}"
                )
        except Exception as e:
            self.logger.exception(f"Error handling command {command_type}: {e}")
            return self.create_error_response(command_id, f"Command error: {str(e)}")
            
    async def handle_launch_game(self, websocket, params, command_id):
        """Launch a VR game"""
        if not params:
            return self.create_error_response(command_id, "Missing parameters")
            
        game_id = params.get('gameId')
        session_duration = params.get('sessionDuration')
        
        if not game_id:
            return self.create_error_response(command_id, "Missing gameId parameter")
            
        # Ensure session_duration is valid
        try:
            session_duration = int(session_duration)
            if session_duration <= 0:
                raise ValueError("Duration must be positive")
        except (TypeError, ValueError) as e:
            return self.create_error_response(command_id, f"Invalid session duration: {str(e)}")
        
        try:
            # Get game data
            game = self.database.get_game(game_id)
            if not game:
                return self.create_error_response(command_id, f"Game with ID {game_id} not found")
            
            # Validate session duration
            min_duration = game.get('min_duration_seconds', 300)
            max_duration = game.get('max_duration_seconds', 1800)
            
            if session_duration < min_duration:
                session_duration = min_duration
                self.logger.warning(f"Session duration adjusted to minimum: {min_duration}")
            elif session_duration > max_duration:
                session_duration = max_duration
                self.logger.warning(f"Session duration adjusted to maximum: {max_duration}")
            
            # Launch the game
            success, _ = self.game_manager.launch_game(game_id)
            if not success:
                return self.create_error_response(command_id, f"Failed to launch game {game_id}")
            
            # Start a session timer
            self.session_manager.start_timer(session_duration)
            
            # Record in database
            self.current_session_id = self.database.start_session(
                game_id, 
                session_duration
            )
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "gameId": game_id,
                    "gameTitle": game.get('title'),
                    "sessionId": self.current_session_id,
                    "sessionDuration": session_duration,
                    "message": f"Game {game.get('title')} launched successfully"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error launching game {game_id}: {e}")
            return self.create_error_response(command_id, f"Launch error: {str(e)}")
    
    async def handle_end_session(self, websocket, command_id):
        """End the current game session"""
        try:
            # End the current game
            success = self.game_manager.end_current_game()
            if not success:
                self.logger.warning("No active game to end")
            
            # Stop the session timer
            self.session_manager.stop_timer()
            
            # Update database record
            if self.current_session_id:
                self.database.end_session(self.current_session_id)
                self.current_session_id = None
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "message": "Session ended successfully"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error ending session: {e}")
            return self.create_error_response(command_id, f"End session error: {str(e)}")
    
    async def handle_pause_session(self, websocket, command_id):
        """Pause the current session"""
        try:
            success = self.session_manager.pause_timer()
            if not success:
                return self.create_error_response(command_id, "No active session to pause")
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "message": "Session paused successfully"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error pausing session: {e}")
            return self.create_error_response(command_id, f"Pause error: {str(e)}")
    
    async def handle_resume_session(self, websocket, command_id):
        """Resume the current session"""
        try:
            success = self.session_manager.resume_timer()
            if not success:
                return self.create_error_response(command_id, "No paused session to resume")
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "message": "Session resumed successfully"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error resuming session: {e}")
            return self.create_error_response(command_id, f"Resume error: {str(e)}")
    
    async def handle_get_status(self, websocket, command_id):
        """Get current system status"""
        try:
            game_status = self.game_manager.get_status()
            session_status = self.session_manager.get_status()
            system_metrics = self.system_monitor.get_metrics()
            
            status = {
                "connected": True,
                "gameRunning": game_status.get("running", False),
                "activeGame": game_status.get("current_game"),
                "isPaused": session_status.get("paused", False),
                "timeRemaining": session_status.get("time_remaining", 0),
                "cpuUsage": system_metrics.get("cpu_percent", 0),
                "memoryUsage": system_metrics.get("memory_percent", 0),
                "diskSpace": system_metrics.get("disk_percent", 0),
                "serverUptime": system_metrics.get("uptime", 0),
                "connectedClients": len(websocket.clients) if hasattr(websocket, 'clients') else 1,
                "alerts": system_metrics.get("alerts", [])
            }
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "status": status
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error getting status: {e}")
            return self.create_error_response(command_id, f"Status error: {str(e)}")
    
    async def handle_heartbeat(self, websocket, command_id):
        """Handle heartbeat ping"""
        return {
            "id": command_id,
            "status": ResponseStatus.SUCCESS,
            "data": {
                "message": "pong",
                "timestamp": int(datetime.now().timestamp() * 1000)
            },
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
    
    async def handle_submit_rating(self, websocket, params, command_id):
        """Submit a game rating"""
        if not params:
            return self.create_error_response(command_id, "Missing parameters")
        
        game_id = params.get('gameId')
        rating = params.get('rating')
        
        if not game_id or rating is None:
            return self.create_error_response(command_id, "Missing gameId or rating")
        
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                return self.create_error_response(command_id, "Rating must be between 1 and 5")
        except (TypeError, ValueError):
            return self.create_error_response(command_id, "Invalid rating value")
        
        try:
            # Record rating in database
            if self.current_session_id:
                self.database.end_session(self.current_session_id, rating)
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "message": "Rating submitted successfully",
                    "gameId": game_id,
                    "rating": rating
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error submitting rating: {e}")
            return self.create_error_response(command_id, f"Rating error: {str(e)}")
    
    async def handle_get_diagnostics(self, websocket, command_id):
        """Get system diagnostics"""
        try:
            diagnostics = self.system_monitor.get_detailed_metrics()
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": diagnostics,
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error getting diagnostics: {e}")
            return self.create_error_response(command_id, f"Diagnostics error: {str(e)}")
    
    def create_error_response(self, command_id: str, error_message: str) -> dict:
        """Create a standardized error response"""
        return {
            "id": command_id,
            "status": ResponseStatus.ERROR,
            "error": error_message,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
