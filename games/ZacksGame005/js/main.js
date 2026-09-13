import { generateWorld } from './world/worldGenerator.js';
import { setupKeyboard } from './input/keyboard.js';
import { setupTouch } from './input/touch.js';
import { updateMovement, validateAndFixPosition } from './systems/movement.js';
import {
    updateCombat,
    startAttack
} from './systems/combat.js';
import { interact } from './systems/interaction.js';
import { toggleStore } from './systems/economy.js';
import { draw } from './rendering/renderer.js';
import { gameState } from './state/gameState.js';
import { initQuests } from './systems/quests.js';
import { map } from './world/map.js';
import {
    initAudio,
    updateAudio
} from './systems/audio.js';
import {
    initStorage,
    loadGame,
    newGame,
    updateStorageNotification
} from './systems/storage.js';
import {
    initMultiplayer,
    updateMultiplayer,
    hostWorld,
    joinWorld,
    refreshRooms
} from './systems/multiplayer.js';
import { getDungeonState, getLevelSpawn, resetDungeon, loadDungeonLevel } from './systems/dungeon.js';
import { updateFeedback } from './systems/feedback.js';

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(ctx, canvas.width, canvas.height);
}

async function openServerBrowser() {
    gameState.ui.currentScreen = 'server_browser';
    gameState.ui.menuSelection = 0;
    gameState.multiplayer.notification = 'Looking for open worlds...';
    await refreshRooms();
}

async function handleMenuSelect() {
    const screen = gameState.ui.currentScreen;
    const selection = gameState.ui.menuSelection ?? 0;

    if (gameState.ui.levelUpOpen) {
        import('./systems/leveling.js').then(mod => mod.applyUpgrade(gameState.ui.levelUpSelection));
        return;
    }

    if (screen === 'game') {
        if (gameState.ui.paused) {
            // RESUME
            if (selection === 0) {
                gameState.ui.paused = false;
                return;
            }
            // QUIT TO MENU
            if (selection === 1) {
                gameState.ui.paused = false;
                gameState.ui.currentScreen = 'main_menu';
                gameState.ui.menuSelection = 0;
                return;
            }
        }
    }

    if (screen === 'main_menu') {
        // Skip disabled button (Multiplayer)
        if (selection === 2) return;

        // =========================
        // NEW GAME
        // =========================
        if (selection === 0) {
            newGame();

            generateWorld();

            gameState.worlds.overworld =
                map.map(row => [...row]);

            gameState.worlds.dungeon = true;
            gameState.currentWorld = 'overworld';

            gameState.player.x = 80.5;
            gameState.player.y = 74.5;

            gameState.camera.x = gameState.player.x;
            gameState.camera.y = gameState.player.y;

            validateAndFixPosition();

            gameState.ui.currentScreen = 'game';
            gameState.ui.menuSelection = 0;

            return;
        }

        // =========================
        // LOAD GAME
        // =========================
        if (selection === 1) {
            const loaded = loadGame();

            if (loaded) {
                gameState.ui.currentScreen = 'game';
                gameState.ui.menuSelection = 0;
            }

            return;
        }

        // =========================
        // MULTIPLAYER
        // =========================
        if (selection === 2) {
            gameState.multiplayer.notification =
                'Multiplayer is currently in development.';

            return;
        }
    }

    if (screen === 'server_browser') {
        const rooms =
            Array.isArray(gameState.multiplayer.availableRooms)
                ? gameState.multiplayer.availableRooms
                : [];

        const roomCount = rooms.length;
        const refreshIndex = roomCount;
        const hostIndex = roomCount + 1;
        const backIndex = roomCount + 2;

        if (
            selection >= 0 &&
            selection < roomCount
        ) {
            const room = rooms[selection];

            if (!room) {
                return;
            }

            const success = await joinWorld(room);

            if (success) {
                gameState.ui.currentScreen = 'game';
                gameState.ui.menuSelection = 0;
            }

            return;
        }

        if (selection === refreshIndex) {
            await refreshRooms();
            gameState.ui.menuSelection = 0;
            return;
        }

        if (selection === hostIndex) {
            const success = await hostWorld();

            if (success) {
                gameState.ui.currentScreen = 'game';
                gameState.ui.menuSelection = 0;
            }

            return;
        }

        if (selection === backIndex) {
            gameState.ui.currentScreen = 'main_menu';
            gameState.ui.menuSelection = 0;
            gameState.multiplayer.notification = '';
        }
    }

    if (screen === 'death_screen') {
        const selection = gameState.ui.menuSelection ?? 0;

        // CONTINUE
        if (selection === 0) {
            gameState.player.hp = gameState.player.maxHP;

            if (gameState.currentWorld === 'dungeon') {
                // Reset the dungeon state and rebuild the map on death
                resetDungeon();
                loadDungeonLevel();

                const spawn = getLevelSpawn(1); // Respawn at the entrance
                gameState.player.x = spawn.x;
                gameState.player.y = spawn.y;
            } else {
                gameState.player.x = 80.5;
                gameState.player.y = 74.5;
            }

            gameState.camera.x = gameState.player.x;
            gameState.camera.y = gameState.player.y;

            validateAndFixPosition();
            gameState.ui.currentScreen = 'game';
            return;
        }

        // NEW GAME
        if (selection === 1) {
            newGame();
            generateWorld();
            gameState.worlds.overworld = map.map(row => [...row]);
            gameState.worlds.dungeon = true;
            gameState.currentWorld = 'overworld';
            gameState.player.x = 80.5;
            gameState.player.y = 74.5;
            gameState.camera.x = gameState.player.x;
            gameState.camera.y = gameState.player.y;
            validateAndFixPosition();
            gameState.ui.currentScreen = 'game';
            gameState.ui.menuSelection = 0;
            return;
        }
    }
}

function init() {
    // Build ONLY the overworld at startup.
    generateWorld();

    gameState.worlds.overworld =
        map.map(row => [...row]);

    // The dungeon is NOT initialized here.
    // It will be initialized when the player enters it.
    gameState.worlds.dungeon = true;
    gameState.currentWorld = 'overworld';

    // Explicit overworld spawn.
    gameState.player.x = 80.5;
    gameState.player.y = 74.5;

    gameState.camera.x = gameState.player.x;
    gameState.camera.y = gameState.player.y;

    setupKeyboard(
        interact,
        startAttack,
        toggleStore,
        handleMenuSelect
    );

    setupTouch(
        interact,
        startAttack,
        handleMenuSelect
    );

    initQuests();
    initAudio();

    // Do NOT automatically load a save.
    // The player chooses Load Game from the menu.
    initStorage();
    initMultiplayer();

    gameState.ui.currentScreen = 'main_menu';
    gameState.ui.menuSelection = 0;

    window.addEventListener('resize', resize);

    resize();

    requestAnimationFrame(gameLoop);
}

let lastTime = performance.now();

function gameLoop(now) {
    const dt = Math.min(
        (now - lastTime) / 1000,
        0.05
    );

    lastTime = now;

    const inGame =
        gameState.ui.currentScreen === 'game';

    if (inGame && !gameState.ui.paused) {
        updateMovement(dt);
        updateCombat(dt);

        updateAudio(
            dt,
            gameState
        );

        const {
            player,
            camera
        } = gameState;

        camera.x +=
            (player.x - camera.x) *
            8 *
            dt;

        camera.y +=
            (player.y - camera.y) *
            8 *
            dt;
    }

    if (!gameState.ui.paused) {
        updateMultiplayer(dt);
        updateStorageNotification(dt);
        updateFeedback(dt);
    }

    draw(
        ctx,
        canvas.width,
        canvas.height
    );

    requestAnimationFrame(gameLoop);
}

init();