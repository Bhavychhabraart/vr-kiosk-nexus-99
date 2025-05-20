
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
    SCAN_RFID = "scanRfid"
    VALIDATE_RFID = "validateRfid"

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
            elif command_type == CommandType.SCAN_RFID:
                return await self.handle_scan_rfid(websocket, params, command_id)
            elif command_type == CommandType.VALIDATE_RFID:
                return await self.handle_validate_rfid(websocket, params, command_id)
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
        rfid_tag = params.get('rfidTag')
        
        if not game_id:
            return self.create_error_response(command_id, "Missing gameId parameter")
            
        # Ensure session_duration is valid
        try:
            session_duration = int(session_duration)
            if session_duration <= 0:
                raise ValueError("Duration must be positive")
        except (TypeError, ValueError) as e:
            return self.create_error_response(command_id, f"Invalid session duration: {str(e)}")
        
        # Validate RFID if provided
        if rfid_tag:
            rfid_data = self.database.validate_rfid(rfid_tag)
            if not rfid_data:
                return self.create_error_response(command_id, f"Invalid or inactive RFID tag: {rfid_tag}")
            
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
                session_duration,
                rfid_tag
            )
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "gameId": game_id,
                    "gameTitle": game.get('title'),
                    "sessionId": self.current_session_id,
                    "sessionDuration": session_duration,
                    "rfidTag": rfid_tag,
                    "message": f"Game {game.get('title')} launched successfully"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        except Exception as e:
            self.logger.exception(f"Error launching game {game_id}: {e}")
            return self.create_error_response(command_id, f"Launch error: {str(e)}")
    
    async def handle_end_session(self, websocket, command_id):
        """End the current game session"""
        if not self.game_manager.is_game_running():
            return self.create_error_response(command_id, "No active game session")
            
        try:
            game_id = self.game_manager.get_current_game_id()
            time_remaining = self.session_manager.get_time_remaining()
            
            # Stop the timer
            self.session_manager.stop_timer()
            
            # End the game
            self.game_manager.end_game()
            
            # Update the database if we have a current session
            if self.current_session_id:
                self.database.end_session(self.current_session_id)
                session_id = self.current_session_id
                self.current_session_id = None
            else:
                session_id = None
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "gameId": game_id,
                    "sessionId": session_id,
                    "timeRemaining": time_remaining,
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
            success = self.session_manager.pause_timer()
            
            if not success:
                return self.create_error_response(command_id, "Failed to pause session")
            
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
            success = self.session_manager.resume_timer()
            
            if not success:
                return self.create_error_response(command_id, "Failed to resume session")
            
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
        try:
            active_game_id = self.game_manager.get_current_game_id()
            active_game_title = self.game_manager.get_current_game_title()
            
            status = {
                "connected": True,
                "gameRunning": self.game_manager.is_game_running(),
                "activeGame": active_game_id,
                "activeGameTitle": active_game_title,
                "isPaused": self.session_manager.is_paused(),
                "timeRemaining": self.session_manager.get_time_remaining(),
                "cpuUsage": self.system_monitor.get_cpu_usage(),
                "memoryUsage": self.system_monitor.get_memory_usage(),
                "diskSpace": self.system_monitor.get_disk_space(),
                "sessionId": self.current_session_id
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
        if not params:
            return self.create_error_response(command_id, "Missing parameters")
            
        game_id = params.get('gameId')
        rating = params.get('rating')
        rfid_tag = params.get('rfidTag')
        
        if not game_id:
            return self.create_error_response(command_id, "Missing gameId parameter")
            
        try:
            rating = int(rating)
            if not (1 <= rating <= 5):
                return self.create_error_response(command_id, "Rating must be between 1 and 5")
        except (TypeError, ValueError):
            return self.create_error_response(command_id, "Invalid rating value")
            
        try:
            # Update rating in database if we have a current session
            if self.current_session_id:
                self.database.end_session(self.current_session_id, rating)
                session_id = self.current_session_id
                self.current_session_id = None
                
                # Log the successful rating
                self.logger.info(f"Rating of {rating} submitted for session {session_id}, game {game_id}")
                
                return {
                    "id": command_id,
                    "status": ResponseStatus.SUCCESS,
                    "data": {
                        "gameId": game_id,
                        "rating": rating,
                        "sessionId": session_id,
                        "rfidTag": rfid_tag,
                        "message": "Rating submitted successfully"
                    },
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }
            else:
                # No active session, just report success but log a warning
                self.logger.warning(f"Rating of {rating} submitted for game {game_id} but no active session found")
                
                return {
                    "id": command_id,
                    "status": ResponseStatus.SUCCESS,
                    "data": {
                        "gameId": game_id,
                        "rating": rating,
                        "message": "Rating submitted but no active session found"
                    },
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }
                
        except Exception as e:
            self.logger.exception(f"Error submitting rating: {e}")
            return self.create_error_response(command_id, f"Rating error: {str(e)}")
    
    async def handle_scan_rfid(self, websocket, params, command_id):
        """Handle RFID card scan event"""
        if not params:
            return self.create_error_response(command_id, "Missing parameters")
            
        tag_id = params.get('tagId')
        
        if not tag_id:
            return self.create_error_response(command_id, "Missing tagId parameter")
        
        try:
            # Validate the RFID tag
            rfid_data = self.database.validate_rfid(tag_id)
            
            if rfid_data:
                return {
                    "id": command_id,
                    "status": ResponseStatus.SUCCESS,
                    "data": {
                        "tagId": tag_id,
                        "name": rfid_data.get('name'),
                        "status": rfid_data.get('status'),
                        "valid": True,
                        "message": f"Valid RFID tag: {tag_id}"
                    },
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }
            else:
                # Tag not found or not active
                return {
                    "id": command_id,
                    "status": ResponseStatus.SUCCESS,
                    "data": {
                        "tagId": tag_id,
                        "valid": False,
                        "message": f"Invalid or unknown RFID tag: {tag_id}"
                    },
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }
        except Exception as e:
            self.logger.exception(f"Error scanning RFID: {e}")
            return self.create_error_response(command_id, f"RFID scan error: {str(e)}")
    
    async def handle_validate_rfid(self, websocket, params, command_id):
        """Validate an RFID tag for access"""
        if not params:
            return self.create_error_response(command_id, "Missing parameters")
            
        tag_id = params.get('tagId')
        game_id = params.get('gameId')
        
        if not tag_id:
            return self.create_error_response(command_id, "Missing tagId parameter")
        
        try:
            # Validate the RFID tag
            rfid_data = self.database.validate_rfid(tag_id)
            
            if not rfid_data:
                return {
                    "id": command_id,
                    "status": ResponseStatus.ERROR,
                    "error": f"Invalid or unknown RFID tag: {tag_id}",
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }
            
            # For now, any valid card can access any game
            # In a real system, you'd check permissions here
            
            return {
                "id": command_id,
                "status": ResponseStatus.SUCCESS,
                "data": {
                    "tagId": tag_id,
                    "name": rfid_data.get('name'),
                    "gameId": game_id,
                    "authorized": True,
                    "message": "RFID validated successfully"
                },
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
            
        except Exception as e:
            self.logger.exception(f"Error validating RFID: {e}")
            return self.create_error_response(command_id, f"RFID validation error: {str(e)}")
    
    def create_error_response(self, command_id, error_message):
        """Create an error response"""
        return {
            "id": command_id,
            "status": ResponseStatus.ERROR,
            "error": error_message,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
