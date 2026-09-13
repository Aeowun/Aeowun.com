import { gameState } from '../state/gameState.js';
import { W, H, TILE_TYPES } from '../config.js';
import { inside, setTile, map, setMap } from '../world/map.js';
import { updateQuestProgress } from './quests.js';

const DUNGEON_LEVELS = 5;
const FINAL_BOSS_MAX_HP = 7;

let dungeonMapBuilt = false;

function createDungeonState() {
    return {
        level: 1,
        room: 'entry',
        region: 'level1',

        doors: {},
        diamonds: 0,

        boss: {
            active: false,
            hp: FINAL_BOSS_MAX_HP,
            maxHp: FINAL_BOSS_MAX_HP,
            wave75Triggered: false,
            wave50Triggered: false,
            wave25Triggered: false,
            defeated: false
        },

        fountainCleared: false,
        hiddenPassageDiscovered: false,

        message: '',
        entered: false
    };
}

let dungeonState = createDungeonState();

/* ============================================================
 * PUBLIC STATE
 * ============================================================ */

export function getDungeonState() {
    syncRegion();
    return dungeonState;
}

export function resetDungeon() {
    dungeonState = createDungeonState();
    dungeonMapBuilt = false;

    if (gameState.player) {
        gameState.player.dungeonDiamonds = 0;
        gameState.player.dungeonKeys = {};
    }

    gameState.dungeonStartPending = true;
    gameState.boss = null;

    gameState.enemies = gameState.enemies.filter(function (enemy) {
        return enemy.dungeonLevel == null;
    });
}

export function initializeDungeon() {
    resetDungeon();
    buildDungeon();

    var spawn = getLevelSpawn(1);

    gameState.player.x = spawn.x;
    gameState.player.y = spawn.y;

    gameState.camera.x = spawn.x;
    gameState.camera.y = spawn.y;
}

/*
 * Compatibility API.
 *
 * This does NOT teleport.
 * This does NOT replace the dungeon map.
 *
 * The player's physical position is authoritative.
 */
export function loadDungeonLevel() {
    if (!dungeonMapBuilt) {
        buildDungeon();
    }

    if (Array.isArray(gameState.worlds.dungeon)) {
        setMap(gameState.worlds.dungeon);
    }

    syncRegion();

    // Boss auto-spawn if loading into level 5 mid-fight
    if (dungeonState.level === 5 && !dungeonState.boss.defeated) {
        // Ensure final door is logically open if we are here
        if (dungeonState.doors.arenaNorth) {
            dungeonState.doors.arenaNorth.open = true;
            dungeonState.doors.arenaNorth.locked = false;
        }
        activateBoss();
    }

    return true;
}

export function getLevelSpawn(level) {
    var spawns = {
        1: { x: 61.5, y: 111.5 },
        2: { x: 61.5, y: 74.5 },
        3: { x: 31.5, y: 68.5 },
        4: { x: 88.5, y: 68.5 },
        5: { x: 61.5, y: 43.5 }
    };

    if (level == null) {
        level = dungeonState.level;
    }

    return spawns[level] || spawns[1];
}

export function canAdvanceLevel() {
    return dungeonState.level < DUNGEON_LEVELS;
}

export function advanceLevel() {
    /*
     * Compatibility only.
     *
     * No physical movement.
     * No teleportation.
     */
    if (!canAdvanceLevel()) {
        return false;
    }

    syncRegion();
    return true;
}

export function setDungeonMessage(message) {
    dungeonState.message = message || '';
}

export function getDungeonMessage() {
    return dungeonState.message;
}

/* ============================================================
 * DUNGEON ENTRY / ARENA ENTRY
 * ============================================================ */

export function markDungeonEntered() {
    if (dungeonState.entered) {
        return false;
    }

    if (!dungeonMapBuilt) {
        buildDungeon();
    }

    dungeonState.entered = true;
    gameState.dungeonStartPending = false;

    if (
        dungeonState.doors.level1EntryClosed &&
        dungeonState.doors.level1EntryClosed.open
    ) {
        closeDoor(
            'level1EntryClosed',
            'The entrance door slams shut behind you.'
        );
    } else {
        dungeonState.message =
            'The entrance door is sealed behind you.';
    }

    return true;
}

/*
 * Called after the player physically crosses
 * from Level 1 into the Arena.
 */
export function markArenaEntered() {
    if (
        gameState.currentWorld !== 'dungeon' ||
        !gameState.player
    ) {
        return false;
    }

    /*
     * Do not use the already-synced state as the trigger.
     * Determine where the player physically is.
     */
    var region = getRegionAt(
        gameState.player.x,
        gameState.player.y
    );

    if (region !== 'level2') {
        return false;
    }

    /*
     * Only transition once.
     */
    if (dungeonState.region === 'level2') {
        return false;
    }

    dungeonState.level = 2;
    dungeonState.region = 'level2';
    dungeonState.room = 'arena';

    /*
     * Close the physical door behind the player.
     */
    if (dungeonState.doors.arenaSouth) {
        closeDoor('arenaSouth');
    }

    dungeonState.message =
        'You enter the arena. Three paths lead deeper into the dungeon.';

    return true;
}

/* ============================================================
 * REGION HELPERS
 * ============================================================ */

function regionName(level) {
    var names = {
        1: 'level1',
        2: 'level2',
        3: 'level3',
        4: 'level4',
        5: 'level5'
    };

    return names[level] || 'level1';
}

function roomName(level) {
    var names = {
        1: 'entry',
        2: 'arena',
        3: 'maze',
        4: 'crypt',
        5: 'boss'
    };

    return names[level] || 'entry';
}

/*
 * Regions are based on the physical map.
 *
 * Door thresholds use explicit ranges so a few pixels
 * of movement can occur before the logical region changes.
 */
function getRegionAt(x, y) {
    /*
     * LEVEL 5 — BOSS
     */
    if (
        x >= 43 &&
        x <= 77 &&
        y >= 18 &&
        y <= 54
    ) {
        return 'level5';
    }

    /*
     * LEVEL 2 — ARENA
     */
    if (
        x >= 43 &&
        x <= 77 &&
        y >= 55 &&
        y <= 84
    ) {
        return 'level2';
    }

    /*
     * LEVEL 3 — WEST MAZE
     */
    if (
        x >= 10 &&
        x <= 42 &&
        y >= 45 &&
        y <= 84
    ) {
        return 'level3';
    }

    /*
     * LEVEL 4 — EAST CRYPT
     */
    if (
        x >= 78 &&
        x <= 111 &&
        y >= 45 &&
        y <= 84
    ) {
        return 'level4';
    }

    /*
     * LEVEL 1 — ENTRY
     */
    if (
        x >= 54 &&
        x <= 68 &&
        y >= 85 &&
        y <= 118
    ) {
        return 'level1';
    }

    return dungeonState.region;
}

function syncRegion() {
    if (!gameState.player || gameState.currentWorld !== 'dungeon' || gameState.player.hp <= 0) {
        return dungeonState.region;
    }

    var nextRegion = getRegionAt(
        gameState.player.x,
        gameState.player.y
    );

    if (nextRegion === dungeonState.region) {
        return nextRegion;
    }

    dungeonState.region = nextRegion;

    var levelMap = {
        level1: 1,
        level2: 2,
        level3: 3,
        level4: 4,
        level5: 5
    };

    dungeonState.level =
        levelMap[nextRegion] ||
        dungeonState.level;

    dungeonState.room =
        roomName(dungeonState.level);

    return nextRegion;
}

/* ============================================================
 * ENEMIES
 * ============================================================ */

export function getActiveDungeonEnemies() {
    syncRegion();

    return gameState.enemies.filter(function (enemy) {
        return enemy.dungeonLevel === dungeonState.level;
    });
}

export function getLivingDungeonEnemies() {
    return getActiveDungeonEnemies().filter(function (enemy) {
        return enemy.alive;
    });
}

export function allRoomEnemiesDefeated() {
    var enemies = getActiveDungeonEnemies();

    return (
        enemies.length > 0 &&
        enemies.every(function (enemy) {
            return !enemy.alive;
        })
    );
}

export function remainingRoomEnemies() {
    return getLivingDungeonEnemies().length;
}

/* ============================================================
 * DIAMONDS
 * ============================================================ */

function getDiamond(id) {
    var key = 'diamond' + id;
    return dungeonState.doors[key] || null;
}

export function markDiamondCollected(id) {
    if (id !== 1 && id !== 2) {
        return false;
    }

    var item = getDiamond(id);

    if (!item || item.collected) {
        return false;
    }

    item.collected = true;

    var diamond1 = getDiamond(1);
    var diamond2 = getDiamond(2);

    dungeonState.diamonds = 0;

    if (diamond1 && diamond1.collected) {
        dungeonState.diamonds++;
    }

    if (diamond2 && diamond2.collected) {
        dungeonState.diamonds++;
    }

    gameState.player.dungeonDiamonds =
        dungeonState.diamonds;

    setTile(
        item.x,
        item.y,
        TILE_TYPES.Floor
    );

    if (dungeonState.diamonds === 1) {
        dungeonState.message =
            'First diamond acquired. Return through the same western doorway.';
    } else if (dungeonState.diamonds === 2) {
        /*
         * The northern door is now unlocked once both diamonds are obtained.
         */
        openDoor('arenaNorth');

        dungeonState.message =
            'Both diamonds acquired! The northern door to the boss is now unlocked.';
    }

    return true;
}

export function hasDiamond(id) {
    if (id !== 1 && id !== 2) {
        return false;
    }

    var item = getDiamond(id);

    return !!(
        item &&
        item.collected
    );
}

export function consumeDiamondsForFinalDoor() {
    if (
        !hasDiamond(1) ||
        !hasDiamond(2)
    ) {
        return false;
    }

    /*
     * These are keys, not consumables.
     */
    dungeonState.diamonds = 2;
    gameState.player.dungeonDiamonds = 2;

    return true;
}

/* ============================================================
 * DOORS
 * ============================================================ */

export function openDoor(id) {
    var door = dungeonState.doors[id];

    if (!door) {
        return false;
    }

    door.open = true;
    door.locked = false;

    if (
        door.x != null &&
        door.y != null
    ) {
        setTile(
            door.x,
            door.y,
            TILE_TYPES.Floor
        );
    }

    return true;
}

function closeDoor(id, message) {
    var door = dungeonState.doors[id];

    if (!door) {
        return false;
    }

    door.open = false;
    door.locked = true;

    if (
        door.x != null &&
        door.y != null
    ) {
        setTile(
            door.x,
            door.y,
            TILE_TYPES.Door
        );
    }

    if (message) {
        dungeonState.message = message;
    }

    return true;
}

export function isDoorOpen(id) {
    var door = dungeonState.doors[id];

    return !!(
        door &&
        door.open
    );
}

export function configureDoor(id, options) {
    if (!options) {
        options = {};
    }

    dungeonState.doors[id] = {
        open: !!options.open,

        locked:
            options.locked !== false,

        type:
            options.type || 'normal',

        requiresItem:
            options.requiresItem || null,

        requiresClear:
            !!options.requiresClear,

        requiresDiamonds:
            Number(options.requiresDiamonds || 0),

        /*
         * Kept only for compatibility.
         * Never used for movement.
         */
        target: null,

        x:
            options.x != null
                ? options.x
                : null,

        y:
            options.y != null
                ? options.y
                : null,

        message:
            options.message ||
            'The door is locked.'
    };

    return dungeonState.doors[id];
}

export function tryOpenDoor(id) {
    var door = dungeonState.doors[id];

    if (!door) {
        return false;
    }

    /*
     * Already open.
     */
    if (door.open) {
        if (door.type === 'finalDoor') {
            activateBoss();
        }

        return true;
    }

    /*
     * Enemy requirement.
     */
    if (
        door.requiresClear &&
        !allRoomEnemiesDefeated()
    ) {
        dungeonState.message =
            door.message ||
            'Defeat every enemy in this area first.';

        return false;
    }

    /*
     * Item requirement.
     */
    if (
        door.requiresItem &&
        !hasDungeonItem(door.requiresItem)
    ) {
        dungeonState.message =
            door.message ||
            'You need a special item.';

        return false;
    }

    /*
     * Diamond requirement.
     */
    if (
        door.requiresDiamonds &&
        (
            !hasDiamond(1) ||
            !hasDiamond(2)
        )
    ) {
        dungeonState.message =
            door.message ||
            'Both diamonds are required.';

        return false;
    }

    /*
     * Final door.
     */
    if (door.type === 'finalDoor') {
        if (!consumeDiamondsForFinalDoor()) {
            dungeonState.message =
                'Both diamonds are required.';

            return false;
        }
    }

    openDoor(id);

    if (door.type === 'finalDoor') {
        activateBoss();

        dungeonState.message =
            'The northern doorway opens. The boss chamber awaits.';
    } else if (door.type === 'bossExit') {
        dungeonState.message =
            'The exit opens.';
    } else if (door.type === 'levelExit') {
        dungeonState.message =
            'The doorway to the arena opens.';
    } else {
        dungeonState.message =
            'The doorway opens.';
    }

    return true;
}

export function tryAdvanceAtDoor(id) {
    return tryOpenDoor(id);
}

export function getDoor(id) {
    return dungeonState.doors[id] || null;
}

export function findNearbyDoor(range) {
    if (range == null) {
        range = 1.5;
    }

    if (!gameState.player) {
        return null;
    }

    var entries =
        Object.entries(dungeonState.doors);

    for (var i = 0; i < entries.length; i++) {
        var id = entries[i][0];
        var door = entries[i][1];

        if (
            door.x == null ||
            door.y == null
        ) {
            continue;
        }

        if (
            Math.hypot(
                gameState.player.x - door.x,
                gameState.player.y - door.y
            ) <= range
        ) {
            return {
                id: id,
                door: door
            };
        }
    }

    return null;
}

/* ============================================================
 * DIAMOND SEARCH
 * ============================================================ */

export function findNearbyDiamond(range) {
    if (range == null) {
        range = 1.4;
    }

    if (!gameState.player) {
        return null;
    }

    var values =
        Object.values(dungeonState.doors);

    for (var i = 0; i < values.length; i++) {
        var item = values[i];

        if (
            item.type !== 'diamond' ||
            item.collected
        ) {
            continue;
        }

        if (
            Math.hypot(
                gameState.player.x - item.x,
                gameState.player.y - item.y
            ) <= range
        ) {
            return item;
        }
    }

    return null;
}

/* ============================================================
 * HIDDEN PASSAGE
 * ============================================================ */

export function revealHiddenPassage() {
    syncRegion();

    if (
        dungeonState.level !== 4 ||
        dungeonState.hiddenPassageDiscovered
    ) {
        return false;
    }

    dungeonState.hiddenPassageDiscovered = true;
    dungeonState.room = 'hidden-passage';

    setTile(97, 67, TILE_TYPES.Floor);
    setTile(98, 67, TILE_TYPES.Floor);

    dungeonState.message =
        'A hidden passage opens through the crypt wall.';

    return true;
}

export function revealHiddenPassageNearby(x, y) {
    syncRegion();

    if (
        dungeonState.level !== 4 ||
        dungeonState.hiddenPassageDiscovered
    ) {
        return false;
    }

    if (
        Math.hypot(
            x - 98,
            y - 67
        ) > 2.5
    ) {
        return false;
    }

    return revealHiddenPassage();
}

/* ============================================================
 * BOSS
 * ============================================================ */

export function isBossDefeated() {
    return dungeonState.boss.defeated;
}

export function isExitOpen() {
    var door =
        dungeonState.doors.bossExit;

    return !!(
        door &&
        door.open
    );
}

export function setBossHp(hp) {
    if (!gameState.boss) {
        return 0;
    }

    dungeonState.boss.hp =
        Math.max(
            0,
            Math.min(
                dungeonState.boss.maxHp,
                Number(hp) || 0
            )
        );

    gameState.boss.hp =
        dungeonState.boss.hp;

    gameState.boss.alive =
        dungeonState.boss.hp > 0;

    dungeonState.boss.active =
        gameState.boss.alive;

    return dungeonState.boss.hp;
}

export function damageBoss(amount) {
    if (
        !gameState.boss ||
        !dungeonState.boss.active ||
        dungeonState.boss.defeated
    ) {
        return false;
    }

    var damage =
        Math.max(
            0,
            Number(amount) || 0
        );

    setBossHp(
        dungeonState.boss.hp - damage
    );

    checkBossWave(0.75);
    checkBossWave(0.50);
    checkBossWave(0.25);

    if (dungeonState.boss.hp <= 0) {
        defeatBoss();
    }

    return true;
}

function checkBossWave(threshold) {
    var key =
        'wave' +
        Math.round(threshold * 100) +
        'Triggered';

    if (dungeonState.boss[key]) {
        return;
    }

    if (
        dungeonState.boss.hp <=
        dungeonState.boss.maxHp * threshold
    ) {
        dungeonState.boss[key] = true;

        spawnBossWave(threshold);
    }
}

function spawnBossWave(threshold) {
    var count =
        threshold === 0.75
            ? 2
            : 3;

    var baseX =
        threshold === 0.75
            ? 52
            : threshold === 0.50
                ? 59
                : 65;

    for (var i = 0; i < count; i++) {
        addEnemy(
            baseX + (i % 3) * 5,
            34 + Math.floor(i / 3) * 8,
            2,
            5,
            1.15
        );
    }

    dungeonState.message =
        'The boss summons reinforcements at ' +
        Math.round(threshold * 100) +
        '% health!';
}

function activateBoss() {
    if (
        dungeonState.boss.active ||
        dungeonState.boss.defeated ||
        !gameState.player
    ) {
        return;
    }

    gameState.boss = {
        x: 61,
        y: 36,

        hp: FINAL_BOSS_MAX_HP,
        maxHP: FINAL_BOSS_MAX_HP,

        alive: true,

        radius: 0.8,
        speed: 0.75,

        attackCooldown: 0,
        attackTimer: 0,
        attackAngle: 0,
        hitFlash: 0
    };

    dungeonState.boss.active = true;
    dungeonState.boss.hp =
        FINAL_BOSS_MAX_HP;
    dungeonState.boss.maxHp =
        FINAL_BOSS_MAX_HP;

    dungeonState.boss.defeated = false;

    dungeonState.boss.wave75Triggered = false;
    dungeonState.boss.wave50Triggered = false;
    dungeonState.boss.wave25Triggered = false;
}

function defeatBoss() {
    dungeonState.boss.active = false;
    dungeonState.boss.defeated = true;

    if (gameState.boss) {
        gameState.boss.alive = false;
        gameState.boss.hp = 0;
    }

    if (dungeonState.doors.bossExit) {
        openDoor('bossExit');
    }

    dungeonState.fountainCleared = true;

    /*
     * Reveal secret door under the fountain and a reward chest nearby.
     */
    doorTile(
        'fountainSecret',
        60,
        38,
        {
            type: 'secret',
            open: true,
            locked: false
        }
    );

    setTile(61, 38, TILE_TYPES.Chest); // Reward chest near fountain

    updateQuestProgress('KILL', { target: 'boss' });

    dungeonState.message =
        'The boss falls. A secret passage and a reward chest are revealed!';
}

function hasDungeonItem(itemId) {
    if (
        !gameState.player ||
        !gameState.player.dungeonKeys
    ) {
        return false;
    }

    return !!gameState.player.dungeonKeys[itemId];
}

/* ============================================================
 * MAP BUILDING
 *
 * ONE CONNECTED DUNGEON.
 *
 * Level 1
 *    |
 *    | real doorway
 *    v
 * Arena
 *  /  |  \
 * /   |   \
 * v   v    v
 *3    5    4
 *MAZE BOSS CRYPT
 * ♦1       ♦2
 *
 * Level numbers are logical regions only.
 * The map is constructed once.
 * ============================================================ */

function buildDungeon() {
    resetDungeonMap();

    gameState.enemies =
        gameState.enemies.filter(function (enemy) {
            return enemy.dungeonLevel == null;
        });

    gameState.boss = null;

    buildLevelOneRegion();
    buildArenaRegion();
    buildLevelThreeRegion();
    buildLevelFourRegion();
    buildLevelFiveRegion();

    /* ==========================================
     * DOOR PLACEMENT (Final pass to ensure visibility)
     * ========================================== */

    // Level 1 Entry (Seals behind player)
    doorTile('level1EntryClosed', 61, 116, { type: 'entrance', open: true, locked: false });

    // Level 1 -> Arena (Requires Clear)
    doorTile('level1Exit', 61, 84, {
        type: 'levelExit',
        open: false,
        locked: true,
        requiresClear: true,
        message: 'Defeat both dungeon creatures before entering the arena.'
    });

    // Arena -> Maze
    doorTile('arenaWest', 42, 69, { type: 'branch', open: true, locked: false });

    // Arena -> Crypt
    doorTile('arenaEast', 77, 69, { type: 'branch', open: true, locked: false });

    // Arena -> Boss (Requires 2 Diamonds)
    doorTile('arenaNorth', 60, 55, {
        type: 'finalDoor',
        open: false,
        locked: true,
        requiresDiamonds: 2,
        message: 'Both diamonds are required to open the northern doorway.'
    });

    // Boss Room Exit
    doorTile('bossExit', 60, 23, {
        type: 'bossExit',
        open: false,
        locked: true,
        message: 'Defeat the boss to open the exit.'
    });

    /*
     * Level 1 -> Arena doorway alias.
     */
    dungeonState.doors.arenaSouth =
        dungeonState.doors.level1Exit;

    // Persist the built map so we can re-apply it when switching back to dungeon
    gameState.worlds.dungeon = map.map(row => [...row]);

    dungeonMapBuilt = true;

    dungeonState.level = 1;
    dungeonState.region = 'level1';
    dungeonState.room = 'entry';
}

/* ============================================================
 * MAP HELPERS
 * ============================================================ */

function resetDungeonMap() {
    for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
            setTile(
                x,
                y,
                TILE_TYPES.Void
            );
        }
    }
}

function fillRect(
    x,
    y,
    width,
    height,
    tile
) {
    for (
        var yy = y;
        yy < y + height;
        yy++
    ) {
        for (
            var xx = x;
            xx < x + width;
            xx++
        ) {
            if (inside(xx, yy)) {
                setTile(
                    xx,
                    yy,
                    tile
                );
            }
        }
    }
}

function room(
    x,
    y,
    width,
    height
) {
    fillRect(
        x,
        y,
        width,
        height,
        TILE_TYPES.Floor
    );

    for (
        var xx = x;
        xx < x + width;
        xx++
    ) {
        setTile(
            xx,
            y,
            TILE_TYPES.Building
        );

        setTile(
            xx,
            y + height - 1,
            TILE_TYPES.Building
        );
    }

    for (
        var yy = y;
        yy < y + height;
        yy++
    ) {
        setTile(
            x,
            yy,
            TILE_TYPES.Building
        );

        setTile(
            x + width - 1,
            yy,
            TILE_TYPES.Building
        );
    }
}

function hallway(
    x,
    y,
    width,
    height
) {
    fillRect(
        x,
        y,
        width,
        height,
        TILE_TYPES.Floor
    );
}

function addEnemy(
    x,
    y,
    hp,
    dungeonLevel,
    speed
) {
    if (hp == null) {
        hp = 3;
    }

    if (dungeonLevel == null) {
        dungeonLevel = dungeonState.level;
    }

    if (speed == null) {
        speed = 1.35;
    }

    gameState.enemies.push({
        x: x,
        y: y,

        hp: hp,
        maxHP: hp,

        radius: 0.35,
        speed: speed,

        alive: true,

        attackCooldown: 0,
        animTime: 0,
        hitFlash: 0,

        spawnX: x,
        spawnY: y,

        targetX: x,
        targetY: y,

        wanderTimer: 0,

        dungeonLevel: dungeonLevel
    });
}

function torch(x, y) {
    setTile(
        x,
        y,
        TILE_TYPES.Torch
    );
}

function doorTile(
    id,
    x,
    y,
    options
) {
    if (!options) {
        options = {};
    }

    configureDoor(
        id,
        {
            ...options,
            x: x,
            y: y
        }
    );

    // Only set the tile if the map is being built or updated
    setTile(
        x,
        y,
        options.open
            ? TILE_TYPES.Floor
            : TILE_TYPES.Door
    );

    return dungeonState.doors[id];
}

function diamond(
    x,
    y,
    id
) {
    setTile(
        x,
        y,
        TILE_TYPES.Diamond
    );

    dungeonState.doors[
        'diamond' + id
    ] = {
        type: 'diamond',
        x: x,
        y: y,
        open: true,
        locked: false,
        collected: false,
        id: id
    };
}

/* ============================================================
 * LEVEL 1
 * ============================================================ */

function buildLevelOneRegion() {
    room(
        54,
        85,
        14,
        32
    );

    hallway(
        59,
        96,
        6,
        20
    );

    /*
     * Punch hole in Level 1 wall to reach the Level 2 door at 84.
     */
    setTile(61, 85, TILE_TYPES.Floor);

    torch(57, 96);
    torch(65, 96);
    torch(57, 108);
    torch(65, 108);

    /*
     * Exactly two Level 1 enemies.
     */
    addEnemy(
        61,
        96,
        3,
        1
    );

    addEnemy(
        64,
        109,
        3,
        1
    );
}

/* ============================================================
 * LEVEL 2 — ARENA
 * ============================================================ */

function buildArenaRegion() {
    room(
        42,
        55,
        36,
        30
    );

    torch(49, 62);
    torch(71, 62);
    torch(49, 77);
    torch(71, 77);

    /*
     * Arena enemies (Central chamber distribution)
     */
    addEnemy(50, 65, 3, 2);
    addEnemy(70, 65, 3, 2);
    addEnemy(60, 70, 4, 2);
    addEnemy(55, 75, 3, 2);
    addEnemy(65, 75, 3, 2);
    addEnemy(60, 60, 4, 2);
}

/* ============================================================
 * LEVEL 3 — WEST MAZE
 * ============================================================ */

function buildLevelThreeRegion() {
    room(
        10,
        45,
        33,
        40
    );

    /*
     * Maze barriers.
     */
    fillRect(
        19,
        45,
        2,
        14,
        TILE_TYPES.Building
    );

    fillRect(
        19,
        57,
        12,
        2,
        TILE_TYPES.Building
    );

    fillRect(
        29,
        51,
        2,
        15,
        TILE_TYPES.Building
    );

    fillRect(
        20,
        65,
        11,
        2,
        TILE_TYPES.Building
    );

    fillRect(
        18,
        65,
        2,
        13,
        TILE_TYPES.Building
    );

    fillRect(
        28,
        74,
        12,
        2,
        TILE_TYPES.Building
    );

    fillRect(
        36,
        57,
        2,
        17,
        TILE_TYPES.Building
    );

    fillRect(
        26,
        79,
        2,
        6,
        TILE_TYPES.Building
    );

    /*
     * Secret Passages (Blue markers in design)
     * "Visibly a wall, but no collision"
     */
    // Top-right secret passage
    setTile(42, 52, TILE_TYPES.HiddenPassage);
    setTile(41, 52, TILE_TYPES.HiddenPassage);
    torch(40, 52);

    // Far-left secret passage
    setTile(10, 69, TILE_TYPES.HiddenPassage);
    setTile(11, 69, TILE_TYPES.HiddenPassage);
    torch(12, 69);

    /*
     * West doorway is already registered by the Arena.
     * Keep the maze-side tile physically open.
     */
    setTile(
        42,
        69,
        TILE_TYPES.Floor
    );

    diamond(
        22,
        81,
        1
    );

    setTile(12, 47, TILE_TYPES.Chest); // Maze Corner Chest

    torch(15, 51);
    torch(34, 53);
    torch(14, 75);
    torch(36, 80);
}

/* ============================================================
 * LEVEL 4 — EAST CRYPT
 * ============================================================ */

function buildLevelFourRegion() {
    room(
        77,
        45,
        35,
        40
    );

    /*
     * East doorway is already registered by the Arena.
     */
    setTile(
        77,
        69,
        TILE_TYPES.Floor
    );

    /*
     * Crypt obstacles.
     */
    for (
        var y = 51;
        y < 80;
        y += 8
    ) {
        fillRect(
            82,
            y,
            7,
            3,
            TILE_TYPES.Crypt
        );

        fillRect(
            91,
            y + 2,
            6,
            3,
            TILE_TYPES.Crypt
        );

        fillRect(
            100,
            y,
            7,
            3,
            TILE_TYPES.Crypt
        );
    }

    /*
     * Internal wall around diamond chamber.
     */
    fillRect(
        97,
        52,
        1,
        30,
        TILE_TYPES.Building
    );

    /*
     * Diamond chamber.
     */
    room(
        98,
        57,
        13,
        25
    );

    diamond(
        104,
        69,
        2
    );

    /*
     * Secret Passage to Diamond Chamber (Blue marker in design)
     * "Visibly a wall, but no collision"
     */
    setTile(97, 67, TILE_TYPES.HiddenPassage);
    setTile(98, 67, TILE_TYPES.HiddenPassage);

    torch(83, 49);
    torch(94, 54);
    torch(84, 78);
    torch(94, 77);
    torch(104, 60);
    torch(106, 77);
    torch(96, 67); // Hint for secret passage

    /*
     * Crypt enemies (supporting the "sneak" route representation)
     */
    addEnemy(
        84,
        55,
        3,
        4
    );

    addEnemy(
        104,
        52,
        3,
        4
    );

    addEnemy(
        94,
        78,
        3,
        4
    );
}

/* ============================================================
 * LEVEL 5 — BOSS
 * ============================================================ */

function buildLevelFiveRegion() {
    // Outer room structure
    room(
        43,
        20,
        35,
        36
    );

    // Reinforce walls around the room (Double thick to prevent escape)
    for (var x = 42; x <= 78; x++) {
        setTile(x, 19, TILE_TYPES.Building);
    }
    for (var y = 19; y <= 56; y++) {
        setTile(42, y, TILE_TYPES.Building);
        setTile(78, y, TILE_TYPES.Building);
    }

    /*
     * Physical northern doorway from Arena side.
     */
    setTile(60, 55, TILE_TYPES.Floor);

    /*
     * Fountain.
     */
    setTile(
        60,
        38,
        TILE_TYPES.Water
    );

    gameState.boss = null;

    dungeonState.boss = {
        active: false,

        hp: FINAL_BOSS_MAX_HP,
        maxHp: FINAL_BOSS_MAX_HP,

        wave75Triggered: false,
        wave50Triggered: false,
        wave25Triggered: false,

        defeated: false
    };

    /*
     * Flanking enemies in boss room.
     */
    addEnemy(50, 30, 2, 5, 1.2);
    addEnemy(70, 30, 2, 5, 1.2);

    torch(50, 29);
    torch(70, 29);
    torch(50, 48);
    torch(70, 48);
}

/* ============================================================
 * INITIAL BUILD
 * ============================================================ */

if (
    gameState.currentWorld === 'dungeon' &&
    !dungeonMapBuilt
) {
    buildDungeon();
}
console.log(
    '[DUNGEON EXPORT TEST]',
    import.meta.url
);