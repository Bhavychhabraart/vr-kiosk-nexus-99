
import logging
import os
import threading
import time
from typing import Optional, Dict, Any, List
from datetime import datetime

import psutil

class SystemMonitor:
    """Monitors system resources (CPU, memory, disk) and VR hardware status"""
    
    def __init__(self, logger, update_interval_ms: int = 5000):
        self.logger = logger
        self.update_interval_sec = update_interval_ms / 1000.0
        self.cpu_usage = 0.0
        self.memory_usage = 0.0
        self.disk_space = 0.0
        self.io_counters = {}
        self.network_counters = {}
        self.running = False
        self.monitor_thread: Optional[threading.Thread] = None
        
        # System diagnostics
        self.system_start_time = datetime.now()
        self.last_update_time = None
        self.alert_thresholds = {
            'cpu_percent': 80.0,
            'memory_percent': 80.0,
            'disk_percent': 90.0,
            'temperature': 70.0  # Celsius
        }
        self.alerts = []
        self.max_alerts = 100  # Maximum number of alerts to store
    
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
                self._check_alerts()
                time.sleep(self.update_interval_sec)
        except Exception as e:
            self.logger.exception(f"Error in monitor loop: {e}")
    
    def _update_stats(self):
        """Update system statistics"""
        try:
            # Record update time
            self.last_update_time = datetime.now()
            
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
            self.disk_percent = disk.percent
            
            # Get I/O statistics
            self.io_counters = psutil.disk_io_counters()
            
            # Get network statistics
            self.network_counters = psutil.net_io_counters()
            
            # Get temperature if available
            if hasattr(psutil, "sensors_temperatures"):
                temps = psutil.sensors_temperatures()
                if temps:
                    # Just take the first temperature sensor for simplicity
                    for name, entries in temps.items():
                        if entries:
                            self.temperature = entries[0].current
                            break
            
        except Exception as e:
            self.logger.exception(f"Error updating system stats: {e}")
    
    def _check_alerts(self):
        """Check for alert conditions"""
        try:
            alerts = []
            
            # Check CPU
            if self.cpu_usage > self.alert_thresholds['cpu_percent']:
                alerts.append({
                    'type': 'cpu_high',
                    'message': f"High CPU usage: {self.cpu_usage:.1f}%",
                    'value': self.cpu_usage,
                    'threshold': self.alert_thresholds['cpu_percent'],
                    'timestamp': datetime.now().isoformat()
                })
            
            # Check memory
            if self.memory_usage > self.alert_thresholds['memory_percent']:
                alerts.append({
                    'type': 'memory_high',
                    'message': f"High memory usage: {self.memory_usage:.1f}%",
                    'value': self.memory_usage,
                    'threshold': self.alert_thresholds['memory_percent'],
                    'timestamp': datetime.now().isoformat()
                })
            
            # Check disk
            if hasattr(self, 'disk_percent') and self.disk_percent > self.alert_thresholds['disk_percent']:
                alerts.append({
                    'type': 'disk_high',
                    'message': f"High disk usage: {self.disk_percent:.1f}%",
                    'value': self.disk_percent,
                    'threshold': self.alert_thresholds['disk_percent'],
                    'timestamp': datetime.now().isoformat()
                })
            
            # Check temperature
            if hasattr(self, 'temperature') and self.temperature > self.alert_thresholds['temperature']:
                alerts.append({
                    'type': 'temperature_high',
                    'message': f"High system temperature: {self.temperature:.1f}°C",
                    'value': self.temperature,
                    'threshold': self.alert_thresholds['temperature'],
                    'timestamp': datetime.now().isoformat()
                })
            
            # Add any new alerts to our alert list
            for alert in alerts:
                self.logger.warning(f"System alert: {alert['message']}")
                self.alerts.append(alert)
            
            # Trim alerts list if too long
            if len(self.alerts) > self.max_alerts:
                self.alerts = self.alerts[-self.max_alerts:]
                
        except Exception as e:
            self.logger.exception(f"Error checking alerts: {e}")
    
    def get_cpu_usage(self) -> float:
        """Get CPU usage percentage"""
        return self.cpu_usage
    
    def get_memory_usage(self) -> float:
        """Get memory usage percentage"""
        return self.memory_usage
    
    def get_disk_space(self) -> float:
        """Get available disk space in MB"""
        return self.disk_space
    
    def get_system_uptime(self) -> float:
        """Get system uptime in seconds"""
        return (datetime.now() - self.system_start_time).total_seconds()
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """Get all system metrics as a dictionary"""
        metrics = {
            'cpu_usage': self.cpu_usage,
            'memory_usage': self.memory_usage,
            'disk_space_mb': self.disk_space,
            'uptime_seconds': self.get_system_uptime(),
            'last_update': self.last_update_time.isoformat() if self.last_update_time else None,
        }
        
        # Add disk percent if available
        if hasattr(self, 'disk_percent'):
            metrics['disk_percent'] = self.disk_percent
        
        # Add temperature if available
        if hasattr(self, 'temperature'):
            metrics['temperature'] = self.temperature
        
        # Add IO counters if available
        if hasattr(self, 'io_counters') and self.io_counters:
            metrics['io'] = {
                'read_bytes': self.io_counters.read_bytes,
                'write_bytes': self.io_counters.write_bytes,
                'read_count': self.io_counters.read_count,
                'write_count': self.io_counters.write_count
            }
        
        # Add network counters if available
        if hasattr(self, 'network_counters') and self.network_counters:
            metrics['network'] = {
                'bytes_sent': self.network_counters.bytes_sent,
                'bytes_recv': self.network_counters.bytes_recv,
                'packets_sent': self.network_counters.packets_sent,
                'packets_recv': self.network_counters.packets_recv
            }
        
        return metrics
    
    def get_recent_alerts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent system alerts"""
        return self.alerts[-limit:] if self.alerts else []
    
    def set_alert_threshold(self, metric_name: str, value: float) -> bool:
        """Set an alert threshold"""
        if metric_name in self.alert_thresholds:
            self.alert_thresholds[metric_name] = value
            self.logger.info(f"Alert threshold for {metric_name} set to {value}")
            return True
        else:
            self.logger.warning(f"Unknown alert metric: {metric_name}")
            return False
