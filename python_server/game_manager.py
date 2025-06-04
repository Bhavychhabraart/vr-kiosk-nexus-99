import json
import logging
import os
import subprocess
import time
import threading
from typing import Dict, Any, Tuple, Optional, List

class GameManager:
    """Manages VR games and their processes"""
    
    def __init__(self, config_path: str, database, logger):
        self.logger = logger
        self.config_path = config_path
        self.database = database
        self.current_game_id: Optional[str] = None
        self.current_game_process: Optional[subprocess.Popen] = None
        self.games_cache: Dict[str, Dict[str, Any]] = {}
        self.status_callback: Optional[callable] = None
        self.process_monitor_thread: Optional[threading.Thread] = None
        self.process_monitor_running = False
        self.game_launch_status = "idle"  # idle, launching, running, failed
        
        # Load game configurations from database
        self.load_games()
    
    def set_status_callback(self, callback):
        """Set callback for status updates"""
        self.status_callback = callback
    
    def load_games(self):
        """Load game configurations from database"""
        try:
            games = self.database.get_games()
            self.games_cache = {game['id']: game for game in games}
            self.logger.info(f"Loaded {len(self.games_cache)} games from database")
        except Exception as e:
            self.logger.exception(f"Error loading game configurations: {e}")
    
    def launch_game(self, game_id: str) -> Tuple[bool, Dict[str, Any]]:
        """Launch a game by ID"""
        # End any currently running game first
        if self.is_game_running():
            self.end_game()
        
        self.game_launch_status = "launching"
        
        game = self.database.get_game(game_id)
        if not game:
            self.logger.error(f"Game ID {game_id} not found")
            self.game_launch_status = "failed"
            return False, {}
        
        # Cache the game data
        self.games_cache[game_id] = game
        
        self.logger.info(f"Launching game: {game['title']}")
        
        # Notify clients of launch start
        if self.status_callback:
            self.status_callback()
        
        try:
            executable = game.get('executable_path', '')
            working_dir = game.get('working_directory', '')
            arguments = game.get('arguments', '')
            
            if os.path.exists(executable):
                # Build command with arguments if provided
                command = [executable]
                if arguments:
                    command.extend(arguments.split())
                
                # Launch the game process
                self.logger.info(f"Executing: {' '.join(command)}")
                self.current_game_process = subprocess.Popen(
                    command,
                    cwd=working_dir if working_dir else None,
                    shell=True,
                    stdin=subprocess.DEVNULL,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True
                )
                self.logger.info(f"Game process started with PID: {self.current_game_process.pid}")
                
                # Start monitoring the process
                self.current_game_id = game_id
                self.game_launch_status = "running"
                self._start_process_monitor()
                
                # Notify clients immediately
                if self.status_callback:
                    self.status_callback()
                
                return True, game
            else:
                # For testing when executable doesn't exist - enter demo mode
                self.logger.warning(f"Game executable not found: {executable}")
                self.logger.info("Entering demo mode - session will continue without actual game")
                
                self.current_game_id = game_id
                self.game_launch_status = "running"  # Demo mode is considered "running"
                
                # Notify clients of demo mode
                if self.status_callback:
                    self.status_callback()
                
                return True, {**game, 'demo_mode': True}
            
        except Exception as e:
            self.logger.exception(f"Error launching game {game_id}: {e}")
            self.game_launch_status = "failed"
            if self.status_callback:
                self.status_callback()
            return False, {}
    
    def _start_process_monitor(self):
        """Start monitoring the game process in a separate thread"""
        if self.process_monitor_thread and self.process_monitor_thread.is_alive():
            self.process_monitor_running = False
            self.process_monitor_thread.join(timeout=1)
        
        self.process_monitor_running = True
        self.process_monitor_thread = threading.Thread(target=self._monitor_process, daemon=True)
        self.process_monitor_thread.start()
    
    def _monitor_process(self):
        """Monitor the game process and notify on exit"""
        while self.process_monitor_running and self.current_game_process:
            try:
                # Check if process is still running
                return_code = self.current_game_process.poll()
                
                if return_code is not None:
                    # Process has exited
                    self.logger.info(f"Game process exited with code {return_code}")
                    
                    # Check for common VR runtime errors
                    if return_code == 53:
                        self.logger.warning("Exit code 53: VR runtime not available (SteamVR may not be running)")
                    
                    # Clean up
                    self.current_game_process = None
                    
                    # Notify clients of process exit
                    if self.status_callback:
                        self.status_callback()
                    
                    break
                
                # Sleep for a short interval before checking again
                time.sleep(0.5)
                
            except Exception as e:
                self.logger.exception(f"Error monitoring game process: {e}")
                break
        
        self.process_monitor_running = False
    
    def end_game(self) -> bool:
        """End the current game"""
        if not self.current_game_id:
            return False
            
        game_title = self.games_cache.get(self.current_game_id, {}).get('title', 'Unknown Game')
        self.logger.info(f"Ending game: {game_title}")
        
        # Stop process monitoring
        self.process_monitor_running = False
        
        # Terminate the process if it exists
        if self.current_game_process:
            try:
                # Try to terminate the process gracefully first
                self.current_game_process.terminate()
                try:
                    # Give it 5 seconds to terminate
                    self.current_game_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    # If it doesn't terminate, kill it
                    self.logger.warning("Game process did not terminate gracefully, killing it")
                    self.current_game_process.kill()
                    try:
                        self.current_game_process.wait(timeout=2)
                    except subprocess.TimeoutExpired:
                        self.logger.error("Failed to kill game process")
            except Exception as e:
                self.logger.exception(f"Error terminating game process: {e}")
        
        # Reset game state
        self.current_game_id = None
        self.current_game_process = None
        self.game_launch_status = "idle"
        
        # Notify clients
        if self.status_callback:
            self.status_callback()
        
        return True
    
    def is_game_running(self) -> bool:
        """Check if a game is currently running"""
        # If we have a process, check if it's still running
        if self.current_game_process:
            return_code = self.current_game_process.poll()
            # If return_code is None, the process is still running
            if return_code is not None:
                # Process has exited, clean up
                self.logger.info(f"Game process exited with code {return_code}")
                self.current_game_process = None
                self.game_launch_status = "idle"
                if not self.current_game_id:  # Don't clear if we're in demo mode
                    self.current_game_id = None
                    
                # Notify clients of status change
                if self.status_callback:
                    self.status_callback()
                return False
        
        # Return True if we have a game ID and status is running
        return self.current_game_id is not None and self.game_launch_status == "running"
    
    def is_demo_mode(self) -> bool:
        """Check if we're running in demo mode (game ID set but no process)"""
        return (self.current_game_id is not None and 
                self.current_game_process is None and 
                self.game_launch_status == "running")
    
    def get_current_game_id(self) -> Optional[str]:
        """Get the ID of the currently running game"""
        return self.current_game_id if self.is_game_running() else None
    
    def get_current_game_title(self) -> Optional[str]:
        """Get the title of the currently running game"""
        if not self.is_game_running() or not self.current_game_id:
            return None
            
        game = self.games_cache.get(self.current_game_id)
        if not game:
            # Try to load from database if not in cache
            game = self.database.get_game(self.current_game_id)
            if game:
                self.games_cache[self.current_game_id] = game
                
        return game.get('title', 'Unknown Game') if game else None
    
    def get_status(self) -> Dict[str, Any]:
        """Get current game manager status"""
        return {
            "running": self.is_game_running(),
            "demo_mode": self.is_demo_mode(),
            "current_game": self.get_current_game_title(),
            "game_id": self.current_game_id,
            "process_running": self.current_game_process is not None and self.current_game_process.poll() is None,
            "launch_status": self.game_launch_status
        }
    
    def get_available_games(self) -> List[Dict[str, Any]]:
        """Get all available games"""
        return list(self.database.get_games())
