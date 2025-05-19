
# VR Command Center

A comprehensive VR kiosk management system with a React frontend and Python WebSocket backend for controlling VR games and monitoring system status.

## Overview

The VR Command Center is designed for managing virtual reality kiosks in public spaces such as arcades, museums, or entertainment centers. It provides a user-friendly interface for:

- Launching VR games and applications
- Managing play sessions with time limits
- Monitoring system performance in real-time
- Collecting user feedback and ratings

## Architecture

The system consists of two main components:

1. **Frontend**: React-based web application that provides the user interface
2. **Backend**: Python WebSocket server that manages games, sessions, and system monitoring

![Architecture Diagram](./docs/architecture.png)

### Communication Protocol

The frontend and backend communicate using a WebSocket-based protocol with JSON messages. Commands are sent from the frontend to the backend, and the backend responds with status updates or command responses.

## Getting Started

### Prerequisites

- Node.js 16+ and npm for the frontend
- Python 3.8+ for the backend
- A machine with compatible VR hardware

### Frontend Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd vr-command-center
   npm install
   ```
3. Create a `.env` file with the WebSocket server URL:
   ```
   VITE_WS_SERVER_URL=ws://localhost:8081
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the python_server directory
2. Run the installation script:
   ```
   cd python_server
   chmod +x install.sh
   ./install.sh
   ```
3. Update the games.json file with your VR game configurations
4. Start the server:
   ```
   source venv/bin/activate
   python server.py
   ```

### System Service Setup

For production deployment, set up the WebSocket server as a system service:

```
sudo cp vr-server.service /etc/systemd/system/
sudo systemctl enable vr-server
sudo systemctl start vr-server
```

## Features

### Game Management

- Browse and launch VR games
- Customizable session durations
- Real-time session status and timers
- Session control (pause, resume, end)

### System Monitoring

- Real-time CPU, memory, and disk usage monitoring
- Warning thresholds for system resources
- Connection status indicators

### User Experience

- Game ratings and feedback collection
- Responsive interface for both desktop and mobile devices
- Visual notifications for important events

## Configuration

### Environment Variables

#### Frontend (.env)
- `VITE_WS_SERVER_URL`: WebSocket server URL

#### Backend (.env)
- `VR_SERVER_HOST`: Host to bind the server to (default: 0.0.0.0)
- `VR_SERVER_PORT`: Port to listen on (default: 8081)
- `VR_GAMES_CONFIG`: Path to games configuration file (default: games.json)
- `VR_STATUS_INTERVAL`: Status broadcast interval in seconds (default: 5)
- `VR_DEFAULT_SESSION_DURATION`: Default session duration in seconds (default: 600)
- `VR_MAX_SESSION_DURATION`: Maximum allowed session duration (default: 3600)
- `VR_AUTO_END_TIMEOUT`: Time to auto-end inactive sessions (default: 300)
- `VR_CPU_WARNING_THRESHOLD`: CPU usage warning threshold percentage (default: 80)
- `VR_MEMORY_WARNING_THRESHOLD`: Memory usage warning threshold percentage (default: 80)
- `VR_DISK_WARNING_THRESHOLD`: Disk usage warning threshold percentage (default: 90)
- `LOG_LEVEL`: Logging level (default: INFO)

### Game Configuration

Games are configured in the `games.json` file with the following structure:

```json
{
  "games": [
    {
      "id": "game1",
      "title": "Example VR Game",
      "executable_path": "/path/to/game.exe",
      "working_directory": "/path/to",
      "arguments": "--vr --fullscreen",
      "description": "An exciting VR adventure",
      "image_url": "/images/game1.jpg",
      "min_duration_seconds": 300,
      "max_duration_seconds": 1800
    }
  ]
}
```

## Development

### WebSocket Protocol

#### Commands

- `launchGame`: Launch a specific VR game
  - Parameters: `gameId`, `sessionDuration`
- `endSession`: End the current game session
- `pauseSession`: Pause the current session timer
- `resumeSession`: Resume the current session timer
- `getStatus`: Get current system status
- `heartbeat`: Keep connection alive
- `submitRating`: Submit a user rating for a game
  - Parameters: `gameId`, `rating`

#### Responses

All responses follow this structure:
```json
{
  "id": "command-id",
  "status": "success|error|partial",
  "data": {
    // Response data specific to the command
  },
  "error": "Error message if status is error",
  "timestamp": 1620000000000
}
```

## Future Enhancements

- User authentication system
- Session history and analytics
- Payment integration for commercial kiosks
- Multiple kiosk management from a central server

## License

This project is licensed under the MIT License - see the LICENSE file for details.
