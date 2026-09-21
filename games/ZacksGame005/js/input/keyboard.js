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
                    moveMenuSelection(-1, 3, [2]);
                } else if (key === 'arrowdown' || key === 's') {
                    moveMenuSelection(1, 3, [2]);
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
            if (gameState.ui.levelUpOpen) {
                if (!event.repeat) {
                    if (key === 'arrowup' || key === 'w') {
                        gameState.ui.levelUpSelection = (gameState.ui.levelUpSelection - 1 + 2) % 2;
                    } else if (key === 'arrowdown' || key === 's') {
                        gameState.ui.levelUpSelection = (gameState.ui.levelUpSelection + 1) % 2;
                    } else if (key === 'enter') {
                        onMenuSelect?.();
                    }
                }
                event.preventDefault();
                return;
            }

            if ((key === 'p' || key === 'escape') && !event.repeat) {
                gameState.ui.paused = !gameState.ui.paused;
                event.preventDefault();
                return;
            }

            if (gameState.ui.paused) {
                if (!event.repeat) {
                    if (key === 'arrowup' || key === 'w') {
                        moveMenuSelection(-1, 2); // Resume, Quit
                    } else if (key === 'arrowdown' || key === 's') {
                        moveMenuSelection(1, 2);
                    } else if (key === 'enter') {
                        onMenuSelect?.();
                    }
                }
                event.preventDefault();
                return;
            }

            // Inventory Toggle
            if (key === 'i' && !event.repeat) {
                gameState.ui.inventoryOpen = !gameState.ui.inventoryOpen;
                gameState.ui.inventorySelection = 0;
                event.preventDefault();
                return;
            }

            if (gameState.ui.inventoryOpen) {
                if (!event.repeat) {
                    const inv = gameState.player.inventory;
                    if (key === 'arrowup' || key === 'w') {
                        gameState.ui.inventorySelection = (gameState.ui.inventorySelection - 1 + inv.length) % Math.max(1, inv.length);
                    } else if (key === 'arrowdown' || key === 's') {
                        gameState.ui.inventorySelection = (gameState.ui.inventorySelection + 1) % Math.max(1, inv.length);
                    } else if (key === 'enter') {
                        import('../systems/inventory.js').then(mod => {
                            const item = gameState.player.inventory[gameState.ui.inventorySelection];
                            if (item?.type === 'consumable') {
                                mod.useItem(gameState.ui.inventorySelection);
                            } else {
                                mod.equipItem(gameState.ui.inventorySelection);
                            }
                        });
                    } else if (key === 'escape') {
                        gameState.ui.inventoryOpen = false;
                    }
                }
                event.preventDefault();
                return;
            }

            if (key === 'e' && !event.repeat) {
                onInteract();
            }

            if (key === ' ' && !event.repeat) {
                onAttack();
            }

            if (key === 'b' && !event.repeat) {
                onToggleStore();
            }

            // DODGE ROLL
            if (key === 'shift' && !event.repeat) {
                import('../systems/movement.js').then(mod => mod.startDodge());
            }

            // GHOST MODE (Localhost only)
            if (key === 'g' && !event.repeat && gameState.debug.showCoords) {
                gameState.debug.ghostMode = !gameState.debug.ghostMode;
                import('../systems/feedback.js').then(mod => mod.notify(`Ghost Mode: ${gameState.debug.ghostMode ? 'ON' : 'OFF'}`, 'info'));
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

function moveMenuSelection(direction, itemCount, disabledIndices = []) {
    if (!Number.isInteger(gameState.ui.menuSelection)) {
        gameState.ui.menuSelection = 0;
    }

    let next = gameState.ui.menuSelection;
    do {
        next = (next + direction + itemCount) % itemCount;
    } while (disabledIndices.includes(next));

    gameState.ui.menuSelection = next;
}