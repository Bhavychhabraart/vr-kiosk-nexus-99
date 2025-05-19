
import asyncio
import json
import logging
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

class ResponseStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    PARTIAL = "partial"

class CommandHandler:
    """Handles commands received from WebSocket clients"""
    
    def __init__(self, game_manager, session_manager, system_monitor, logger):
        self.game_manager = game_manager
        self.session_manager = session_manager
        self.system_monitor = system_monitor
        self.logger = logger
        self.ratings_db = {}  # Simple in-memory storage for ratings
        
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
            else:
                return self.create_error_response(
                    command_id, f"Unknown command type: {command_type}"
                )
        except Exception as e:
            self.logger.exception(f"Error handling command {command_type}: {e}")
            return self.create_error_response(command_id, f"Command error: {str(e)}")
            
    async def handle_launch_game(self, websocket, params, command_id):
        """Launch a VR game"""
        game_id = params.get('gameId')
        session_duration = params.get('sessionDuration')
        
        if not game_id:
            return self.create_error_response(command_id, "Missing gameId parameter")
            
        # Ensure session_duration is valid
        try:
            session_duration = int(session_duration)
        except (TypeError, ValueError):
            # Use default if not specified or invalid
            session_duration = None
            
        try:
            # Launch the game
            success = self.game_manager.launch_game(game_id)
            if success:
                # Start a session
                self.session_manager.start_session(game_id, session_duration)
                
                return {
                    "id": command_id,
                    "status": ResponseStatus.SUCCESS,
                    "data": {
                        "gameId": game_id,
                        "sessionDuration": self.session_manager.get_session_duration(),
                        "message": f"Game {game_id} launched successfully"
                    },
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }
            else:
                return self.create_error_response(
                    command_id, f"Failed to launch game {game_id}"
                )
        except Exception as e:
            self.logger.exception(f"Error launching game {game_id}: {e}")
            return self.create_error_response(command_id, f"Launch error: {str(e)}")
    
    async def handle_end_session(self, websocket, command_id):
        """End the current game session"""
        if not self.game_manager.is_game_running():
            return self.create_error_response(command_id, "No active game session")
            
        try:
            game_id = self.game_manager.get_current_game()
            session_time = self.session_manager.end_session()
            self.game_manager.end_game()
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "gameId": game_id,
                    "sessionTime": session_time,
                    "message": "Game session ended successfully"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error ending session: {e}")
            return self.create_error_response(command_id, f"End session error: {str(e)}")
    
    async def handle_pause_session(self, websocket, command_id):
        """Pause the current game session"""
        if not self.game_manager.is_game_running():
            return self.create_error_response(command_id, "No active game session")
            
        if self.session_manager.is_paused():
            return self.create_error_response(command_id, "Session is already paused")
            
        try:
            self.session_manager.pause_session()
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "paused": True,
                    "timeRemaining": self.session_manager.get_time_remaining(),
                    "message": "Session paused"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error pausing session: {e}")
            return self.create_error_response(command_id, f"Pause error: {str(e)}")
    
    async def handle_resume_session(self, websocket, command_id):
        """Resume the current game session"""
        if not self.game_manager.is_game_running():
            return self.create_error_response(command_id, "No active game session")
            
        if not self.session_manager.is_paused():
            return self.create_error_response(command_id, "Session is not paused")
            
        try:
            self.session_manager.resume_session()
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "paused": False,
                    "timeRemaining": self.session_manager.get_time_remaining(),
                    "message": "Session resumed"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error resuming session: {e}")
            return self.create_error_response(command_id, f"Resume error: {str(e)}")
    
    async def handle_get_status(self, websocket, command_id):
        """Get the current system status"""
        status = {
            "connected": True,
            "gameRunning": self.game_manager.is_game_running(),
            "activeGame": self.game_manager.get_current_game(),
            "activeGameTitle": self.game_manager.get_current_game_title(),
            "isPaused": self.session_manager.is_paused(),
            "timeRemaining": self.session_manager.get_time_remaining(),
            "cpuUsage": self.system_monitor.get_cpu_usage(),
            "memoryUsage": self.system_monitor.get_memory_usage(),
            "diskSpace": self.system_monitor.get_disk_space(),
        }
        
        return {
            "id": command_id,
            "status": ResponseStatus.SUCCESS,
            "data": {
                "status": status
            },
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
    
    async def handle_heartbeat(self, websocket, command_id):
        """Handle heartbeat from client"""
        return {
            "id": command_id,
            "status": ResponseStatus.SUCCESS,
            "data": {
                "timestamp": int(datetime.now().timestamp() * 1000)
            },
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
    
    async def handle_submit_rating(self, websocket, params, command_id):
        """Handle game rating submission"""
        game_id = params.get('gameId')
        rating = params.get('rating')
        
        if not game_id:
            return self.create_error_response(command_id, "Missing gameId parameter")
            
        try:
            rating = int(rating)
            if not (1 <= rating <= 5):
                return self.create_error_response(command_id, "Rating must be between 1 and 5")
        except (TypeError, ValueError):
            return self.create_error_response(command_id, "Invalid rating value")
            
        try:
            # Store the rating (in a real app, this would go to a database)
            if game_id not in self.ratings_db:
                self.ratings_db[game_id] = []
            
            self.ratings_db[game_id].append({
                'rating': rating,
                'timestamp': datetime.now().isoformat()
            })
            
            # Log the rating
            self.logger.info(f"Rating of {rating} submitted for game {game_id}")
            
            # Calculate average rating for this game
            avg_rating = sum(r['rating'] for r in self.ratings_db[game_id]) / len(self.ratings_db[game_id])
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "gameId": game_id,
                    "rating": rating,
                    "avgRating": avg_rating,
                    "message": "Rating submitted successfully"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error submitting rating: {e}")
            return self.create_error_response(command_id, f"Rating error: {str(e)}")
    
    def create_error_response(self, command_id, error_message):
        """Create an error response"""
        return {
            "id": command_id,
            "status": ResponseStatus.ERROR,
            "error": error_message,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
