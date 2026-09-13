import { gameState } from '../state/gameState.js';

export function setupKeyboard(
    onInteract,
    onAttack,
    onToggleStore,
    onMenuSelect
) {
    addEventListener('keydown', event => {
        const key = event.key.toLowerCase();
        const screen = gameState.ui.currentScreen;

        gameState.keys[key] = true;

        // -----------------------------
        // Main Menu
        // -----------------------------
        if (screen === 'main_menu') {
            if (!event.repeat) {
                if (key === 'arrowup' || key === 'w') {
                    moveMenuSelection(-1, 3);
                } else if (key === 'arrowdown' || key === 's') {
                    moveMenuSelection(1, 3);
                } else if (key === 'enter') {
                    onMenuSelect?.();
                }
            }

            event.preventDefault();
            return;
        }

        // -----------------------------
        // Server Browser
        // -----------------------------
        if (screen === 'server_browser') {
            const roomCount = Array.isArray(gameState.multiplayer.availableRooms)
                ? gameState.multiplayer.availableRooms.length
                : 0;

            // Room rows + Refresh + Host + Back
            const itemCount = roomCount + 3;

            if (!event.repeat) {
                if (key === 'arrowup' || key === 'w') {
                    moveMenuSelection(-1, itemCount);
                } else if (key === 'arrowdown' || key === 's') {
                    moveMenuSelection(1, itemCount);
                } else if (key === 'enter') {
                    onMenuSelect?.();
                } else if (key === 'escape') {
                    gameState.ui.currentScreen = 'main_menu';
                    gameState.ui.menuSelection = 0;
                }
            }

            event.preventDefault();
            return;
        }

        // -----------------------------
        // Death Screen
        // -----------------------------
        if (screen === 'death_screen') {
            if (!event.repeat) {
                if (key === 'arrowup' || key === 'w') {
                    moveMenuSelection(-1, 2);
                } else if (key === 'arrowdown' || key === 's') {
                    moveMenuSelection(1, 2);
                } else if (key === 'enter') {
                    onMenuSelect?.();
                }
            }
            event.preventDefault();
            return;
        }

        // -----------------------------
        // Gameplay
        // -----------------------------
        if (screen === 'game') {
            if (key === 'e' && !event.repeat) {
                onInteract();
            }

            if (key === ' ' && !event.repeat) {
                onAttack();
            }

            if (key === 'b' && !event.repeat) {
                onToggleStore();
            }

            if (
                [
                    'arrowup',
                    'arrowdown',
                    'arrowleft',
                    'arrowright',
                    ' '
                ].includes(key)
            ) {
                event.preventDefault();
            }
        }
    });

    addEventListener('keyup', event => {
        gameState.keys[event.key.toLowerCase()] = false;
    });
}

function moveMenuSelection(direction, itemCount) {
    if (!Number.isInteger(gameState.ui.menuSelection)) {
        gameState.ui.menuSelection = 0;
    }

    gameState.ui.menuSelection =
        (gameState.ui.menuSelection +
            direction +
            itemCount) %
        itemCount;
}