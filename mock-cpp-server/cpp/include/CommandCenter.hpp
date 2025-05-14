
#pragma once

#include <memory>
#include <string>

#include "websocket/WebSocketServer.hpp"
#include "core/CommandDispatcher.hpp"
#include "game/GameManager.hpp"
#include "session/SessionManager.hpp"
#include "system/SystemMonitor.hpp"
#include "utils/Logger.hpp"

/**
 * Main class for the VR Kiosk Command Center.
 * This class initializes and coordinates all the components of the system.
 */
class CommandCenter {
public:
    /**
     * Constructor
     * @param port Port number for the WebSocket server
     * @param config_path Path to the configuration file
     */
    CommandCenter(uint16_t port, const std::string& config_path);
    
    /**
     * Start the command center
     */
    void start();
    
    /**
     * Stop the command center
     */
    void stop();
    
    /**
     * Get a reference to the GameManager
     */
    GameManager& getGameManager() { return *game_manager_; }
    
    /**
     * Get a reference to the SessionManager
     */
    SessionManager& getSessionManager() { return *session_manager_; }
    
    /**
     * Get a reference to the SystemMonitor
     */
    SystemMonitor& getSystemMonitor() { return *system_monitor_; }
    
private:
    // Register command handlers
    void registerCommands();
    
    // WebSocket server
    std::unique_ptr<WebSocketServer> websocket_server_;
    
    // Command dispatcher
    std::unique_ptr<CommandDispatcher> command_dispatcher_;
    
    // Game manager
    std::unique_ptr<GameManager> game_manager_;
    
    // Session manager
    std::unique_ptr<SessionManager> session_manager_;
    
    // System monitor
    std::unique_ptr<SystemMonitor> system_monitor_;
    
    // Logger
    std::shared_ptr<Logger> logger_;
};
