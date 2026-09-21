# Changelog

## [1.3.0] - Multiplayer Networking
- **Feature**: Added Peer-to-Peer multiplayer support via Peer.js
- **Feature**: Real-time player state synchronization (~10 updates/sec)
- **Feature**: Immediate attack event broadcasting across peers
- **Feature**: Remote player state tracking with automatic ghost-cleanup (5s timeout)
- **Feature**: Room discovery and matchmaking via kvdb.io (host/join logic)
- **Feature**: Heartbeat system to keep room listings alive
- **Feature**: 5-second player timeout for disconnected peers
- **Feature**: Room creation/claiming and joining existing rooms
- **Feature**: Heartbeat system to keep room listings alive
- **Feature**: Room creation/claiming and joining existing rooms
- **Feature**: Player count updates in room records
- **Feature**: Automatic room removal on host disconnect

## [1.2.0] - Interior System & Interaction Polish
- **Feature**: Added `Floor` and `Door` tile types.
- **Feature**: Buildings are now hollow with walkable interiors.
- **Visual**: Implemented "X-Ray Roofs" - roofs disappear when the player is inside a building.
- **Interaction**: Refined NPC interaction logic to prevent variable collisions.

## [1.1.0] - Visual & Animation Overhaul
- **Animation**: Fixed "scissor" walking. Implemented vertical stepping for front/back views.
- **Animation**: Added 4-directional facing logic.
- **Visual**: Implemented equipment layering (sword renders behind the player).
- **Visual**: Added large trees with dynamic transparency when the player walks under foliage.
- **Collision**: Tree trunks are now solid objects.

## [1.0.0] - Modular Foundation
- **Refactor**: Converted monolithic `preview.html` script into separate ES6 modules.
- **Lore**: Integrated "The Roads Beneath" narrative.
- **Systems**: Implemented Quest System, Combat System, Movement System, and Economy System.
- **Data**: Added data structures for 100+ quests.

## [0.5.0] - Prototype
- Initial playable island map with basic movement, one quest, one enemy, and a store.