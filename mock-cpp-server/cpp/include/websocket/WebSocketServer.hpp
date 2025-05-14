
#pragma once

#include <boost/asio.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <functional>
#include <memory>
#include <string>
#include <unordered_set>
#include <vector>

#include "websocket/WebSocketSession.hpp"
#include "utils/Logger.hpp"

namespace beast = boost::beast;
namespace http = beast::http;
namespace websocket = beast::websocket;
namespace asio = boost::asio;
using tcp = boost::asio::ip::tcp;

/**
 * WebSocket server class that handles incoming connections
 */
class WebSocketServer : public std::enable_shared_from_this<WebSocketServer> {
public:
    /**
     * Constructor
     * @param ioc IO context
     * @param endpoint TCP endpoint
     * @param logger Logger instance
     */
    WebSocketServer(
        asio::io_context& ioc, 
        tcp::endpoint endpoint,
        std::shared_ptr<Logger> logger
    );
    
    /**
     * Start accepting connections
     */
    void run();
    
    /**
     * Stop the server
     */
    void stop();
    
    /**
     * Set message handler function
     * @param handler Function to handle incoming messages
     */
    void setMessageHandler(
        std::function<void(WebSocketSession&, const std::string&)> handler
    );
    
    /**
     * Broadcast a message to all connected clients
     * @param message Message to broadcast
     */
    void broadcast(const std::string& message);
    
private:
    // Accept incoming connections
    void do_accept();
    
    // Handle new connection
    void on_accept(beast::error_code ec, tcp::socket socket);
    
    // Remove session from tracked sessions
    void remove_session(WebSocketSession* session);
    
    // IO context
    asio::io_context& ioc_;
    
    // Acceptor
    tcp::acceptor acceptor_;
    
    // Active sessions
    std::unordered_set<WebSocketSession*> sessions_;
    
    // Message handler
    std::function<void(WebSocketSession&, const std::string&)> message_handler_;
    
    // Logger
    std::shared_ptr<Logger> logger_;
    
    // Is the server running
    bool running_;
};
