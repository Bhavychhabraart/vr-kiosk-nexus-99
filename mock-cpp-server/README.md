
# VR Kiosk Command Center

This folder contains both a TypeScript mock implementation and a real C++ implementation of the WebSocket server used for the VR kiosk system.

## TypeScript Mock Server

The TypeScript mock server is intended for development and testing purposes only.

### Mock Server Usage

1. Install dependencies:
   ```
   npm install ws
   ```

2. Run the mock server:
   ```
   npx ts-node server.ts
   ```

3. The mock server will run on port 8081 by default.

## C++ Implementation

The `cpp` directory contains a real implementation of the command center written in C++ using Boost.Beast for WebSockets. See the [C++ README](./cpp/README.md) for more details.

### C++ Server Features

- WebSocket communication using Boost.Beast
- Game process management
- Session timing with pause/resume
- System resource monitoring
- Robust error handling
- Cross-platform (Windows and Linux)

### Building the C++ Server

```bash
cd cpp
mkdir build
cd build
cmake ..
make
```

### Running the C++ Server

```bash
./vr_command_center
```

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

Both the TypeScript mock and C++ implementation can be tested using the browser console by connecting to `ws://localhost:8081` or using tools like Postman with WebSocket support.
