import { W, H, TILE_TYPES, INITIAL_SEED } from '../config.js';
import { map, inside, setTile, dist, fillRect } from './map.js';
import { gameState } from '../state/gameState.js';

let seed = INITIAL_SEED;

function random() {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function spawnOverworldEnemy(x, y, hp, type, speed) {
    gameState.enemies.push({
        x: x,
        y: y,
        hp: hp || 3,
        maxHP: hp || 3,
        radius: 0.35,
        speed: speed || 1.35,
        type: type || 'demon',
        alive: true,
        attackCooldown: 0,
        animTime: 0,
        hitFlash: 0,
        attackMeter: 0,
        spawnX: x,
        spawnY: y,
        targetX: x,
        targetY: y,
        wanderTimer: 0,
        dungeonLevel: null // Overworld marker
    });
}

function shape(x, y) {
    const nx = (x - 63) / 48, ny = (y - 63) / 46;
    return nx * nx + ny * ny + Math.sin(x * .31) * .035 + Math.sin(y * .23) * .03 + Math.sin((x + y) * .11) * .025;
}

function road(x1, y1, x2, y2, width = 1) {
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= n; i++) {
        const q = n ? i / n : 0, x = Math.round(x1 + (x2 - x1) * q), y = Math.round(y1 + (y2 - y1) * q);
        for (let oy = -width; oy <= width; oy++) for (let ox = -width; ox <= width; ox++) if (Math.abs(ox) + Math.abs(oy) <= width + 1) {
            const tx = x + ox, ty = y + oy;
            if (inside(tx, ty) && map[ty][tx] !== TILE_TYPES.Water) map[ty][tx] = TILE_TYPES.Road;
        }
    }
}

function building(x, y, w, h) {
    const { Building, Floor, Door } = TILE_TYPES;
    for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
            if (!inside(xx, yy)) continue;
            if (map[yy][xx] === TILE_TYPES.Water || map[yy][xx] === TILE_TYPES.Mountain) continue;

            if (yy === y || yy === y + h - 1 || xx === x || xx === x + w - 1) {
                map[yy][xx] = Building;
            } else {
                map[yy][xx] = Floor;
            }
        }
    }
    const doorX = x + Math.floor(w / 2);
    const doorY = y + h - 1;
    if (inside(doorX, doorY)) map[doorY][doorX] = Door;
}

function buildBanditCamp(x, y) {
    const { Dirt, Building, Chest } = TILE_TYPES;
    // Ground
    fillRect(x - 5, y - 5, 12, 10, Dirt);

    // Tents (small building logic)
    building(x - 3, y - 4, 3, 3);
    building(x + 2, y - 3, 4, 3);
    building(x - 4, y + 2, 4, 3);

    // Loot
    setTile(x + 5, y + 3, Chest);
}

function buildOldCastle(x, y) {
    const { Road, Building, Floor } = TILE_TYPES;
    // Large ruins structure
    fillRect(x, y, 15, 12, Road);

    // Main tower
    building(x + 2, y + 1, 6, 6);
    // Side walls
    fillRect(x, y + 3, 2, 1, Building);
    fillRect(x + 8, y + 3, 7, 1, Building);

    // Secret loot
    setTile(x + 3, y + 3, Floor); // Clear a wall inside
    setTile(x + 3, y + 3, TILE_TYPES.Chest);
}

function buildWatchtower(x, y) {
    // A standalone stone tower
    building(x, y, 5, 5);
    setTile(x + 2, y - 1, TILE_TYPES.Road);
}

function buildFishingHut(x, y) {
    // A small wood shack near water
    fillRect(x - 1, y - 1, 5, 5, TILE_TYPES.Dirt);
    building(x, y, 3, 3);
}

function buildGraveyard(x, y) {
    const { Crypt, Dirt, Decoration } = TILE_TYPES;
    fillRect(x, y, 8, 8, Dirt);

    // Markers and Crypts
    setTile(x + 1, y + 1, Crypt);
    setTile(x + 3, y + 1, Crypt);
    setTile(x + 5, y + 1, Crypt);

    setTile(x + 1, y + 5, Decoration);
    setTile(x + 3, y + 5, Crypt);
    setTile(x + 5, y + 5, Decoration);
}

export function generateWorld() {
    const { Grass, Dirt, Water, Mountain, Decoration, Road, Building } = TILE_TYPES;

    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const s = shape(x, y);
        map[y][x] = s < .86 ? Grass : s < 1.03 ? Dirt : Water;
    }

    for (let y = 73; y < 84; y++) for (let x = 25; x < 103; x++) if (dist(x, y, 64, 73) < 39) map[y][x] = Dirt;
    for (let y = 38; y < 82; y++) for (let x = 93; x < 106; x++) if (dist(x, y, 95, 60) < 18) map[y][x] = Dirt;
    for (let y = 57; y < 72; y++) for (let x = 84; x < 101; x++) if (dist(x, y, 98, 65) < 11) map[y][x] = Water;
    for (let y = 64; y < 75; y++) for (let x = 91; x < 101; x++) if (dist(x, y, 100, 69) < 7) map[y][x] = Dirt;

    for (let y = 20; y < 48; y++) for (let x = 41; x < 86; x++) {
        const dx = (x - 63) / 23, dy = (y - 34) / 16;
        if (dx * dx + dy * dy < 1 && random() > .12) map[y][x] = Mountain;
    }

    const mountainClusters = [{ x: 47, y: 49 }, { x: 53, y: 47 }, { x: 60, y: 45 }, { x: 69, y: 46 }, { x: 76, y: 48 }, { x: 82, y: 51 }];
    for (const p of mountainClusters) for (let y = p.y - 5; y <= p.y + 7; y++) for (let x = p.x - 4; x <= p.x + 4; x++) if (dist(x, y, p.x, p.y) < 5.5) setTile(x, y, Mountain);

    for (let y = 44; y < 76; y++) for (let x = 27; x < 55; x++) if (dist(x, y, 39, 59) < 20 && map[y][x] !== Water && map[y][x] !== Mountain) map[y][x] = Grass;
    for (let i = 0; i < 300; i++) {
        const x = 22 + Math.floor(random() * 38), y = 40 + Math.floor(random() * 40);
        if (inside(x, y) && map[y][x] === Grass) map[y][x] = Decoration;
    }

    const village = { x: 69, y: 70, width: 24, height: 20 };
    for (let y = village.y; y < village.y + village.height; y++) for (let x = village.x; x < village.x + village.width; x++) if (inside(x, y) && map[y][x] !== Water && map[y][x] !== Mountain) map[y][x] = Dirt;

    road(80, 89, 80, 63); road(80, 73, 55, 73); road(80, 63, 67, 50); road(80, 89, 68, 98);

    building(76, 67, 7, 5); building(86, 68, 6, 5); building(75, 78, 8, 5); building(86, 78, 6, 4); building(72, 85, 6, 4); building(86, 86, 6, 4);
    for (let y = 72; y < 79; y++) for (let x = 79; x < 87; x++) if (map[y][x] !== Building) map[y][x] = Road;
    setTile(83, 75, Decoration);
    road(55, 73, 43, 61); road(43, 61, 39, 50);
    for (let y = 40; y <= 48; y++) for (let x = 34; x <= 43; x++) if (dist(x, y, 38, 44) < 5 && map[y][x] !== Water) map[y][x] = Mountain;
    setTile(38, 44, Dirt); setTile(39, 44, Dirt); setTile(38, 45, Dirt); setTile(39, 45, Dirt);
    for (let x = 33; x < 93; x++) {
        const y = Math.round(35 + Math.sin(x * .2) * 2);
        if (inside(x, y) && map[y][x] !== Water) map[y][x] = Mountain;
    }
    const extraMountains = [{ x: 25, y: 67 }, { x: 29, y: 70 }, { x: 96, y: 42 }, { x: 101, y: 48 }, { x: 22, y: 56 }];
    for (const p of extraMountains) for (let y = p.y - 2; y <= p.y + 2; y++) for (let x = p.x - 2; x <= p.x + 2; x++) if (dist(x, y, p.x, p.y) < 2.8) setTile(x, y, Mountain);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (shape(x, y) > 1.12) map[y][x] = Water;
    road(80, 89, 80, 63); road(80, 73, 55, 73); road(80, 63, 67, 50); road(55, 73, 43, 61); road(43, 61, 39, 50);
    for (let y = 68; y < 73; y++) for (let x = 86; x < 92; x++) if (map[y][x] === Water) map[y][x] = Dirt;
    building(86, 68, 6, 5);

    // Cave Entrance at 67, 49
    setTile(67, 49, TILE_TYPES.Cave);

    // New Dungeon Entrances
    setTile(39, 49, TILE_TYPES.Cave); // Mountain Cave
    setTile(38, 49, TILE_TYPES.Sign);

    setTile(27, 72, TILE_TYPES.Cave); // Deep Forest / Bandit Cave
    setTile(26, 72, TILE_TYPES.Sign);

    setTile(96, 45, TILE_TYPES.Cave); // Water/East Cave
    setTile(97, 45, TILE_TYPES.Sign);

    // Sign pointing to dungeon
    setTile(65, 49, TILE_TYPES.Sign);

    // Sign in village center
    setTile(82 ,77 , TILE_TYPES.Sign);

    // Modular Areas
    buildBanditCamp(27, 76);
    buildOldCastle(100, 73);
    buildWatchtower(68, 97);
    buildFishingHut(68, 107);
    buildGraveyard(40, 79);

    // Overworld Monster Spawning
    // 1. Ghosts in the Hidden Graveyard
    spawnOverworldEnemy(41, 80, 3, 'ghost', 1.1);
    spawnOverworldEnemy(45, 82, 3, 'ghost', 1.1);
    spawnOverworldEnemy(38, 83, 3, 'ghost', 1.1);

    // 2. Bandits near the Bandit Camp
    spawnOverworldEnemy(25, 75, 3, 'bandit', 1.4);
    spawnOverworldEnemy(29, 78, 3, 'bandit', 1.4);
    spawnOverworldEnemy(32, 74, 3, 'bandit', 1.4);

    // 3. Wolves roaming the Whispering Woods & Remote Forest
    spawnOverworldEnemy(20, 70, 3, 'wolf', 1.8);
    spawnOverworldEnemy(22, 65, 3, 'wolf', 1.8);
    spawnOverworldEnemy(15, 15, 3, 'wolf', 1.8);
    spawnOverworldEnemy(10, 10, 3, 'wolf', 1.8);

    // Smart Chest Placements (Overriding some if needed, but keeping them for now)
    setTile(12, 10, TILE_TYPES.Chest); // Remote Forest Corner
    setTile(80, 100, TILE_TYPES.Chest); // Southern Beach/Coast
    setTile(110, 20, TILE_TYPES.Chest); // Northeast Ruins Area
    setTile(12, 80, TILE_TYPES.Chest); // Near Maze Entry
}

export function generateDungeon() {
    const dungeonMap = Array.from({length: H}, () => Array(W).fill(TILE_TYPES.Void));

    // Save current map to dungeonMap temporarily to use building helper
    const overworldMap = map.map(row => [...row]);

    // Switch to empty dungeon to use 'building' logic
    for(let y=0; y<H; y++) for(let x=0; x<W; x++) map[y][x] = TILE_TYPES.Void;

    // Create the Dungeon Room
    building(60, 60, 15, 10);

    // Exit Cave at the same spot to return
    setTile(67, 69, TILE_TYPES.Cave);

    const generatedDungeon = map.map(row => [...row]);

    // Restore Overworld
    for(let y=0; y<H; y++) for(let x=0; x<W; x++) map[y][x] = overworldMap[y][x];

    return generatedDungeon;
}
