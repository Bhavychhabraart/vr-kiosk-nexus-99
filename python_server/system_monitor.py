
import logging
import os
import threading
import time
from typing import Optional

import psutil

class SystemMonitor:
    """Monitors system resources (CPU, memory, disk)"""
    
    def __init__(self, logger, update_interval_ms: int = 5000):
        self.logger = logger
        self.update_interval_sec = update_interval_ms / 1000.0
        self.cpu_usage = 0.0
        self.memory_usage = 0.0
        self.disk_space = 0.0
        self.running = False
        self.monitor_thread: Optional[threading.Thread] = None
    
    def start(self):
        """Start monitoring system resources"""
        if self.running:
            return
            
        self.logger.info("Starting system monitor")
        self.running = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
    
    def stop(self):
        """Stop monitoring system resources"""
        self.logger.info("Stopping system monitor")
        self.running = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=2.0)
    
    def _monitor_loop(self):
        """Background thread that updates system stats"""
        try:
            while self.running:
                self._update_stats()
                time.sleep(self.update_interval_sec)
        except Exception as e:
            self.logger.exception(f"Error in monitor loop: {e}")
    
    def _update_stats(self):
        """Update system statistics"""
        try:
            # Get CPU usage (average across all cores)
            self.cpu_usage = psutil.cpu_percent(interval=1)
            
            # Get memory usage
            memory = psutil.virtual_memory()
            self.memory_usage = memory.percent
            
            # Get disk space (use root disk on Linux or C: on Windows)
            if os.name == 'nt':  # Windows
                disk_path = 'C:\\'
            else:  # Linux/Mac
                disk_path = '/'
                
            disk = psutil.disk_usage(disk_path)
            self.disk_space = disk.free / (1024 * 1024)  # Free space in MB
            
        except Exception as e:
            self.logger.exception(f"Error updating system stats: {e}")
    
    def get_cpu_usage(self) -> float:
        """Get CPU usage percentage"""
        return self.cpu_usage
    
    def get_memory_usage(self) -> float:
        """Get memory usage percentage"""
        return self.memory_usage
    
    def get_disk_space(self) -> float:
        """Get available disk space in MB"""
        return self.disk_space
