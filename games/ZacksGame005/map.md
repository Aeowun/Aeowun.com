# Technical Code Map

This document maps game features to their specific implementation files and logic.

## 🛠️ Core Infrastructure
- **Global Constants**: [config.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/config.js)
    - Tile Definitions (Lines 5-14)
    - World Dimensions (Lines 1-3)
- **Central State**: [gameState.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/state/gameState.js)
    - The single source of truth for player, enemies, NPCs, and UI state.
    - Multiplayer state management (see multiplayer.js)
- **Main Loop**: [main.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/main.js)
    - Camera Follow Logic (Lines 36-39)
    - Multiplayer update loop

## 🗺️ World & Environment
- **Map Structure**: [map.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/world/map.js)
- **Procedural Generation**: [worldGenerator.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/world/worldGenerator.js)
    - Building/Interior logic (Lines 29-44)
    - Road Generation (Lines 19-27)
- **Terrain Rendering**: [worldRenderer.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/rendering/worldRenderer.js)
    - X-Ray Roof Logic (Lines 60-83): Roofs are rendered after NPCs/Player to hide them when the player is outside.
    - Tree Transparency (Lines 105-110)

## ⚔️ Gameplay Systems
- **Movement & Collision**: [movement.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/systems/movement.js)
    - Collision Detection (Lines 5-11)
    - World Teleportation (Cave Trigger)
- **Combat & Damage**: [combat.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/systems/combat.js)
    - Weapon Damage Calculation (Line 16)
    - Enemy AI / Aggro (Lines 37-51)
- **Quest Logic**: [quests.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/systems/quests.js)
    - Quest Type Handlers (Lines 35-65)
- **Interaction**: [interaction.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/systems/interaction.js)
    - E-key routing (Lines 13-75)
- **Audio System**: [audio.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/systems/audio.js)
    - BGM Management (Overworld vs Dungeon)
    - SFX Handling (Slash, Hit, Footsteps)

## 🌐 Multiplayer Networking
- **Multiplayer System**: [multiplayer.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/systems/multiplayer.js)
  - PeerJS P2P transport initialization
  - Throttled player state synchronization (~10 updates/sec)
  - Immediate attack event broadcasting
  - Remote player state tracking with ghost-cleanup (5s timeout)
  - Connection/disconnection lifecycle handling
  - Integration with room-discovery.js for host/join logic
  - **New flow:**
    1. `loadPeerJS()` → creates Peer instance
    2. `handlePeerOpen()` → attempt to claim/create/join room
    3. Host accepts connections; clients connect to host Peer ID
    4. Heartbeat via room-discovery.js keeps room listing alive
    5. All existing broadcast, ghost cleanup, and notification logic preserved

## 🎨 Visuals & UI
- **Human Animation**: [human.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/rendering/human.js)
    - Vertical Stepping (Lines 57-73)
    - 4-Way Facing (Lines 35-149)
- **UI & HUD**: [uiRenderer.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/rendering/uiRenderer.js)
    - Debug Tile Info (Top Center Display)
- **Layering/Equip Logic**: [renderer.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/rendering/renderer.js)
    - Equipment rendering order (Lines 88-128)

## 📜 Quest Data
- **Main & Side Quests**: [quests.js](file:///C:/Dev/Projects/Websites/Aeowun.com/Aeowun.com/games/ZacksGame005/js/data/quests.js)