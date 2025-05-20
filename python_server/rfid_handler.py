
#!/usr/bin/env python3
import logging
import threading
import time
import bcrypt
import jwt
import os
from typing import Optional, Callable, Dict, Any, List
from datetime import datetime, timedelta

class RFIDHandler:
    """
    Handles RFID card detection and management with enhanced robustness and security.
    """
    
    def __init__(self, database, logger):
        self.database = database
        self.logger = logger
        self.running = False
        self.reader_thread: Optional[threading.Thread] = None
        self.callback: Optional[Callable[[str], None]] = None
        self.last_read_tag: Optional[str] = None
        self.last_read_time = None
        self.read_count = 0
        self.jwt_secret = os.getenv("RFID_JWT_SECRET", os.urandom(32).hex())
        self.token_expiry = int(os.getenv("RFID_TOKEN_EXPIRY", "3600"))  # 1 hour default
        self._setup_database()
        
    def _setup_database(self):
        """Ensure database tables exist for RFID operations"""
        try:
            conn = self.database._get_connection()
            cursor = conn.cursor()
            
            # Create RFID cards table if not exists
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rfid_cards (
                    tag_id TEXT PRIMARY KEY,
                    name TEXT,
                    status TEXT NOT NULL DEFAULT 'active',
                    permission_level TEXT DEFAULT 'user',
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    last_used_at TIMESTAMP
                )
            """)
            
            # Create RFID access log table if not exists
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rfid_access_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tag_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    success BOOLEAN NOT NULL,
                    details TEXT,
                    FOREIGN KEY (tag_id) REFERENCES rfid_cards (tag_id)
                )
            """)
            
            # Create game permissions table if not exists
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rfid_game_permissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tag_id TEXT NOT NULL,
                    game_id TEXT NOT NULL,
                    permission_type TEXT NOT NULL DEFAULT 'allow',
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(tag_id, game_id),
                    FOREIGN KEY (tag_id) REFERENCES rfid_cards (tag_id)
                )
            """)
            
            conn.commit()
            self.logger.info("RFID database tables initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize RFID database tables: {e}")
            raise
            
    def start(self, callback: Callable[[str], None] = None):
        """Start the RFID reader with enhanced error handling"""
        if self.running:
            self.logger.warning("Attempted to start RFID reader when already running")
            return
            
        try:
            self.callback = callback
            self.running = True
            self.reader_thread = threading.Thread(target=self._reader_loop)
            self.reader_thread.daemon = True
            self.reader_thread.start()
            self.logger.info("RFID reader started successfully")
        except Exception as e:
            self.running = False
            self.logger.error(f"Failed to start RFID reader: {e}")
            raise
    
    def stop(self):
        """Stop the RFID reader with enhanced error handling"""
        if not self.running:
            self.logger.warning("Attempted to stop RFID reader when not running")
            return
            
        try:
            self.running = False
            if self.reader_thread:
                self.reader_thread.join(timeout=2.0)
                if self.reader_thread.is_alive():
                    self.logger.warning("RFID reader thread did not terminate cleanly")
            self.logger.info("RFID reader stopped")
        except Exception as e:
            self.logger.error(f"Error stopping RFID reader: {e}")
    
    def _reader_loop(self):
        """Background thread that simulates RFID reading with improved error handling"""
        retry_count = 0
        max_retries = 5
        
        while self.running:
            try:
                # In a real implementation, this would read from hardware
                # For now, we just sleep and do nothing
                time.sleep(0.1)
                retry_count = 0  # Reset retry count on successful iteration
            except Exception as e:
                retry_count += 1
                self.logger.error(f"Error in RFID reader loop: {e}")
                if retry_count >= max_retries:
                    self.logger.critical(f"RFID reader failed after {max_retries} retries, stopping.")
                    self.running = False
                    break
                # Wait before retrying, with exponential backoff
                time.sleep(0.5 * (2 ** retry_count))
    
    def simulate_tag_read(self, tag_id: str) -> Dict[str, Any]:
        """
        Simulate an RFID tag being read with comprehensive validation and logging.
        """
        if not tag_id or not isinstance(tag_id, str):
            self.logger.error(f"Invalid RFID tag format: {tag_id}")
            return {"valid": False, "error": "Invalid tag format"}
            
        self.last_read_tag = tag_id
        self.last_read_time = datetime.now()
        self.read_count += 1
        
        self.logger.info(f"RFID tag read: {tag_id}")
        
        try:
            # Validate the tag
            rfid_data = self.database.validate_rfid(tag_id)
            
            # Log the access attempt
            conn = self.database._get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO rfid_access_log (tag_id, action, success, details)
                VALUES (?, 'read', ?, ?)
                """,
                (tag_id, rfid_data is not None, "Tag validation" if rfid_data else "Invalid tag")
            )
            
            # Update last used timestamp if tag is valid
            if rfid_data:
                cursor.execute(
                    "UPDATE rfid_cards SET last_used_at = CURRENT_TIMESTAMP WHERE tag_id = ?",
                    (tag_id,)
                )
                
            conn.commit()
            
            result = {
                "tagId": tag_id,
                "name": rfid_data.get("name") if rfid_data else None,
                "valid": rfid_data is not None,
                "status": rfid_data.get("status") if rfid_data else "invalid",
                "readTime": self.last_read_time.isoformat()
            }
            
            # Call the callback if set
            if self.callback:
                self.callback(tag_id)
                
            return result
            
        except Exception as e:
            self.logger.exception(f"Error processing RFID tag read: {e}")
            return {
                "tagId": tag_id,
                "valid": False,
                "error": str(e),
                "readTime": self.last_read_time.isoformat()
            }
    
    def register_new_card(self, tag_id: str, name: Optional[str] = None, permission_level: str = "user") -> Dict[str, Any]:
        """Register a new RFID card in the system with enhanced error handling and validation"""
        if not tag_id or not isinstance(tag_id, str):
            self.logger.error(f"Invalid RFID tag format for registration: {tag_id}")
            return {"success": False, "error": "Invalid tag format"}
            
        try:
            conn = self.database._get_connection()
            cursor = conn.cursor()
            
            # Check if tag already exists
            cursor.execute("SELECT tag_id FROM rfid_cards WHERE tag_id = ?", (tag_id,))
            existing = cursor.fetchone()
            
            if existing:
                self.logger.warning(f"RFID tag {tag_id} already registered")
                return {"success": False, "error": "Tag already registered"}
                
            # Insert new tag with better defaults
            cursor.execute(
                """
                INSERT INTO rfid_cards (tag_id, name, status, permission_level, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (tag_id, name or f"Card-{tag_id[-6:]}", "active", permission_level, datetime.now(), datetime.now())
            )
            
            # Log the registration
            cursor.execute(
                """
                INSERT INTO rfid_access_log (tag_id, action, success, details)
                VALUES (?, 'register', ?, ?)
                """,
                (tag_id, True, f"Registered with name: {name or f'Card-{tag_id[-6:]}'}")
            )
            
            conn.commit()
            self.logger.info(f"Registered new RFID card: {tag_id}")
            
            return {
                "success": True, 
                "tagId": tag_id,
                "name": name or f"Card-{tag_id[-6:]}",
                "status": "active",
                "permissionLevel": permission_level
            }
            
        except Exception as e:
            self.logger.exception(f"Error registering RFID card: {e}")
            return {"success": False, "error": str(e)}
            
    def deactivate_card(self, tag_id: str) -> Dict[str, Any]:
        """Deactivate an RFID card with enhanced error handling and logging"""
        if not tag_id or not isinstance(tag_id, str):
            self.logger.error(f"Invalid RFID tag format for deactivation: {tag_id}")
            return {"success": False, "error": "Invalid tag format"}
            
        try:
            conn = self.database._get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT tag_id FROM rfid_cards WHERE tag_id = ?", (tag_id,))
            if not cursor.fetchone():
                self.logger.warning(f"Cannot deactivate: RFID card not found: {tag_id}")
                return {"success": False, "error": "Card not found"}
                
            cursor.execute(
                "UPDATE rfid_cards SET status = 'inactive', updated_at = ? WHERE tag_id = ?",
                (datetime.now(), tag_id)
            )
            
            # Log the deactivation
            cursor.execute(
                """
                INSERT INTO rfid_access_log (tag_id, action, success, details)
                VALUES (?, 'deactivate', ?, ?)
                """,
                (tag_id, cursor.rowcount > 0, "Card deactivated")
            )
            
            if cursor.rowcount > 0:
                conn.commit()
                self.logger.info(f"Deactivated RFID card: {tag_id}")
                return {"success": True}
            else:
                self.logger.warning(f"RFID card not found for deactivation: {tag_id}")
                return {"success": False, "error": "Card not found"}
                
        except Exception as e:
            self.logger.exception(f"Error deactivating RFID card: {e}")
            return {"success": False, "error": str(e)}
    
    def get_card_history(self, tag_id: str, limit: int = 10) -> Dict[str, Any]:
        """Get usage history for an RFID card with enhanced error handling"""
        if not tag_id or not isinstance(tag_id, str):
            self.logger.error(f"Invalid RFID tag format for history lookup: {tag_id}")
            return {"success": False, "error": "Invalid tag format"}
            
        try:
            conn = self.database._get_connection()
            cursor = conn.cursor()
            
            # First check if the card exists
            cursor.execute("SELECT tag_id FROM rfid_cards WHERE tag_id = ?", (tag_id,))
            if not cursor.fetchone():
                return {"success": False, "error": "Card not found"}
            
            # Get card information
            cursor.execute("SELECT * FROM rfid_cards WHERE tag_id = ?", (tag_id,))
            card_info = dict(cursor.fetchone())
            
            # Get session history
            cursor.execute(
                """
                SELECT * FROM sessions 
                WHERE rfid_tag = ? 
                ORDER BY start_time DESC
                LIMIT ?
                """,
                (tag_id, limit)
            )
            
            sessions = []
            for row in cursor.fetchall():
                sessions.append(dict(row))
                
            # Get access log history
            cursor.execute(
                """
                SELECT * FROM rfid_access_log
                WHERE tag_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (tag_id, limit)
            )
            
            access_logs = []
            for row in cursor.fetchall():
                access_logs.append(dict(row))
                
            return {
                "success": True,
                "card": card_info,
                "sessions": sessions,
                "accessLogs": access_logs
            }
            
        except Exception as e:
            self.logger.exception(f"Error getting card history: {e}")
            return {"success": False, "error": str(e)}
            
    def set_game_permission(self, tag_id: str, game_id: str, permission_type: str = "allow") -> Dict[str, Any]:
        """Set permission for a specific RFID card to access a game"""
        if not tag_id or not game_id:
            return {"success": False, "error": "Invalid tag or game ID"}
            
        try:
            conn = self.database._get_connection()
            cursor = conn.cursor()
            
            # Verify card exists
            cursor.execute("SELECT tag_id FROM rfid_cards WHERE tag_id = ?", (tag_id,))
            if not cursor.fetchone():
                return {"success": False, "error": "RFID card not found"}
                
            # Upsert permission
            cursor.execute(
                """
                INSERT INTO rfid_game_permissions (tag_id, game_id, permission_type)
                VALUES (?, ?, ?)
                ON CONFLICT(tag_id, game_id) DO UPDATE SET
                permission_type = excluded.permission_type
                """,
                (tag_id, game_id, permission_type)
            )
            
            conn.commit()
            self.logger.info(f"Set {permission_type} permission for card {tag_id} on game {game_id}")
            
            return {"success": True}
            
        except Exception as e:
            self.logger.exception(f"Error setting game permission: {e}")
            return {"success": False, "error": str(e)}
            
    def check_game_permission(self, tag_id: str, game_id: str) -> Dict[str, Any]:
        """Check if a specific RFID card has permission to access a game"""
        if not tag_id or not game_id:
            return {"authorized": False, "error": "Invalid tag or game ID"}
            
        try:
            conn = self.database._get_connection()
            cursor = conn.cursor()
            
            # First check if card is active
            cursor.execute(
                "SELECT status FROM rfid_cards WHERE tag_id = ?",
                (tag_id,)
            )
            card = cursor.fetchone()
            
            if not card:
                return {"authorized": False, "error": "Card not found"}
                
            if card["status"] != "active":
                return {"authorized": False, "error": "Card is not active"}
                
            # Check for specific game permission
            cursor.execute(
                """
                SELECT permission_type FROM rfid_game_permissions
                WHERE tag_id = ? AND game_id = ?
                """,
                (tag_id, game_id)
            )
            permission = cursor.fetchone()
            
            # If no specific permission is set, allow by default
            if not permission:
                return {"authorized": True, "permissionType": "default"}
                
            authorized = permission["permission_type"] == "allow"
            
            # Log the authorization check
            cursor.execute(
                """
                INSERT INTO rfid_access_log (tag_id, action, success, details)
                VALUES (?, 'game_access', ?, ?)
                """,
                (tag_id, authorized, f"Game access check for game: {game_id}")
            )
            conn.commit()
            
            return {
                "authorized": authorized,
                "permissionType": permission["permission_type"]
            }
            
        except Exception as e:
            self.logger.exception(f"Error checking game permission: {e}")
            return {"authorized": False, "error": str(e)}
            
    def generate_auth_token(self, tag_id: str) -> Dict[str, Any]:
        """Generate a JWT token for RFID authentication"""
        try:
            # Check if card exists and is active
            conn = self.database._get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM rfid_cards WHERE tag_id = ? AND status = 'active'",
                (tag_id,)
            )
            card = cursor.fetchone()
            
            if not card:
                return {"success": False, "error": "Invalid or inactive card"}
                
            # Generate JWT token
            exp_time = datetime.now() + timedelta(seconds=self.token_expiry)
            payload = {
                "sub": tag_id,
                "name": card["name"],
                "permission_level": card["permission_level"],
                "exp": exp_time.timestamp(),
                "iat": datetime.now().timestamp()
            }
            
            token = jwt.encode(payload, self.jwt_secret, algorithm="HS256")
            
            return {
                "success": True,
                "token": token,
                "expires": exp_time.isoformat(),
                "cardName": card["name"]
            }
            
        except Exception as e:
            self.logger.exception(f"Error generating auth token: {e}")
            return {"success": False, "error": str(e)}
            
    def verify_auth_token(self, token: str) -> Dict[str, Any]:
        """Verify a JWT token for RFID authentication"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            tag_id = payload.get("sub")
            
            # Verify card is still active
            conn = self.database._get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM rfid_cards WHERE tag_id = ? AND status = 'active'",
                (tag_id,)
            )
            card = cursor.fetchone()
            
            if not card:
                return {"valid": False, "error": "Card no longer active"}
                
            return {
                "valid": True,
                "tagId": tag_id,
                "name": payload.get("name"),
                "permissionLevel": payload.get("permission_level"),
                "expiresAt": datetime.fromtimestamp(payload.get("exp")).isoformat()
            }
            
        except jwt.ExpiredSignatureError:
            return {"valid": False, "error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"valid": False, "error": "Invalid token"}
        except Exception as e:
            self.logger.exception(f"Error verifying auth token: {e}")
            return {"valid": False, "error": str(e)}
