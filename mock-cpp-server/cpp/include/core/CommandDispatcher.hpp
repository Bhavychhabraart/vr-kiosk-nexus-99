
#pragma once

#include <functional>
#include <memory>
#include <string>
#include <unordered_map>

#include "websocket/WebSocketSession.hpp"
#include "utils/Json.hpp"
#include "utils/Logger.hpp"

/**
 * CommandHandler type definition
 */
using CommandHandler = std::function<void(WebSocketSession&, const json& params, const std::string& command_id)>;

/**
 * Class that dispatches incoming commands to registered handlers
 */
class CommandDispatcher {
public:
    /**
     * Constructor
     * @param logger Logger instance
     */
    explicit CommandDispatcher(std::shared_ptr<Logger> logger);
    
    /**
     * Register a command handler
     * @param command_type Type of command
     * @param handler Function to handle the command
     */
    void registerHandler(const std::string& command_type, CommandHandler handler);
    
    /**
     * Dispatch a command to the appropriate handler
     * @param session WebSocket session
     * @param message JSON message
     */
    void dispatch(WebSocketSession& session, const std::string& message);
    
private:
    // Map of command types to handlers
    std::unordered_map<std::string, CommandHandler> handlers_;
    
    // Logger
    std::shared_ptr<Logger> logger_;
};
