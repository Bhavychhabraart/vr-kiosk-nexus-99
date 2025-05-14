
#pragma once

#include <atomic>
#include <chrono>
#include <functional>
#include <memory>
#include <mutex>
#include <thread>

#include "utils/Logger.hpp"
#include "utils/Json.hpp"

/**
 * Class for monitoring system resources
 */
class SystemMonitor {
public:
    /**
     * Constructor
     * @param logger Logger instance
     * @param update_interval_ms How often to update system stats (milliseconds)
     */
    SystemMonitor(
        std::shared_ptr<Logger> logger,
        int update_interval_ms = 5000
    );
    
    /**
     * Destructor
     */
    ~SystemMonitor();
    
    /**
     * Start monitoring
     */
    void start();
    
    /**
     * Stop monitoring
     */
    void stop();
    
    /**
     * Get the current system stats
     * @return JSON object with system stats
     */
    json getStats() const;
    
    /**
     * Get CPU usage percentage
     * @return CPU usage as a percentage (0-100)
     */
    double getCpuUsage() const;
    
    /**
     * Get memory usage percentage
     * @return Memory usage as a percentage (0-100)
     */
    double getMemoryUsage() const;
    
    /**
     * Get available disk space in MB
     * @return Available disk space in MB
     */
    double getDiskSpace() const;
    
private:
    // Monitor thread function
    void monitorLoop();
    
    // Update system stats
    void updateStats();
    
    // CPU usage percentage
    std::atomic<double> cpu_usage_;
    
    // Memory usage percentage
    std::atomic<double> memory_usage_;
    
    // Available disk space in MB
    std::atomic<double> disk_space_;
    
    // Monitor thread
    std::unique_ptr<std::thread> monitor_thread_;
    
    // Mutex for thread synchronization
    std::mutex monitor_mutex_;
    
    // Flag to signal the monitor thread to exit
    std::atomic<bool> stop_flag_;
    
    // Update interval in milliseconds
    int update_interval_ms_;
    
    // Logger
    std::shared_ptr<Logger> logger_;
};
