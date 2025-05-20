
import json
import logging
import os
import subprocess
import time
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
        
        # Load game configurations from database
        self.load_games()
    
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
        
        game = self.database.get_game(game_id)
        if not game:
            self.logger.error(f"Game ID {game_id} not found")
            return False, {}
        
        # Cache the game data
        self.games_cache[game_id] = game
        
        self.logger.info(f"Launching game: {game['title']}")
        
        try:
            # In a production environment, you'd launch the actual game
            # For testing or simulation, we'll just record that a game is running
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
                    shell=True,  # Using shell for Windows compatibility
                    stdin=subprocess.DEVNULL,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True  # Detach from parent process
                )
                self.logger.info(f"Game process started with PID: {self.current_game_process.pid}")
            else:
                # For testing when executable doesn't exist
                self.logger.warning(f"Game executable not found: {executable}")
                self.logger.info("Running in simulation mode")
                # We'll still mark the game as running for testing
            
            self.current_game_id = game_id
            return True, game
            
        except Exception as e:
            self.logger.exception(f"Error launching game {game_id}: {e}")
            return False, {}
    
    def end_game(self) -> bool:
        """End the current game"""
        if not self.current_game_id:
            return False
            
        game_title = self.games_cache.get(self.current_game_id, {}).get('title', 'Unknown Game')
        self.logger.info(f"Ending game: {game_title}")
        
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
                self.current_game_id = None
                return False
        
        return self.current_game_id is not None
    
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
    
    def get_available_games(self) -> List[Dict[str, Any]]:
        """Get all available games"""
        return list(self.database.get_games())
