
# VR Kiosk Command Center - C++ Implementation

This folder contains the C++ implementation of the VR Kiosk Command Center WebSocket server.

## Dependencies

- C++17 or later
- CMake 3.10 or later
- Boost 1.70 or later (Asio, Beast)
- nlohmann/json
- OpenSSL

## Building

```bash
mkdir build
cd build
cmake ..
make
```

## Running

```bash
./vr_command_center
```

### Command-line options

- `--port` or `-p`: WebSocket server port (default: 8081)
- `--config` or `-c`: Path to game configuration file (default: `config/games.json`)
- `--log-file` or `-l`: Path to log file (default: `logs/command_center.log`)
- `--verbose` or `-v`: Enable verbose logging
- `--help` or `-h`: Show help message

## Architecture

The command center consists of the following components:

- `WebSocketServer`: Handles WebSocket connections and message routing
- `CommandDispatcher`: Routes incoming commands to appropriate handlers
- `GameManager`: Manages game processes and configurations
- `SessionManager`: Manages session timers and state
- `SystemMonitor`: Monitors system resources (CPU, memory, disk)

## Configuration

Game configurations are stored in a JSON file (`config/games.json`). Each game entry contains:

- `id`: Unique identifier
- `title`: Display name
- `executable_path`: Path to game executable
- `working_directory`: Working directory for game process
- `arguments`: Command-line arguments for game
- `description`: Game description
- `image_url`: Path to game image
- `min_duration_seconds`: Minimum session duration
- `max_duration_seconds`: Maximum session duration

## Communication Protocol

The WebSocket communication protocol uses JSON messages with the following structure:

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

## Platform Support

This implementation is designed to work on both Windows and Linux platforms.
