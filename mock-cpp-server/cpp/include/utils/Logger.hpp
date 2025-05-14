
#pragma once

#include <fstream>
#include <memory>
#include <mutex>
#include <string>

/**
 * Simple logger class
 */
class Logger {
public:
    // Log levels
    enum class Level {
        DEBUG,
        INFO,
        WARNING,
        ERROR,
        CRITICAL
    };
    
    /**
     * Constructor
     * @param log_file Path to log file (empty for console only)
     * @param console_output Whether to output to console
     * @param min_level Minimum log level to output
     */
    Logger(
        const std::string& log_file = "",
        bool console_output = true,
        Level min_level = Level::INFO
    );
    
    /**
     * Destructor
     */
    ~Logger();
    
    /**
     * Log a message at DEBUG level
     * @param message Message to log
     */
    void debug(const std::string& message);
    
    /**
     * Log a message at INFO level
     * @param message Message to log
     */
    void info(const std::string& message);
    
    /**
     * Log a message at WARNING level
     * @param message Message to log
     */
    void warning(const std::string& message);
    
    /**
     * Log a message at ERROR level
     * @param message Message to log
     */
    void error(const std::string& message);
    
    /**
     * Log a message at CRITICAL level
     * @param message Message to log
     */
    void critical(const std::string& message);
    
    /**
     * Set the minimum log level
     * @param level Minimum log level
     */
    void setMinLevel(Level level);
    
private:
    // Log a message at the specified level
    void log(Level level, const std::string& message);
    
    // Convert log level to string
    static std::string levelToString(Level level);
    
    // Get current timestamp as string
    static std::string getCurrentTimestamp();
    
    // Minimum log level
    Level min_level_;
    
    // Whether to output to console
    bool console_output_;
    
    // Log file
    std::ofstream log_file_;
    
    // Mutex for thread safety
    std::mutex log_mutex_;
};
