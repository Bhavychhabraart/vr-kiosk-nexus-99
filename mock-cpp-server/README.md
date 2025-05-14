
# VR Kiosk Command Center

This folder contains a TypeScript mock implementation of the C++ WebSocket server that would be used in the real VR kiosk system. This mock server is intended for development and testing purposes only.

## Mock Server Usage

1. Install dependencies:
   ```
   npm install ws
   ```

2. Run the mock server:
   ```
   npx ts-node server.ts
   ```

3. The mock server will run on port 8081 by default.

## Real C++ Implementation Guidelines

In a real implementation, the command center would be written in C++ using a library like Boost.Beast for WebSockets. Here's what it would look like:

### Dependencies

- Boost.Beast for WebSocket communication
- JSON library (e.g., nlohmann/json)
- Process management library (platform dependent)
- Logging library (e.g., spdlog)

### Architecture

```
CommandCenter
├── WebSocketServer      # Handles WebSocket connections
├── CommandDispatcher    # Routes commands to appropriate handlers
├── GameManager          # Manages game processes
│   └── GameProcess      # Wrapper around a running game process
├── SessionManager       # Manages active sessions and timers
├── SystemMonitor        # Monitors system resources (CPU, memory, etc.)
└── Logger               # Handles logging
```

### Sample C++ Code Structure

```cpp
// WebSocketServer.hpp
class WebSocketServer {
public:
    WebSocketServer(uint16_t port);
    void start();
    void stop();
    
private:
    void on_accept(boost::system::error_code ec, tcp::socket socket);
    void do_accept();
    
    tcp::acceptor acceptor_;
    boost::asio::io_context ioc_;
    std::vector<std::shared_ptr<WebSocketSession>> sessions_;
};

// CommandDispatcher.hpp
class CommandDispatcher {
public:
    void register_handler(const std::string& command_type, CommandHandlerFn handler);
    void dispatch(const std::string& message, WebSocketSession& session);
    
private:
    std::unordered_map<std::string, CommandHandlerFn> handlers_;
};

// GameManager.hpp
class GameManager {
public:
    bool launch_game(const std::string& game_id, int duration_seconds);
    bool end_game();
    bool pause_game();
    bool resume_game();
    GameStatus get_status() const;
    
private:
    std::unique_ptr<GameProcess> current_game_;
    GameConfig game_configs_;
    SessionTimer session_timer_;
};
```

### Security Considerations

1. **Command Validation**: All commands should be validated to prevent injection attacks
2. **Process Isolation**: Games should run in isolated environments
3. **Resource Limits**: Implement resource limits to prevent system overload
4. **Authentication**: Use secure authentication for WebSocket connections
5. **Logging**: Maintain detailed logs for audit and debugging

### Real-World Deployment

In a real VR kiosk deployment:

1. The C++ server would run as a system service
2. It would start automatically on system boot
3. It would have watchdog processes to ensure reliability
4. It would log to both local files and possibly remote monitoring services
5. It would include mechanisms for remote updates and management

## Communication Protocol

The WebSocket communication protocol is based on JSON messages with the following structure:

### Commands (Client to Server)

```json
{
  "id": "unique-command-id",
  "type": "commandType",
  "params": {
    "key1": "value1",
    "key2": "value2"
  },
  "timestamp": 1620000000000
}
```

### Responses (Server to Client)

```json
{
  "id": "unique-command-id",
  "status": "success|error|partial",
  "data": {
    "key1": "value1",
    "key2": "value2"
  },
  "error": "Error message if status is error",
  "timestamp": 1620000000000
}
```

## Supported Commands

- `launchGame`: Launch a game with specified ID and session duration
- `endSession`: End the current session
- `pauseSession`: Pause the current session
- `resumeSession`: Resume the current session
- `getStatus`: Get the current server status
- `heartbeat`: Keep connection alive

## Testing

The mock server can be tested using the browser console by connecting to `ws://localhost:8081` or using a tool like Postman or WebSocket.org's echo test.
