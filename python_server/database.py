
#!/usr/bin/env python3
import os
import logging
import sqlite3
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import json
import threading

class Database:
    """SQLite database manager for persistent storage"""
    
    def __init__(self, db_path: str, logger):
        self.logger = logger
        self.db_path = db_path
        self.connection = None
        self._connection_lock = threading.Lock()
        self._initialize_db()
    
    def _get_connection(self) -> sqlite3.Connection:
        """Get a thread-safe database connection"""
        if self.connection is None:
            with self._connection_lock:
                if self.connection is None:
                    self.connection = sqlite3.connect(
                        self.db_path, 
                        check_same_thread=False,
                        detect_types=sqlite3.PARSE_DECLTYPES
                    )
                    self.connection.row_factory = sqlite3.Row
        return self.connection
    
    def _initialize_db(self):
        """Initialize the database schema"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
            
            conn = self._get_connection()
            cursor = conn.cursor()
            
            # Create games table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS games (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    executable_path TEXT,
                    working_directory TEXT,
                    arguments TEXT,
                    description TEXT,
                    image_url TEXT,
                    min_duration_seconds INTEGER NOT NULL,
                    max_duration_seconds INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    game_id TEXT NOT NULL,
                    start_time TIMESTAMP NOT NULL,
                    end_time TIMESTAMP,
                    duration_seconds INTEGER,
                    rfid_tag TEXT,
                    rating INTEGER,
                    status TEXT NOT NULL,
                    FOREIGN KEY (game_id) REFERENCES games(id)
                )
            ''')
            
            # Create rfid_cards table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS rfid_cards (
                    tag_id TEXT PRIMARY KEY,
                    name TEXT,
                    status TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used_at TIMESTAMP
                )
            ''')
            
            # Create settings table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            self.logger.info("Database schema initialized successfully")
            
            # Always reimport games from JSON to ensure they're up to date
            games_config_path = os.environ.get("VR_GAMES_CONFIG", "games.json")
            if os.path.exists(games_config_path):
                self._import_games_from_json(games_config_path)
            else:
                self.logger.warning(f"Games config file not found: {games_config_path}")
                
        except sqlite3.Error as e:
            self.logger.error(f"Database initialization error: {e}")
            raise
    
    def _import_games_from_json(self, config_path: str):
        """Import games from JSON configuration file"""
        try:
            with open(config_path, 'r') as f:
                config_data = json.load(f)
            
            if 'games' in config_data:
                conn = self._get_connection()
                cursor = conn.cursor()
                
                # Clear existing games to ensure fresh import
                cursor.execute("DELETE FROM games")
                
                for game in config_data['games']:
                    cursor.execute(
                        """
                        INSERT INTO games (
                            id, title, executable_path, working_directory, 
                            arguments, description, image_url, 
                            min_duration_seconds, max_duration_seconds
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            game['id'], 
                            game['title'], 
                            game.get('executable_path', ''),
                            game.get('working_directory', ''),
                            game.get('arguments', ''),
                            game.get('description', ''),
                            game.get('image_url', ''),
                            game.get('min_duration_seconds', 300),
                            game.get('max_duration_seconds', 1800)
                        )
                    )
                
                conn.commit()
                self.logger.info(f"Imported {len(config_data['games'])} games from {config_path}")
                
        except (json.JSONDecodeError, FileNotFoundError, KeyError) as e:
            self.logger.error(f"Error importing games from JSON: {e}")
    
    # ... keep existing code (close, get_games, get_game, start_session, end_session, validate_rfid, get_setting, set_setting methods)
    
    def close(self):
        """Close the database connection"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def get_games(self) -> List[Dict[str, Any]]:
        """Get all available games"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM games ORDER BY title")
            
            games = []
            for row in cursor.fetchall():
                games.append(dict(row))
            
            return games
        except sqlite3.Error as e:
            self.logger.error(f"Error getting games: {e}")
            return []
    
    def get_game(self, game_id: str) -> Optional[Dict[str, Any]]:
        """Get a game by ID"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM games WHERE id = ?", (game_id,))
            
            row = cursor.fetchone()
            return dict(row) if row else None
        except sqlite3.Error as e:
            self.logger.error(f"Error getting game {game_id}: {e}")
            return None
    
    def start_session(self, game_id: str, duration_seconds: int, rfid_tag: Optional[str] = None) -> str:
        """Start a new game session"""
        try:
            session_id = f"{int(datetime.now().timestamp())}-{os.urandom(4).hex()}"
            
            conn = self._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                """
                INSERT INTO sessions (
                    id, game_id, start_time, duration_seconds, rfid_tag, status
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    game_id,
                    datetime.now(),
                    duration_seconds,
                    rfid_tag,
                    "active"
                )
            )
            
            # Update RFID card last_used_at if provided
            if rfid_tag:
                cursor.execute(
                    "UPDATE rfid_cards SET last_used_at = ? WHERE tag_id = ?",
                    (datetime.now(), rfid_tag)
                )
                
            conn.commit()
            return session_id
            
        except sqlite3.Error as e:
            self.logger.error(f"Error starting session: {e}")
            raise
    
    def end_session(self, session_id: str, rating: Optional[int] = None) -> bool:
        """End a game session"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            # Get current session
            cursor.execute(
                "SELECT * FROM sessions WHERE id = ? AND status = 'active'",
                (session_id,)
            )
            
            session = cursor.fetchone()
            if not session:
                self.logger.warning(f"No active session found with ID {session_id}")
                return False
            
            # Calculate actual duration
            start_time = datetime.fromisoformat(session['start_time'])
            end_time = datetime.now()
            actual_duration = int((end_time - start_time).total_seconds())
            
            # Update session
            cursor.execute(
                """
                UPDATE sessions SET 
                    end_time = ?,
                    status = 'completed',
                    rating = ?,
                    duration_seconds = ?
                WHERE id = ?
                """,
                (
                    end_time,
                    rating,
                    actual_duration,
                    session_id
                )
            )
            
            conn.commit()
            return True
            
        except (sqlite3.Error, ValueError) as e:
            self.logger.error(f"Error ending session: {e}")
            return False
    
    def validate_rfid(self, tag_id: str) -> Optional[Dict[str, Any]]:
        """Validate an RFID tag"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT * FROM rfid_cards WHERE tag_id = ? AND status = 'active'",
                (tag_id,)
            )
            
            row = cursor.fetchone()
            return dict(row) if row else None
            
        except sqlite3.Error as e:
            self.logger.error(f"Error validating RFID tag: {e}")
            return None
    
    def get_setting(self, key: str, default_value: Any = None) -> Any:
        """Get a setting value"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
            row = cursor.fetchone()
            
            if not row:
                return default_value
            
            try:
                # Try to parse as JSON
                return json.loads(row[0])
            except json.JSONDecodeError:
                # Return as string
                return row[0]
                
        except sqlite3.Error as e:
            self.logger.error(f"Error getting setting {key}: {e}")
            return default_value
    
    def set_setting(self, key: str, value: Any) -> bool:
        """Set a setting value"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            else:
                value = str(value)
            
            cursor.execute(
                """
                INSERT OR REPLACE INTO settings (key, value, updated_at)
                VALUES (?, ?, ?)
                """,
                (key, value, datetime.now())
            )
            
            conn.commit()
            return True
            
        except sqlite3.Error as e:
            self.logger.error(f"Error setting setting {key}: {e}")
            return False
