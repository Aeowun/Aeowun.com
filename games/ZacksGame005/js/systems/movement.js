import { gameState } from '../state/gameState.js';
import { map, inside, setMap } from '../world/map.js';
import { TILE_TYPES } from '../config.js';
import {
    getDungeonState,
    isDoorOpen,
    tryAdvanceAtDoor,
    markDungeonEntered,
    markArenaEntered,
    revealHiddenPassageNearby,
    loadDungeonLevel,
    getLevelSpawn,
    resetDungeon
} from './dungeon.js';

import { updateQuestProgress } from './quests.js';

export function isBlocked(x, y) {
    if (gameState.debug?.ghostMode) return false;

    const tx = Math.floor(x), ty = Math.floor(y);
    if (!inside(tx, ty)) return true;

    const tile = map[ty][tx];
    const { Water, Mountain, Building, Decoration, Void, Door, HiddenPassage, Torch, Diamond, Sign, Chest, Crypt } = TILE_TYPES;

    if (tile === HiddenPassage || tile === Torch || tile === Diamond || tile === Sign || tile === Chest) return false;

    if (tile === Door) {
        if (gameState.currentWorld === 'dungeon') {
            const state = getDungeonState();
            for (const [id, door] of Object.entries(state.doors)) {
                if (door.x === tx && door.y === ty) return !isDoorOpen(id);
            }
        }
        return false;
    }

    return tile === Water || tile === Mountain || tile === Building || tile === Decoration || tile === Void || tile === Crypt;
}

export function canMoveTo(x, y) {
    const r = .28;
    return !isBlocked(x - r, y - r) && !isBlocked(x + r, y - r) && !isBlocked(x - r, y + r) && !isBlocked(x + r, y + r);
}

export function startDodge() {
    const { player } = gameState;
    if (player.dodgeCooldown > 0 || player.isDodging) return;

    player.isDodging = true;
    player.dodgeTimer = 0.35; // 350ms dodge duration
    player.dodgeCooldown = 0.75; // 750ms cooldown
}

/**
 * Checks if the player is currently in a wall or invalid tile.
 * If they are, it moves them to the nearest safe spawn point for the current world/level.
 */
export function validateAndFixPosition() {
    const { player, camera, currentWorld } = gameState;

    // We check the center and the bounding box edges
    if (!canMoveTo(player.x, player.y)) {
        console.warn(`[SAFETY] Invalid player position at [${player.x.toFixed(2)}, ${player.y.toFixed(2)}]. Relocating...`);

        let spawn;
        if (currentWorld === 'dungeon') {
            const state = getDungeonState();
            spawn = getLevelSpawn(state.level || 1);
        } else {
            // Standard overworld spawn
            spawn = { x: 80.5, y: 74.5 };
        }

        player.x = spawn.x;
        player.y = spawn.y;
        camera.x = player.x;
        camera.y = player.y;
    }
}

function beginTransition() {
    const { ui } = gameState;
    ui.transitioning = true;
    ui.transitionPhase = 0;
    ui.fadeAlpha = 0;
    ui.transitionTimer = 0;
}

function enterDungeon() {
    const tx = Math.floor(gameState.player.x);
    const ty = Math.floor(gameState.player.y);

    // Map cave entrance coordinates to dungeon IDs
    let dungeonId = 'cursed_cave';
    if (tx === 39 && ty === 49) dungeonId = 'bandit_hole';
    else if (tx === 27 && ty === 72) dungeonId = 'sunken_vault';
    else if (tx === 96 && ty === 45) dungeonId = 'sky_reach';

    gameState.currentWorld = 'dungeon';

    const state = getDungeonState();

    // If the dungeon was already completed or we are entering a different one, reset
    if (state.boss.defeated || state.dungeonId !== dungeonId) {
        console.log(`[DUNGEON] Initializing ${dungeonId}...`);
        resetDungeon(dungeonId);
    }

    // Standard dungeon entry logic
    loadDungeonLevel();

    const spawn = getLevelSpawn(1);
    gameState.player.x = spawn.x;
    gameState.player.y = spawn.y;
    gameState.camera.x = spawn.x;
    gameState.camera.y = spawn.y;

    markDungeonEntered();
    updateQuestProgress('EXPLORE', { target: 'cave' });
}

function leaveDungeon() {
    gameState.currentWorld = 'overworld';
    setMap(gameState.worlds.overworld);
    gameState.player.x = 67.5;
    gameState.player.y = 50.5;
    gameState.camera.x = gameState.player.x;
    gameState.camera.y = gameState.player.y;
}

function handleDungeonDoorAt(tx, ty) {
    if (gameState.currentWorld !== 'dungeon') return false;

    const state = getDungeonState();
    for (const [id, door] of Object.entries(state.doors)) {
        if (door.x !== tx || door.y !== ty) continue;

        if (isDoorOpen(id)) {
            if ((door.type === 'levelExit' || door.type === 'finalDoor') && door.target) {
                tryAdvanceAtDoor(id);
                return true;
            }

            if (door.type === 'bossExit') {
                beginTransition();
                return true;
            }

            return false;
        }

        if (door.type === 'entrance' || door.type === 'closeBehind') return true;
        tryAdvanceAtDoor(id);
        return true;
    }

    return false;
}

export function updateMovement(dt) {
    const { player, keys, ui } = gameState;

    // Update Dodge State
    player.dodgeCooldown = Math.max(0, player.dodgeCooldown - dt);
    if (player.isDodging) {
        player.dodgeTimer -= dt;
        if (player.dodgeTimer <= 0) {
            player.isDodging = false;
        }
    }

    if (ui.transitioning) {
        player.moving = false;

        if (ui.transitionPhase === 0) {
            ui.fadeAlpha = Math.min(1, ui.fadeAlpha + dt * 3.2);
            if (ui.fadeAlpha >= 1) {
                if (gameState.currentWorld === 'overworld') enterDungeon();
                else leaveDungeon();
                ui.transitionPhase = 1;
                ui.transitionTimer = 0.28;
            }
        } else if (ui.transitionPhase === 1) {
            ui.transitionTimer -= dt;
            if (ui.transitionTimer <= 0) ui.transitionPhase = 2;
        } else {
            ui.fadeAlpha = Math.max(0, ui.fadeAlpha - dt * 3.2);
            if (ui.fadeAlpha <= 0) ui.transitioning = false;
        }
        return;
    }

    if (ui.dialogueOpen || ui.storeOpen) {
        player.moving = false;
        return;
    }

    const tx = Math.floor(player.x);
    const ty = Math.floor(player.y);

    if (gameState.currentWorld === 'overworld' && inside(tx, ty) && map[ty][tx] === TILE_TYPES.Cave) {
        beginTransition();
        return;
    }

    if (gameState.currentWorld === 'dungeon') {
        revealHiddenPassageNearby(player.x, player.y);

        const state = getDungeonState();
        // Level 2 begins just south of the arena. Once the player crosses
        // the south threshold, the entry door closes and the arena locks in.
        if (state.level === 2 && state.room !== 'arena' && player.y < 109) {
            markArenaEntered();
        }
        handleDungeonDoorAt(tx, ty);

        if (state.level === 1 && !state.entered && player.y < 104) {
            markDungeonEntered();
        }
    }

    let dx = 0, dy = 0;
    if (gameState.touch.active) {
        dx = gameState.touch.dx;
        dy = gameState.touch.dy;
    } else {
        if (keys.w || keys.arrowup) dy--;
        if (keys.s || keys.arrowdown) dy++;
        if (keys.a || keys.arrowleft) dx--;
        if (keys.d || keys.arrowright) dx++;
    }

    player.moving = !!(dx || dy);

    if (player.moving) {
        const length = Math.hypot(dx, dy);
        if (length > 0) {
            dx /= length;
            dy /= length;
            player.dirX = dx;
            player.dirY = dy;

            if (Math.abs(dx) > Math.abs(dy)) player.facing = dx > 0 ? 'right' : 'left';
            else player.facing = dy > 0 ? 'down' : 'up';

            const speed = player.isDodging ? player.speed * 2.2 : player.speed;
            const moveX = dx * speed * dt;
            const moveY = dy * speed * dt;
            if (canMoveTo(player.x + moveX, player.y)) player.x += moveX;
            if (canMoveTo(player.x, player.y + moveY)) player.y += moveY;
            player.animTime += dt * (player.isDodging ? 18 : 9);
        }
    }
}
