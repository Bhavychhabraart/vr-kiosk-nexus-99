
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
 * Class for managing game sessions and timers
 */
class SessionManager {
public:
    /**
     * Constructor
     * @param logger Logger instance
     * @param status_callback Function to call when session status changes
     */
    SessionManager(
        std::shared_ptr<Logger> logger,
        std::function<void()> status_callback
    );
    
    /**
     * Destructor
     */
    ~SessionManager();
    
    /**
     * Start a session timer
     * @param duration_seconds Duration of the session in seconds
     * @return true if timer was started successfully, false otherwise
     */
    bool startTimer(int duration_seconds);
    
    /**
     * Stop the current timer
     * @return true if timer was stopped successfully, false otherwise
     */
    bool stopTimer();
    
    /**
     * Pause the current timer
     * @return true if timer was paused successfully, false otherwise
     */
    bool pauseTimer();
    
    /**
     * Resume the current timer
     * @return true if timer was resumed successfully, false otherwise
     */
    bool resumeTimer();
    
    /**
     * Get the status of the session manager
     * @return JSON object with status information
     */
    json getStatus() const;
    
    /**
     * Get the remaining time
     * @return Remaining time in seconds
     */
    int getTimeRemaining() const;
    
    /**
     * Check if a session is active
     * @return true if a session is active, false otherwise
     */
    bool isSessionActive() const;
    
    /**
     * Check if the session is paused
     * @return true if the session is paused, false otherwise
     */
    bool isSessionPaused() const;
    
private:
    // Timer thread function
    void timerLoop();
    
    // Total duration of the session in seconds
    int session_duration_;
    
    // Remaining time in seconds
    std::atomic<int> time_remaining_;
    
    // Is the session active
    std::atomic<bool> is_active_;
    
    // Is the session paused
    std::atomic<bool> is_paused_;
    
    // Timer thread
    std::unique_ptr<std::thread> timer_thread_;
    
    // Mutex for thread synchronization
    std::mutex timer_mutex_;
    
    // Flag to signal the timer thread to exit
    std::atomic<bool> stop_flag_;
    
    // Function to call when session status changes
    std::function<void()> status_callback_;
    
    // Logger
    std::shared_ptr<Logger> logger_;
};
