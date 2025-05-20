
import asyncio
import logging
import time
from typing import Optional, Callable, Dict, Any
from datetime import datetime

class SessionManager:
    """Manages game sessions and timers"""
    
    def __init__(self, logger, status_callback: Callable):
        self.logger = logger
        self.status_callback = status_callback
        self.session_duration = 0
        self.time_remaining = 0
        self.is_active = False
        self.is_paused = False
        self.pause_time = 0
        self.pause_start_time = None
        self.session_start_time = None
        self.timer_task: Optional[asyncio.Task] = None
        self.warnings_sent = set()  # Track which time warnings have been sent
    
    def start_timer(self, duration_seconds: int) -> bool:
        """Start a session timer"""
        if self.is_active:
            self.stop_timer()
            
        self.logger.info(f"Starting session timer for {duration_seconds} seconds")
        self.session_duration = duration_seconds
        self.time_remaining = duration_seconds
        self.is_active = True
        self.is_paused = False
        self.pause_time = 0
        self.warnings_sent = set()
        self.session_start_time = datetime.now()
        
        # Start the timer task
        self.timer_task = asyncio.create_task(self._timer_loop())
        return True
    
    def stop_timer(self) -> bool:
        """Stop the current timer"""
        if not self.is_active:
            return False
            
        self.logger.info("Stopping session timer")
        self.is_active = False
        self.is_paused = False
        self.time_remaining = 0
        self.session_start_time = None
        
        # Cancel the timer task if it exists
        if self.timer_task:
            self.timer_task.cancel()
            self.timer_task = None
            
        return True
    
    def pause_timer(self) -> bool:
        """Pause the current timer"""
        if not self.is_active or self.is_paused:
            return False
            
        self.logger.info("Pausing session timer")
        self.is_paused = True
        self.pause_start_time = datetime.now()
        return True
    
    def resume_timer(self) -> bool:
        """Resume the current timer"""
        if not self.is_active or not self.is_paused:
            return False
            
        self.logger.info("Resuming session timer")
        
        # Calculate how long we were paused and add to total pause time
        if self.pause_start_time:
            pause_duration = (datetime.now() - self.pause_start_time).total_seconds()
            self.pause_time += pause_duration
            self.pause_start_time = None
            
        self.is_paused = False
        return True
    
    def extend_timer(self, additional_seconds: int) -> bool:
        """Extend the current timer by additional seconds"""
        if not self.is_active:
            return False
            
        if additional_seconds <= 0:
            return False
            
        self.logger.info(f"Extending session timer by {additional_seconds} seconds")
        self.time_remaining += additional_seconds
        return True
    
    def get_elapsed_time(self) -> int:
        """Get the elapsed time in seconds (excluding pauses)"""
        if not self.session_start_time:
            return 0
            
        total_elapsed = (datetime.now() - self.session_start_time).total_seconds()
        
        # Subtract pause time
        actual_elapsed = total_elapsed - self.pause_time
        
        # If currently paused, also subtract current pause duration
        if self.is_paused and self.pause_start_time:
            current_pause = (datetime.now() - self.pause_start_time).total_seconds()
            actual_elapsed -= current_pause
            
        return int(max(0, actual_elapsed))
    
    async def _timer_loop(self):
        """Timer loop that counts down the session time"""
        last_update = time.time()
        last_broadcast = time.time()
        
        try:
            while self.is_active and self.time_remaining > 0:
                await asyncio.sleep(1)  # Update every second
                
                current_time = time.time()
                elapsed = current_time - last_update
                
                # Only decrement time if not paused
                if not self.is_paused:
                    self.time_remaining = max(0, self.time_remaining - int(elapsed))
                    last_update = current_time
                
                # Check if we need to send time warnings
                await self._check_time_warnings()
                
                # Broadcast status periodically or when time gets low
                should_broadcast = (
                    current_time - last_broadcast >= 10 or  # Every 10 seconds
                    self.time_remaining <= 60 or  # When under a minute
                    self.time_remaining == 0  # When time is up
                )
                
                if should_broadcast:
                    await self.status_callback()
                    last_broadcast = current_time
                    
                # Check if time is up
                if self.time_remaining <= 0:
                    self.logger.info("Session time expired")
                    self.is_active = False
                    await self.status_callback()
        except asyncio.CancelledError:
            self.logger.info("Timer task cancelled")
            raise
        except Exception as e:
            self.logger.exception(f"Error in timer loop: {e}")
        finally:
            self.timer_task = None
    
    async def _check_time_warnings(self):
        """Check if we need to send time warnings"""
        warning_thresholds = [300, 180, 60, 30]  # Warning thresholds in seconds
        
        for threshold in warning_thresholds:
            if self.time_remaining <= threshold and threshold not in self.warnings_sent:
                self.warnings_sent.add(threshold)
                self.logger.info(f"Time warning: {threshold} seconds remaining")
                # This is where you would trigger notifications to clients
                await self.status_callback()
    
    def get_time_remaining(self) -> int:
        """Get the remaining time in seconds"""
        return self.time_remaining if self.is_active else 0
    
    def get_session_duration(self) -> int:
        """Get the total session duration in seconds"""
        return self.session_duration
    
    def is_session_active(self) -> bool:
        """Check if a session is active"""
        return self.is_active
    
    def is_paused(self) -> bool:
        """Check if the session is paused"""
        return self.is_paused
    
    def get_session_info(self) -> Dict[str, Any]:
        """Get complete session information"""
        return {
            "isActive": self.is_active,
            "isPaused": self.is_paused, 
            "timeRemaining": self.time_remaining,
            "sessionDuration": self.session_duration,
            "elapsedTime": self.get_elapsed_time(),
            "pauseTime": self.pause_time,
            "startTime": self.session_start_time.isoformat() if self.session_start_time else None
        }
