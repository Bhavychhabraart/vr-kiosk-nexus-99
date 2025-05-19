
# VR Command Center Python Server

A robust WebSocket server implementation for controlling a VR kiosk system. It provides real-time communication between the frontend and VR games, handling game launching, session management, and system monitoring.

## Features

- **WebSocket Communication**: Real-time bidirectional communication with the frontend
- **Game Management**: Launch, monitor, and terminate VR game processes
- **Session Management**: Track session time, handle pause/resume, enforce limits
- **System Monitoring**: Track CPU, memory, and disk usage to ensure system health
- **Configurable Settings**: Extensive configuration through environment variables
- **Detailed Logging**: Comprehensive logging for troubleshooting and auditing
- **Service Integration**: Ready-to-use systemd service configuration

## Requirements

- Python 3.8 or higher
- Required Python packages (see `requirements.txt`)
- Operating system: Linux (recommended), Windows, or macOS

## Quick Start

### Installation

```bash
# Clone the repository (if needed)
git clone <repository-url>
cd vr-command-center/python_server

# Run the installation script
chmod +x install.sh
./install.sh
```

### Starting the Server

```bash
# Activate the virtual environment
source venv/bin/activate

# Start the server
python server.py
```

## Configuration

The server can be configured through environment variables or the `.env` file:

### Core Settings
- `VR_SERVER_HOST`: Host to bind the server to (default: 0.0.0.0)
- `VR_SERVER_PORT`: Port to listen on (default: 8081)
- `VR_GAMES_CONFIG`: Path to the games configuration file (default: games.json)
- `VR_STATUS_INTERVAL`: Interval for broadcasting status updates in seconds (default: 5)

### Session Settings
- `VR_DEFAULT_SESSION_DURATION`: Default game session length in seconds (default: 600)
- `VR_MAX_SESSION_DURATION`: Maximum allowed session duration (default: 3600)
- `VR_AUTO_END_TIMEOUT`: Time to auto-end inactive sessions (default: 300)

### Monitoring Thresholds
- `VR_CPU_WARNING_THRESHOLD`: CPU usage warning threshold percentage (default: 80)
- `VR_MEMORY_WARNING_THRESHOLD`: Memory usage warning threshold percentage (default: 80)
- `VR_DISK_WARNING_THRESHOLD`: Disk space warning threshold percentage (default: 90)

### Logging Configuration
- `LOG_LEVEL`: Logging level (default: INFO)
- `LOG_FILE`: Log file path (optional, defaults to console)

## Game Configuration

Games are defined in the `games.json` file with the following structure:

```json
{
  "games": [
    {
      "id": "uniqueId",
      "title": "Game Name",
      "executable_path": "/path/to/game.exe",
      "working_directory": "/path/to",
      "arguments": "--optional-args",
      "description": "Game description",
      "image_url": "/images/game.jpg",
      "min_duration_seconds": 300,
      "max_duration_seconds": 1800
    }
  ]
}
```

## WebSocket API

The server implements a JSON-based WebSocket API with the following commands:

### Commands
- `launchGame`: Launch a game by ID with specified session duration
- `endSession`: End the current game session
- `pauseSession`: Pause the current session timer
- `resumeSession`: Resume a paused session timer
- `getStatus`: Get current server status
- `heartbeat`: Keep connection alive

### Response Format
```json
{
  "id": "command-id",
  "status": "success|error",
  "data": { /* response data */ },
  "error": "error message if status is error",
  "timestamp": 1621234567890
}
```

## Running as a Service

To run the server as a system service on Linux with systemd:

```bash
sudo cp vr-server.service /etc/systemd/system/
sudo systemctl enable vr-server
sudo systemctl start vr-server
```

## Troubleshooting

### Server won't start
- Check if the port is already in use: `netstat -an | grep 8081`
- Verify Python version: `python --version`
- Check logs: `tail -f logs/vr_server.log`

### Games won't launch
- Verify executable paths in `games.json`
- Ensure the server has permission to execute the game files
- Check that required VR software (SteamVR, etc.) is running

## Security Considerations

- This server is designed for closed network/kiosk setups
- For public deployments, implement authentication and TLS/SSL
- Validate all client input to prevent command injection
