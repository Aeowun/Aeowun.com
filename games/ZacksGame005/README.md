# ZacksGame005: The Roads Beneath

A modular RPG engine built with browser-native JavaScript modules and HTML5 Canvas.

## Lore
Based on the records of Orren Vale, a surveyor who discovered the ancient, shifting road network beneath the Western Lands. 
The game follows the journey from a quiet village toward the mysterious northern hills and the city hidden below.

## Features
- **Modular Architecture**: Fully decoupled systems for movement, combat, quests, and rendering.
- **Dynamic World**: Procedurally generated terrain with mountains, water, and village structures.
- **Interior System**: Hollow buildings with automatic roof removal when entering.
- **Quest System**: Support for 8 quest types (Talk, Hunt, Find, etc.) across 45 main chapters and 60 side stories.
- **Procedural Animation**: 4-directional human animation with stepping logic and equipment layering.
- **Multiplayer Support**: Peer-to-peer networking via Peer.js for real-time player synchronization, combat events, and room-based matchmaking.

## How to Run
Due to the use of JavaScript Modules, this project must be served via a local web server.

### Quick Start
1. **Live Server (VS Code)**: Right-click `preview.html` and select "Open with Live Server".
2. **Node.js**: Run `npx serve .` in the project root.
3. **Python**: Run `python -m http.server 8000` and visit `http://localhost:8000/preview.html`.

## Controls
- **WASD / Arrows**: Move
- **Space**: Attack
- **E**: Interact / Pick up / Talk
- **B**: Village Store

## Multiplayer
To enable multiplayer:
1. Open the game with a local web server (see "How to Run" above)
2. Press **M** key or click the "Multiplayer" button (if available) to open the multiplayer menu
3. Choose to "Create Room" or "Join Room"
4. Share the room code with friends to join

**Technical Details:**
- Uses Peer.js for WebRTC-based peer-to-peer signaling
- Room discovery via kvdb.io for host/join logic
- Player state synchronizes at ~10 updates/sec
- Attack events broadcast immediately
- Remote players clean up after 5 seconds of inactivity


