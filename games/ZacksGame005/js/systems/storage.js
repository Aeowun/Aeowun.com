import { gameState, resetGameState } from '../state/gameState.js';
import { setMap, setTile } from '../world/map.js';
import { TILE_TYPES } from '../config.js';
import { getDungeonState, initializeDungeon, loadDungeonLevel, getLevelSpawn, resetDungeon } from './dungeon.js';
import { validateAndFixPosition } from './movement.js';
import { notify } from './feedback.js';

const SAVE_KEY = 'zacksgame005_save';

export function saveGame(isAuto = false) {
    try {
        const dungeon = getDungeonState();

        const saveData = {
            player: {
                x: gameState.player.x,
                y: gameState.player.y,
                hp: gameState.player.hp,
                maxHP: gameState.player.maxHP,
                coins: gameState.player.coins,
                swordPickedUp: gameState.player.swordPickedUp,
                steelSword: gameState.player.steelSword,
                dungeonDiamonds:
                    gameState.player.dungeonDiamonds || 0,
                dungeonKeys:
                    gameState.player.dungeonKeys || {}
            },

            currentWorld: gameState.currentWorld,

            sword: {
                pickedUp: gameState.sword.pickedUp
            },

            quest: {
                state: gameState.quest.state,
                rewardClaimed:
                    gameState.quest.rewardClaimed
            },

            dungeon: {
                level: dungeon.level,
                room: dungeon.room,
                diamonds:
                    gameState.player.dungeonDiamonds || 0,
                entered: dungeon.entered,
                hiddenPassageDiscovered:
                    dungeon.hiddenPassageDiscovered,
                diamond1Collected:
                    Boolean(dungeon.doors.diamond1?.collected),
                diamond2Collected:
                    Boolean(dungeon.doors.diamond2?.collected),
                fountainCleared:
                    dungeon.fountainCleared,
                bossHp: dungeon.boss.hp,
                bossDefeated:
                    dungeon.boss.defeated,
                wave75Triggered:
                    dungeon.boss.wave75Triggered,
                wave50Triggered:
                    dungeon.boss.wave50Triggered,
                wave25Triggered:
                    dungeon.boss.wave25Triggered
            }
        };

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(saveData)
        );

        notify(isAuto ? 'Game Auto-saved' : 'Game Saved Manually', 'success');
    } catch (e) {
        console.error(
            'Failed to save game state:',
            e
        );
    }
}

function restoreDungeonSave(saveData) {
    const saved = saveData.dungeon;

    loadDungeonLevel(saved.level);

    const state = getDungeonState();

    state.room = saved.room || 'entry';
    state.entered = Boolean(saved.entered);
    state.hiddenPassageDiscovered =
        Boolean(saved.hiddenPassageDiscovered);
    state.fountainCleared =
        Boolean(saved.fountainCleared);

    gameState.player.dungeonDiamonds =
        saved.diamonds ??
        saveData.player?.dungeonDiamonds ??
        0;

    state.diamonds =
        gameState.player.dungeonDiamonds;

    if (
        saved.diamond1Collected &&
        state.doors.diamond1
    ) {
        state.doors.diamond1.collected = true;

        setTile(
            state.doors.diamond1.x,
            state.doors.diamond1.y,
            TILE_TYPES.Floor
        );
    }

    if (
        saved.diamond2Collected &&
        state.doors.diamond2
    ) {
        state.doors.diamond2.collected = true;

        setTile(
            state.doors.diamond2.x,
            state.doors.diamond2.y,
            TILE_TYPES.Floor
        );

        if (state.doors.cryptEastDoor) {
            state.doors.cryptEastDoor.open = true;
            state.doors.cryptEastDoor.locked = false;

            setTile(
                state.doors.cryptEastDoor.x,
                state.doors.cryptEastDoor.y,
                TILE_TYPES.Floor
            );
        }
    }

    if (
        state.hiddenPassageDiscovered &&
        state.level === 4
    ) {
        setTile(97, 67, TILE_TYPES.Floor);
        setTile(98, 67, TILE_TYPES.Floor);
    }

    if (
        state.level === 5 &&
        gameState.boss
    ) {
        state.boss.hp =
            Math.max(
                0,
                Math.min(
                    state.boss.maxHp,
                    Number(
                        saved.bossHp ??
                        state.boss.maxHp
                    )
                )
            );

        state.boss.defeated =
            Boolean(saved.bossDefeated) ||
            state.boss.hp <= 0;

        state.boss.active =
            !state.boss.defeated;

        state.boss.wave75Triggered =
            Boolean(saved.wave75Triggered);

        state.boss.wave50Triggered =
            Boolean(saved.wave50Triggered);

        state.boss.wave25Triggered =
            Boolean(saved.wave25Triggered);

        gameState.boss.hp =
            state.boss.hp;

        gameState.boss.alive =
            !state.boss.defeated;

        if (state.boss.defeated) {
            state.boss.active = false;
            state.fountainCleared = true;

            if (state.doors.bossExit) {
                state.doors.bossExit.open = true;
                state.doors.bossExit.locked = false;

                setTile(
                    state.doors.bossExit.x,
                    state.doors.bossExit.y,
                    TILE_TYPES.Door
                );
            }
        }
    }

    const spawn =
        getLevelSpawn(saved.level);

    gameState.player.x =
        Number.isFinite(saveData.player?.x)
            ? saveData.player.x
            : spawn.x;

    gameState.player.y =
        Number.isFinite(saveData.player?.y)
            ? saveData.player.y
            : spawn.y;

    gameState.camera.x =
        gameState.player.x;

    gameState.camera.y =
        gameState.player.y;
}

export function loadGame() {
    try {
        const rawData =
            localStorage.getItem(SAVE_KEY);

        if (!rawData) {
            notify('No saved game found', 'info');
            return false;
        }

        const saveData =
            JSON.parse(rawData);

        if (!saveData) {
            return false;
        }

        if (saveData.player) {
            Object.assign(
                gameState.player,
                saveData.player
            );
        }

        if (saveData.sword) {
            gameState.sword.pickedUp =
                saveData.sword.pickedUp;
        }

        if (saveData.quest) {
            Object.assign(
                gameState.quest,
                saveData.quest
            );
        }

        const hasDungeonSave =
            Boolean(saveData.dungeon?.level) &&
            gameState.worlds.dungeon !== false;

        if (
            saveData.currentWorld === 'dungeon' &&
            hasDungeonSave
        ) {
            gameState.currentWorld = 'dungeon';
            restoreDungeonSave(saveData);
        } else if (
            saveData.currentWorld === 'overworld' &&
            gameState.worlds.overworld
        ) {
            gameState.currentWorld = 'overworld';

            setMap(
                gameState.worlds.overworld
            );
        }

        // Safety check: ensure the player hasn't loaded into a wall
        validateAndFixPosition();

        notify('Game Loaded Successfully', 'success');

        return true;
    } catch (e) {
        console.error(
            'Failed to load game state or data corrupt:',
            e
        );

        notify('Error Loading Save Data', 'danger');

        return false;
    }
}

export function newGame() {
    // Delete the persistent save first.
    localStorage.removeItem(SAVE_KEY);

    // Reset the main in-memory game state.
    resetGameState();

    // Reset the dungeon's separate internal state.
    resetDungeon();
}

export function initStorage() {
    setInterval(
        () => saveGame(true),
        10000
    );

    window.addEventListener(
        'keydown',
        (e) => {
            if (
                e.key.toLowerCase() === 'p'
            ) {
                saveGame(false);
            }
        }
    );
}

export function updateStorageNotification(dt) {
    if (
        gameState.storageNotification.timer > 0
    ) {
        gameState.storageNotification.timer -= dt;

        if (
            gameState.storageNotification.timer <= 0
        ) {
            gameState.storageNotification.text = '';
        }
    }
}