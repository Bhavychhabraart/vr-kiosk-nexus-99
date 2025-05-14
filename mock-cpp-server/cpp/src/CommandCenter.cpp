
#include "CommandCenter.hpp"
#include "utils/Json.hpp"
#include <iostream>

CommandCenter::CommandCenter(uint16_t port, const std::string& config_path)
    : logger_(std::make_shared<Logger>()) {
    
    logger_->info("Initializing Command Center");
    
    // Create IO context
    auto io_context = std::make_shared<boost::asio::io_context>();
    
    // Create TCP endpoint
    auto endpoint = tcp::endpoint(tcp::v4(), port);
    
    // Create WebSocket server
    websocket_server_ = std::make_unique<WebSocketServer>(*io_context, endpoint, logger_);
    
    // Create command dispatcher
    command_dispatcher_ = std::make_unique<CommandDispatcher>(logger_);
    
    // Create game manager
    game_manager_ = std::make_unique<GameManager>(config_path, logger_);
    
    // Create session manager with status callback
    session_manager_ = std::make_unique<SessionManager>(
        logger_,
        [this]() {
            // Broadcast status when session changes
            broadcastStatus();
        }
    );
    
    // Create system monitor
    system_monitor_ = std::make_unique<SystemMonitor>(logger_);
    
    // Register command handlers
    registerCommands();
    
    // Set WebSocket message handler
    websocket_server_->setMessageHandler(
        [this](WebSocketSession& session, const std::string& message) {
            command_dispatcher_->dispatch(session, message);
        }
    );
    
    logger_->info("Command Center initialized successfully");
}

void CommandCenter::start() {
    logger_->info("Starting Command Center");
    
    // Start system monitor
    system_monitor_->start();
    
    // Start WebSocket server
    websocket_server_->run();
    
    logger_->info("Command Center started successfully");
}

void CommandCenter::stop() {
    logger_->info("Stopping Command Center");
    
    // End any active game
    if (game_manager_->isGameRunning()) {
        game_manager_->endGame();
    }
    
    // Stop session timer
    session_manager_->stopTimer();
    
    // Stop system monitor
    system_monitor_->stop();
    
    // Stop WebSocket server
    websocket_server_->stop();
    
    logger_->info("Command Center stopped successfully");
}

void CommandCenter::registerCommands() {
    logger_->info("Registering command handlers");
    
    // Register launchGame command handler
    command_dispatcher_->registerHandler("launchGame", [this](
        WebSocketSession& session, 
        const json& params, 
        const std::string& command_id
    ) {
        logger_->info("Handling launchGame command");
        
        // Validate required parameters
        if (!params.contains("gameId") || !params.contains("sessionDuration")) {
            json response = {
                {"id", command_id},
                {"status", "error"},
                {"error", "Missing required parameters: gameId and/or sessionDuration"},
                {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
            };
            session.send(response.dump());
            return;
        }
        
        std::string game_id = params["gameId"];
        int duration = params["sessionDuration"];
        
        // Launch game
        bool success = game_manager_->launchGame(game_id);
        
        if (success) {
            // Start session timer
            session_manager_->startTimer(duration);
            
            // Send success response
            json response = {
                {"id", command_id},
                {"status", "success"},
                {"data", {
                    {"gameId", game_id},
                    {"title", game_manager_->getCurrentGameTitle()},
                    {"running", true}
                }},
                {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
            };
            session.send(response.dump());
            
            // Broadcast status update to all clients
            broadcastStatus();
        } else {
            // Send error response
            json response = {
                {"id", command_id},
                {"status", "error"},
                {"error", "Failed to launch game: " + game_id},
                {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
            };
            session.send(response.dump());
        }
    });
    
    // Register endSession command handler
    command_dispatcher_->registerHandler("endSession", [this](
        WebSocketSession& session, 
        const json& params, 
        const std::string& command_id
    ) {
        logger_->info("Handling endSession command");
        
        bool was_running = game_manager_->isGameRunning();
        
        // End game
        game_manager_->endGame();
        
        // Stop timer
        session_manager_->stopTimer();
        
        // Send success response
        json response = {
            {"id", command_id},
            {"status", "success"},
            {"data", {
                {"wasRunning", was_running},
                {"message", "Session ended successfully"}
            }},
            {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
        };
        session.send(response.dump());
        
        // Broadcast status update to all clients
        broadcastStatus();
    });
    
    // Register pauseSession command handler
    command_dispatcher_->registerHandler("pauseSession", [this](
        WebSocketSession& session, 
        const json& params, 
        const std::string& command_id
    ) {
        logger_->info("Handling pauseSession command");
        
        if (!game_manager_->isGameRunning() || !session_manager_->isSessionActive()) {
            // Send error response
            json response = {
                {"id", command_id},
                {"status", "error"},
                {"error", "No active session to pause"},
                {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
            };
            session.send(response.dump());
            return;
        }
        
        // Pause timer
        bool success = session_manager_->pauseTimer();
        
        if (success) {
            // Send success response
            json response = {
                {"id", command_id},
                {"status", "success"},
                {"data", {
                    {"paused", true},
                    {"timeRemaining", session_manager_->getTimeRemaining()}
                }},
                {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
            };
            session.send(response.dump());
            
            // Broadcast status update to all clients
            broadcastStatus();
        } else {
            // Send error response
            json response = {
                {"id", command_id},
                {"status", "error"},
                {"error", "Failed to pause session"},
                {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
            };
            session.send(response.dump());
        }
    });
    
    // Register resumeSession command handler
    command_dispatcher_->registerHandler("resumeSession", [this](
        WebSocketSession& session, 
        const json& params, 
        const std::string& command_id
    ) {
        logger_->info("Handling resumeSession command");
        
        if (!game_manager_->isGameRunning() || !session_manager_->isSessionActive()) {
            // Send error response
            json response = {
                {"id", command_id},
                {"status", "error"},
                {"error", "No active session to resume"},
                {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
            };
            session.send(response.dump());
            return;
        }
        
        // Resume timer
        bool success = session_manager_->resumeTimer();
        
        if (success) {
            // Send success response
            json response = {
                {"id", command_id},
                {"status", "success"},
                {"data", {
                    {"paused", false},
                    {"timeRemaining", session_manager_->getTimeRemaining()}
                }},
                {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
            };
            session.send(response.dump());
            
            // Broadcast status update to all clients
            broadcastStatus();
        } else {
            // Send error response
            json response = {
                {"id", command_id},
                {"status", "error"},
                {"error", "Failed to resume session"},
                {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
            };
            session.send(response.dump());
        }
    });
    
    // Register getStatus command handler
    command_dispatcher_->registerHandler("getStatus", [this](
        WebSocketSession& session, 
        const json& params, 
        const std::string& command_id
    ) {
        logger_->info("Handling getStatus command");
        
        // Get status
        json status = getServerStatus();
        
        // Send success response
        json response = {
            {"id", command_id},
            {"status", "success"},
            {"data", {{"status", status}}},
            {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
        };
        session.send(response.dump());
    });
    
    // Register heartbeat command handler
    command_dispatcher_->registerHandler("heartbeat", [this](
        WebSocketSession& session, 
        const json& params, 
        const std::string& command_id
    ) {
        // Send success response
        json response = {
            {"id", command_id},
            {"status", "success"},
            {"data", {{"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}}},
            {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
        };
        session.send(response.dump());
    });
}

void CommandCenter::broadcastStatus() {
    // Get status
    json status = getServerStatus();
    
    // Create response
    json response = {
        {"id", std::to_string(std::chrono::system_clock::now().time_since_epoch().count())},
        {"status", "success"},
        {"data", {{"status", status}}},
        {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
    };
    
    // Broadcast to all clients
    websocket_server_->broadcast(response.dump());
}

json CommandCenter::getServerStatus() {
    // Get system stats
    json system_stats = system_monitor_->getStats();
    
    // Create status object
    json status = {
        {"connected", true},
        {"activeGame", game_manager_->isGameRunning() ? game_manager_->getCurrentGameTitle() : nullptr},
        {"gameRunning", game_manager_->isGameRunning()},
        {"isPaused", session_manager_->isSessionPaused()},
        {"timeRemaining", session_manager_->getTimeRemaining()},
        {"cpuUsage", system_stats["cpuUsage"]},
        {"memoryUsage", system_stats["memoryUsage"]},
        {"diskSpace", system_stats["diskSpace"]}
    };
    
    return status;
}
