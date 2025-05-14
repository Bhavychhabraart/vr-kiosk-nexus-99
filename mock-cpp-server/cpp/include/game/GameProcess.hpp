
#pragma once

#include <memory>
#include <string>

#include "utils/Logger.hpp"

/**
 * Class for managing a game process
 */
class GameProcess {
public:
    /**
     * Constructor
     * @param executable Path to the game executable
     * @param arguments Command-line arguments for the game
     * @param working_directory Working directory for the game process
     * @param logger Logger instance
     */
    GameProcess(
        const std::string& executable,
        const std::string& arguments,
        const std::string& working_directory,
        std::shared_ptr<Logger> logger
    );
    
    /**
     * Destructor (ensures process is terminated)
     */
    ~GameProcess();
    
    /**
     * Start the game process
     * @return true if process was started successfully, false otherwise
     */
    bool start();
    
    /**
     * Terminate the game process
     * @return true if process was terminated successfully, false otherwise
     */
    bool terminate();
    
    /**
     * Check if the process is running
     * @return true if the process is running, false otherwise
     */
    bool isRunning() const;
    
    /**
     * Get the process ID
     * @return Process ID if the process is running, -1 otherwise
     */
    int getProcessId() const;
    
private:
    // Path to the game executable
    std::string executable_;
    
    // Command-line arguments for the game
    std::string arguments_;
    
    // Working directory for the game process
    std::string working_directory_;
    
    // Process ID
    int process_id_;
    
    // Logger
    std::shared_ptr<Logger> logger_;
    
    // Is the process running
    bool running_;
};
