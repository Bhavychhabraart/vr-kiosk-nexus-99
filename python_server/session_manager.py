
import asyncio
import logging
import time
from typing import Optional, Callable

class SessionManager:
    """Manages game sessions and timers"""
    
    def __init__(self, logger, status_callback: Callable):
        self.logger = logger
        self.status_callback = status_callback
        self.session_duration = 0
        self.time_remaining = 0
        self.is_active = False
        self.is_paused = False
        self.timer_task: Optional[asyncio.Task] = None
    
    def start_timer(self, duration_seconds: int) -> bool:
        """Start a session timer"""
        if self.is_active:
            self.stop_timer()
            
        self.logger.info(f"Starting session timer for {duration_seconds} seconds")
        self.session_duration = duration_seconds
        self.time_remaining = duration_seconds
        self.is_active = True
        self.is_paused = False
        
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
        return True
    
    def resume_timer(self) -> bool:
        """Resume the current timer"""
        if not self.is_active or not self.is_paused:
            return False
            
        self.logger.info("Resuming session timer")
        self.is_paused = False
        return True
    
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
                
                # Broadcast status periodically (every 10 seconds) or when time gets low
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
    
    def get_time_remaining(self) -> int:
        """Get the remaining time in seconds"""
        return self.time_remaining if self.is_active else 0
    
    def is_session_active(self) -> bool:
        """Check if a session is active"""
        return self.is_active
    
    def is_paused(self) -> bool:
        """Check if the session is paused"""
        return self.is_paused
