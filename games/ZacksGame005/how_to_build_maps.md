# How to Build Maps and Areas in ZacksGame005

This guide explains how to use the world generation engine to create new locations and modify existing ones.

## 1. Core Map Functions

The map is a 128x128 grid. Use these helpers from `js/world/map.js` to change it:

*   **`setTile(x, y, type)`**: Changes a single tile at the given coordinates.
*   **`building(x, y, w, h)`**: Creates a rectangular room with walls and an interior floor. It automatically places a door at the bottom center.
*   **`road(x1, y1, x2, y2, width)`**: Draws a path between two points. `width=1` is standard.
*   **`fillRect(x, y, w, h, type)`**: Fills a rectangular area with a specific tile type (standard `fillRect` logic).

## 2. Tile Types

Import `TILE_TYPES` from `../config.js`. Common types:
*   `Grass`: Standard ground.
*   `Dirt`: Earthy paths or camp floors.
*   `Road`: Stone-paved paths.
*   `Building`: Solid walls.
*   `Floor`: Interior walkable ground.
*   `Water`: Blocked liquid.
*   `Mountain`: Solid stone peaks.
*   `Cave`: Dungeon entrance teleport.
*   `Chest`: Interactive loot box.
*   `Sign`: Interactive text post.

## 3. Creating a Modular Area

To add a new location, follow this pattern in **`js/world/worldGenerator.js`**:

1.  **Define the Area Function**:
    ```javascript
    function buildMySecretBase(x, y) {
        // Draw the floor/dirt first
        fillRect(x, y, 10, 10, TILE_TYPES.Dirt);
        
        // Add a building
        building(x + 2, y + 2, 6, 4);
        
        // Add props
        setTile(x + 5, y + 1, TILE_TYPES.Chest);
        setTile(x, y, TILE_TYPES.Sign);
    }
    ```

2.  **Call it in `generateWorld()`**:
    ```javascript
    export function generateWorld() {
        // ... previous generation code ...
        
        buildMySecretBase(100, 100); // Place at coordinates 100, 100
    }
    ```

## 4. Pro Tips

*   **Z-Order**: Always draw floors and dirt *before* you place walls, chests, or NPCs.
*   **Coordinates**: Use the "Tile: [X, Y]" info in the bottom-center of the in-game HUD to find exact spots for your creations.
*   **Collision**: Building, Mountain, and Water tiles automatically block the player. 
*   **Interactive Text**: If you add a `Sign`, add its text to the `NPC_DIALOGUE["Sign"]` object in `js/data/textData.js` using its `"x,y"` coordinates as the key.
