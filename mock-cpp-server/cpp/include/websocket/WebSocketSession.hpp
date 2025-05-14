
#pragma once

#include <boost/asio.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <memory>
#include <string>
#include <queue>
#include <mutex>

#include "utils/Logger.hpp"

namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace asio = boost::asio;
using tcp = boost::asio::ip::tcp;

/**
 * Class representing a WebSocket client connection
 */
class WebSocketSession : public std::enable_shared_from_this<WebSocketSession> {
public:
    /**
     * Constructor
     * @param socket TCP socket
     * @param logger Logger instance
     */
    explicit WebSocketSession(
        tcp::socket&& socket,
        std::shared_ptr<Logger> logger
    );
    
    /**
     * Start the session
     * @param message_handler Function to call when a message is received
     * @param close_handler Function to call when the connection is closed
     */
    void start(
        std::function<void(WebSocketSession&, const std::string&)> message_handler,
        std::function<void(WebSocketSession*)> close_handler
    );
    
    /**
     * Send a message to the client
     * @param message Message to send
     */
    void send(const std::string& message);
    
    /**
     * Close the connection
     */
    void close();
    
    /**
     * Get the remote endpoint address
     */
    std::string getRemoteEndpoint() const;
    
private:
    // Read a message from the client
    void do_read();
    
    // Write queued messages to the client
    void do_write();
    
    // WebSocket
    websocket::stream<tcp::socket> ws_;
    
    // Read buffer
    beast::flat_buffer buffer_;
    
    // Write queue
    std::queue<std::string> write_queue_;
    
    // Mutex for write queue
    std::mutex write_mutex_;
    
    // Flag to track if a write operation is in progress
    bool writing_;
    
    // Message handler
    std::function<void(WebSocketSession&, const std::string&)> message_handler_;
    
    // Close handler
    std::function<void(WebSocketSession*)> close_handler_;
    
    // Logger
    std::shared_ptr<Logger> logger_;
};
