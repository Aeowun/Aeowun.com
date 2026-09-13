import { W, H, TILE_TYPES } from '../config.js';
import { gameState } from '../state/gameState.js';

// Live export so other modules see the changes when we swap maps
export let map = Array.from({length: H}, () => Array(W).fill(TILE_TYPES.Water));

export function setMap(newMap) {
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            map[y][x] = newMap[y][x];
        }
    }
}

export function createEmptyMap(fillType = TILE_TYPES.Water) {
    return Array.from({length: H}, () => Array(W).fill(fillType));
}

export function inside(x, y) {
    return x >= 0 && y >= 0 && x < W && y < H;
}

export function setTile(x, y, type) {
    if (inside(x, y)) {
        map[y][x] = type;

        // If we are in the dungeon, ensure the cached dungeon map is also updated
        // so that leaving and re-entering preserves the changes (like opened doors).
        if (gameState.currentWorld === 'dungeon' && Array.isArray(gameState.worlds.dungeon)) {
            gameState.worlds.dungeon[y][x] = type;
        }
    }
}

export function dist(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
}
