
# VR Command Center Python Server

This is a robust Python WebSocket server implementation for controlling a VR kiosk system. It provides real-time communication between the frontend and the VR games, handles game launching, session management, and system monitoring.

## Features

- WebSocket communication with frontend
- Game process management
- Session timing with pause/resume functionality
- System resource monitoring (CPU, memory, disk)
- Configurable through environment variables
- Logging for monitoring and debugging

## Requirements

- Python 3.8 or higher
- Libraries: websockets, psutil, python-dotenv

## Installation

1. Clone the repository or copy the server files to your VR kiosk machine
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure the server by copying `.env.example` to `.env` and customizing settings:

```bash
cp .env.example .env
```

4. Update the `games.json` file with your actual VR game installations and paths

## Running the server

### Manual start

```bash
python server.py
```

### Running as a service (Linux/systemd)

1. Copy the service file to systemd:

```bash
sudo cp vr-server.service /etc/systemd/system/
```

2. Edit the service file to match your installation paths:

```bash
sudo nano /etc/systemd/system/vr-server.service
```

3. Enable and start the service:

```bash
sudo systemctl enable vr-server
sudo systemctl start vr-server
```

4. Check status:

```bash
sudo systemctl status vr-server
```

### Running as a Windows service

1. Install NSSM (Non-Sucking Service Manager):
   Download from: https://nssm.cc/download

2. Install the service using NSSM:

```
nssm install VRCommandCenter "C:\path\to\python.exe" "C:\path\to\server.py"
nssm set VRCommandCenter AppDirectory "C:\path\to\server\directory"
nssm start VRCommandCenter
```

## Configuration

The server can be configured using environment variables or the `.env` file:

- `VR_SERVER_HOST`: Host to bind the server to (default: 0.0.0.0)
- `VR_SERVER_PORT`: Port to listen on (default: 8081)
- `VR_GAMES_CONFIG`: Path to the games configuration file (default: games.json)
- `VR_STATUS_INTERVAL`: Interval for broadcasting status updates in seconds (default: 5)

## Game Configuration

Games are defined in the `games.json` file with the following structure:

```json
{
  "games": [
    {
      "id": "1",
      "title": "Game Name",
      "executable_path": "C:\\Path\\To\\Game.exe",
      "working_directory": "C:\\Path\\To",
      "arguments": "--optional-args",
      "description": "Game description",
      "image_url": "/games/image.jpg",
      "min_duration_seconds": 300,
      "max_duration_seconds": 1800
    }
  ]
}
```

## Troubleshooting

### Server won't start

- Check if the port is already in use: `netstat -an | grep 8081`
- Verify Python version: `python --version` (should be 3.8+)
- Check logs for errors: `tail -f vr_server.log`

### Games won't launch

- Verify the executable paths in `games.json` are correct
- Ensure the server has permission to execute the game files
- Check that any required VR software (SteamVR, etc.) is running

## Security Considerations

- The server does not implement authentication by default - it's designed for closed network kiosk usage
- For public deployments, consider adding TLS/SSL and authentication
- Limit executable paths to prevent unauthorized command execution

## License

This software is provided as-is without any warranty.
