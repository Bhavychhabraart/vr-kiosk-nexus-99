
#!/usr/bin/env python3
import logging
import threading
import time
from typing import Optional, Callable, Dict, Any
from datetime import datetime

class RFIDHandler:
    """
    Handles RFID card detection and management.
    This is a placeholder class that simulates RFID hardware.
    In a real implementation, this would integrate with actual RFID hardware.
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
        
    def start(self, callback: Callable[[str], None] = None):
        """Start the RFID reader"""
        if self.running:
            return
            
        self.callback = callback
        self.running = True
        self.reader_thread = threading.Thread(target=self._reader_loop)
        self.reader_thread.daemon = True
        self.reader_thread.start()
        self.logger.info("RFID reader started")
    
    def stop(self):
        """Stop the RFID reader"""
        self.running = False
        if self.reader_thread:
            self.reader_thread.join(timeout=2.0)
        self.logger.info("RFID reader stopped")
    
    def _reader_loop(self):
        """Background thread that simulates RFID reading"""
        while self.running:
            # In a real implementation, this would read from hardware
            # For now, we just sleep and do nothing
            time.sleep(0.1)
    
    def simulate_tag_read(self, tag_id: str) -> Dict[str, Any]:
        """
        Simulate an RFID tag being read.
        In a real implementation, this would be called by the hardware layer.
        """
        self.last_read_tag = tag_id
        self.last_read_time = datetime.now()
        self.read_count += 1
        
        self.logger.info(f"RFID tag read: {tag_id}")
        
        # Validate the tag
        rfid_data = self.database.validate_rfid(tag_id)
        
        result = {
            "tagId": tag_id,
            "name": rfid_data.get("name") if rfid_data else None,
            "valid": rfid_data is not None,
            "readTime": self.last_read_time.isoformat()
        }
        
        # Call the callback if set
        if self.callback:
            self.callback(tag_id)
            
        return result
    
    def register_new_card(self, tag_id: str, name: Optional[str] = None) -> bool:
        """Register a new RFID card in the system"""
        try:
            conn = self.database._get_connection()
            cursor = conn.cursor()
            
            # Check if tag already exists
            cursor.execute("SELECT tag_id FROM rfid_cards WHERE tag_id = ?", (tag_id,))
            existing = cursor.fetchone()
            
            if existing:
                self.logger.warning(f"RFID tag {tag_id} already registered")
                return False
                
            # Insert new tag
            cursor.execute(
                """
                INSERT INTO rfid_cards (tag_id, name, status, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (tag_id, name or f"Card-{tag_id[-6:]}", "active", datetime.now())
            )
            
            conn.commit()
            self.logger.info(f"Registered new RFID card: {tag_id}")
            return True
            
        except Exception as e:
            self.logger.exception(f"Error registering RFID card: {e}")
            return False
            
    def deactivate_card(self, tag_id: str) -> bool:
        """Deactivate an RFID card"""
        try:
            conn = self.database._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "UPDATE rfid_cards SET status = 'inactive' WHERE tag_id = ?",
                (tag_id,)
            )
            
            if cursor.rowcount > 0:
                conn.commit()
                self.logger.info(f"Deactivated RFID card: {tag_id}")
                return True
            else:
                self.logger.warning(f"RFID card not found: {tag_id}")
                return False
                
        except Exception as e:
            self.logger.exception(f"Error deactivating RFID card: {e}")
            return False
    
    def get_card_history(self, tag_id: str, limit: int = 10) -> list:
        """Get usage history for an RFID card"""
        try:
            conn = self.database._get_connection()
            cursor = conn.cursor()
            
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
                
            return sessions
            
        except Exception as e:
            self.logger.exception(f"Error getting card history: {e}")
            return []
