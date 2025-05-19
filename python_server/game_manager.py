
import json
import logging
import os
import subprocess
from typing import Dict, Any, Tuple, Optional, List

class GameManager:
    """Manages VR games and their processes"""
    
    def __init__(self, config_path: str, logger):
        self.logger = logger
        self.config_path = config_path
        self.games: Dict[str, Dict[str, Any]] = {}
        self.current_game_id: Optional[str] = None
        self.current_game_process: Optional[subprocess.Popen] = None
        
        # Load game configurations
        self.load_game_configs()
    
    def load_game_configs(self):
        """Load game configurations from JSON file"""
        try:
            if not os.path.exists(self.config_path):
                self.logger.warning(f"Game config file not found: {self.config_path}")
                self.logger.info("Creating default game configuration")
                self.create_default_config()
            
            with open(self.config_path, 'r') as f:
                config_data = json.load(f)
            
            if 'games' in config_data:
                for game in config_data['games']:
                    self.games[game['id']] = game
                self.logger.info(f"Loaded {len(self.games)} games from config")
            else:
                self.logger.error("Invalid game configuration format")
        except Exception as e:
            self.logger.exception(f"Error loading game configurations: {e}")
    
    def create_default_config(self):
        """Create a default game configuration file"""
        default_config = {
            "games": [
                {
                    "id": "1",
                    "title": "Beat Saber",
                    "executable_path": "C:\\VRGames\\BeatSaber\\Beat Saber.exe",
                    "working_directory": "C:\\VRGames\\BeatSaber",
                    "arguments": "--vrmode openvr",
                    "description": "Rhythm game where you slash blocks with lightsabers",
                    "image_url": "/games/beatsaber.jpg",
                    "min_duration_seconds": 300,
                    "max_duration_seconds": 1800
                },
                {
                    "id": "2",
                    "title": "Half-Life: Alyx",
                    "executable_path": "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Half-Life Alyx\\bin\\win64\\hlvr.exe",
                    "working_directory": "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Half-Life Alyx",
                    "arguments": "-novid -console",
                    "description": "Return to Half-Life in this VR masterpiece by Valve",
                    "image_url": "/games/alyx.jpg",
                    "min_duration_seconds": 600,
                    "max_duration_seconds": 3600
                },
                {
                    "id": "3",
                    "title": "VRChat",
                    "executable_path": "C:\\Program Files (x86)\\Steam\\steamapps\\common\\VRChat\\VRChat.exe",
                    "working_directory": "C:\\Program Files (x86)\\Steam\\steamapps\\common\\VRChat",
                    "arguments": "",
                    "description": "Social VR platform to meet and interact with friends",
                    "image_url": "/games/vrchat.jpg",
                    "min_duration_seconds": 300,
                    "max_duration_seconds": 7200
                }
            ]
        }
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(self.config_path)), exist_ok=True)
        
        with open(self.config_path, 'w') as f:
            json.dump(default_config, f, indent=2)
    
    def launch_game(self, game_id: str) -> Tuple[bool, Dict[str, Any]]:
        """Launch a game by ID"""
        # End any currently running game first
        if self.is_game_running():
            self.end_game()
        
        if game_id not in self.games:
            self.logger.error(f"Game ID {game_id} not found")
            return False, {}
        
        game = self.games[game_id]
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
            
        game_title = self.games[self.current_game_id]['title']
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
        if not self.is_game_running():
            return None
        return self.games[self.current_game_id]['title'] if self.current_game_id else None
    
    def get_available_games(self) -> List[Dict[str, Any]]:
        """Get all available games"""
        return list(self.games.values())
