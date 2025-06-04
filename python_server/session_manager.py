
import asyncio
import time
import threading
from typing import Dict, Any, Optional, Callable
from datetime import datetime, timedelta
import uuid

class SessionManager:
    """Manages VR gaming sessions with timing and state tracking"""
    
    def __init__(self, logger, status_callback: Optional[Callable] = None):
        self.logger = logger
        self.status_callback = status_callback
        self.current_session: Optional[Dict[str, Any]] = None
        self.session_start_time: Optional[float] = None
        self.session_duration: int = 0
        self.is_paused = False
        self.pause_time: Optional[float] = None
        self.total_pause_duration = 0
        self.timer_thread: Optional[threading.Thread] = None
        self.timer_running = False
        
        # Initialize Supabase sync if available
        try:
            from .supabase_sync import SupabaseSync
            self.supabase_sync = SupabaseSync(logger)
        except ImportError:
            self.logger.warning("Supabase sync not available - running in local mode only")
            self.supabase_sync = None
    
    def start_session(self, game_id: str, duration_seconds: int, rfid_tag: Optional[str] = None, venue_id: Optional[str] = None) -> str:
        """Start a new gaming session"""
        # End any existing session first
        if self.current_session:
            self.end_session()
        
        session_id = str(uuid.uuid4())
        
        self.current_session = {
            "session_id": session_id,
            "game_id": game_id,
            "venue_id": venue_id,
            "rfid_tag": rfid_tag,
            "duration_seconds": duration_seconds,
            "start_time": datetime.now().isoformat(),
            "status": "active"
        }
        
        self.session_start_time = time.time()
        self.session_duration = duration_seconds
        self.is_paused = False
        self.pause_time = None
        self.total_pause_duration = 0
        
        self.logger.info(f"Session started: {session_id} for game {game_id} ({duration_seconds}s)")
        
        # Start the session timer
        self._start_timer()
        
        # Sync with Supabase asynchronously
        if self.supabase_sync:
            asyncio.create_task(self.supabase_sync.sync_session_start(self.current_session))
        
        # Notify status callback
        if self.status_callback:
            self.status_callback()
        
        return session_id
    
    def end_session(self, rating: Optional[int] = None) -> bool:
        """End the current session"""
        if not self.current_session:
            return False
        
        # Stop the timer
        self._stop_timer()
        
        # Calculate actual duration
        actual_duration = self._get_elapsed_time()
        
        end_data = {
            "duration_seconds": actual_duration,
            "rating": rating,
            "end_time": datetime.now().isoformat()
        }
        
        session_id = self.current_session["session_id"]
        
        self.logger.info(f"Session ended: {session_id} (duration: {actual_duration}s)")
        
        # Sync with Supabase asynchronously
        if self.supabase_sync:
            asyncio.create_task(self.supabase_sync.sync_session_end(session_id, end_data))
        
        # Clear session data
        self.current_session = None
        self.session_start_time = None
        self.session_duration = 0
        self.is_paused = False
        self.pause_time = None
        self.total_pause_duration = 0
        
        # Notify status callback
        if self.status_callback:
            self.status_callback()
        
        return True
    
    def pause_session(self) -> bool:
        """Pause the current session"""
        if not self.current_session or self.is_paused:
            return False
        
        self.is_paused = True
        self.pause_time = time.time()
        
        self.logger.info(f"Session paused: {self.current_session['session_id']}")
        
        # Notify status callback
        if self.status_callback:
            self.status_callback()
        
        return True
    
    def resume_session(self) -> bool:
        """Resume the current session"""
        if not self.current_session or not self.is_paused:
            return False
        
        if self.pause_time:
            self.total_pause_duration += time.time() - self.pause_time
            self.pause_time = None
        
        self.is_paused = False
        
        self.logger.info(f"Session resumed: {self.current_session['session_id']}")
        
        # Notify status callback
        if self.status_callback:
            self.status_callback()
        
        return True
    
    def get_time_remaining(self) -> int:
        """Get remaining time in seconds"""
        if not self.current_session or not self.session_start_time:
            return 0
        
        elapsed = self._get_elapsed_time()
        remaining = max(0, self.session_duration - elapsed)
        return remaining
    
    def _get_elapsed_time(self) -> int:
        """Get elapsed time excluding pause duration"""
        if not self.session_start_time:
            return 0
        
        current_time = time.time()
        elapsed = current_time - self.session_start_time
        
        # Subtract total pause duration
        elapsed -= self.total_pause_duration
        
        # Subtract current pause duration if paused
        if self.is_paused and self.pause_time:
            elapsed -= (current_time - self.pause_time)
        
        return int(elapsed)
    
    def _start_timer(self):
        """Start the session timer thread"""
        if self.timer_thread and self.timer_thread.is_alive():
            self._stop_timer()
        
        self.timer_running = True
        self.timer_thread = threading.Thread(target=self._timer_loop, daemon=True)
        self.timer_thread.start()
    
    def _stop_timer(self):
        """Stop the session timer thread"""
        self.timer_running = False
        if self.timer_thread and self.timer_thread.is_alive():
            self.timer_thread.join(timeout=1)
    
    def _timer_loop(self):
        """Timer loop that checks for session timeout"""
        while self.timer_running and self.current_session:
            try:
                remaining = self.get_time_remaining()
                
                if remaining <= 0:
                    self.logger.info("Session time expired - auto-ending session")
                    self.end_session()
                    break
                
                # Check every second
                time.sleep(1)
                
            except Exception as e:
                self.logger.error(f"Error in timer loop: {e}")
                break
        
        self.timer_running = False
    
    def get_status(self) -> Dict[str, Any]:
        """Get current session status"""
        if not self.current_session:
            return {
                "active": False,
                "session_id": None,
                "time_remaining": 0,
                "is_paused": False
            }
        
        return {
            "active": True,
            "session_id": self.current_session["session_id"],
            "game_id": self.current_session["game_id"],
            "time_remaining": self.get_time_remaining(),
            "is_paused": self.is_paused,
            "elapsed_time": self._get_elapsed_time()
        }
    
    def is_session_active(self) -> bool:
        """Check if a session is currently active"""
        return self.current_session is not None
