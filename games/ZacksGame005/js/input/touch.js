import { gameState } from '../state/gameState.js';

export function setupTouch(onInteract, onAttack, onMenuSelect) {
    const canvas = document.getElementById('map');

    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        gameState.touch.active = true;
        gameState.touch.startX = touch.clientX;
        gameState.touch.startY = touch.clientY;
        gameState.touch.currentX = touch.clientX;
        gameState.touch.currentY = touch.clientY;
        gameState.touch.dx = 0;
        gameState.touch.dy = 0;
        gameState.touch.tapTime = performance.now();
        gameState.touch.isTap = true;

        // Don't prevent default here to allow potential UI interactions if needed,
        // but we mostly handle everything on canvas.
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!gameState.touch.active || gameState.ui.paused) return;

        const touch = e.touches[0];
        gameState.touch.currentX = touch.clientX;
        gameState.touch.currentY = touch.clientY;

        const dx = gameState.touch.currentX - gameState.touch.startX;
        const dy = gameState.touch.currentY - gameState.touch.startY;
        const dist = Math.hypot(dx, dy);

        // If moved more than a small threshold, it's not a tap
        if (dist > 10) {
            gameState.touch.isTap = false;
        }

        // Normalize movement vector for the "joystick"
        if (dist > 0) {
            const maxDist = 50; // Distance for full speed
            const strength = Math.min(dist / maxDist, 1);
            gameState.touch.dx = (dx / dist) * strength;
            gameState.touch.dy = (dy / dist) * strength;
        } else {
            gameState.touch.dx = 0;
            gameState.touch.dy = 0;
        }

        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        const duration = performance.now() - gameState.touch.tapTime;

        if (gameState.touch.isTap && duration < 300) {
            handleTap(onInteract, onAttack, onMenuSelect);
        }

        gameState.touch.active = false;
        gameState.touch.dx = 0;
        gameState.touch.dy = 0;
    }, { passive: false });
}

function handleTap(onInteract, onAttack, onMenuSelect) {
    const screen = gameState.ui.currentScreen;
    const touchX = gameState.touch.startX;
    const touchY = gameState.touch.startY;

    if (screen === 'game') {
        // Pause Button area check (Top-Right)
        if (touchX > window.innerWidth - 60 && touchY < 60) {
            gameState.ui.paused = !gameState.ui.paused;
            gameState.ui.menuSelection = 0;
            return;
        }

        // Inventory Button area check (Top-Right, left of pause)
        if (touchX > window.innerWidth - 110 && touchX < window.innerWidth - 60 && touchY < 60) {
            gameState.ui.inventoryOpen = !gameState.ui.inventoryOpen;
            gameState.ui.inventorySelection = 0;
            return;
        }

        // Dodge Button (Top-Right, left of inventory)
        if (touchX > window.innerWidth - 160 && touchX < window.innerWidth - 110 && touchY < 60) {
            import('../systems/movement.js').then(mod => mod.startDodge());
            return;
        }

        if (gameState.ui.levelUpOpen) {
            const centerY = window.innerHeight / 2;
            const boxH = 80;
            const gap = 20;
            const startY = centerY - 30;

            for (let i = 0; i < 2; i++) {
                const y = startY + i * (boxH + gap);
                if (touchY >= y && touchY <= y + boxH) {
                    gameState.ui.levelUpSelection = i;
                    onMenuSelect();
                    return;
                }
            }
            return;
        }

        if (gameState.ui.paused) {
            const centerY = window.innerHeight / 2;
            const buttonH = 60;
            const gap = 20;
            const startY = centerY + 10;

            for (let i = 0; i < 2; i++) {
                const y = startY + i * (buttonH + gap);
                if (touchY >= y && touchY <= y + buttonH) {
                    gameState.ui.menuSelection = i;
                    onMenuSelect();
                    return;
                }
            }
            return;
        }

        if (gameState.ui.inventoryOpen) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const panelW = Math.min(window.innerWidth - 40, 800);
            const panelH = Math.min(window.innerHeight - 40, 500);
            const px = centerX - panelW / 2;
            const py = centerY - panelH / 2;

            const listX = px + 260;
            const listY = py + 100;
            const listW = panelW - 300;
            const itemH = 45;
            const gap = 6;

            const inv = gameState.player.inventory;
            for (let i = 0; i < inv.length; i++) {
                const y = listY + i * (itemH + gap);
                if (touchX >= listX && touchX <= listX + listW && touchY >= y && touchY <= y + itemH) {
                    gameState.ui.inventorySelection = i;
                    import('../systems/inventory.js').then(mod => {
                        const item = gameState.player.inventory[i];
                        if (item?.type === 'consumable') {
                            mod.useItem(i);
                        } else {
                            mod.equipItem(i);
                        }
                    });
                    return;
                }
            }

            // Close if tap outside panel
            if (touchX < px || touchX > px + panelW || touchY < py || touchY > py + panelH) {
                gameState.ui.inventoryOpen = false;
            }
            return;
        }

        // Context aware tap logic
        // 1. Try interact (E)
        // 2. If nothing to interact, try attack (Space)

        // We call interact first. If it opens a dialogue or something, we are good.
        // However, interact() in interaction.js currently doesn't return whether it succeeded.
        // Let's assume the systems handle the priority or we might need to tweak them.

        onInteract();

        // Simple heuristic: if we have a sword and no dialogue opened, maybe attack?
        // But startAttack also checks for dialogue.
        // To be safe, we can just call both or refine the context awareness.
        if (!gameState.ui.dialogueOpen && !gameState.ui.storeOpen) {
            onAttack();
        }
    } else {
        // Menu navigation: For now, we can try to "select" based on tap position
        // OR just treat any tap as "Enter" for the current selection for simplicity,
        // but real mobile support should probably map tap Y to menu index.

        const touchY = gameState.touch.startY;
        const centerY = window.innerHeight / 2;

        if (screen === 'main_menu') {
            // Rough mapping for 3 buttons
            const buttonH = 52;
            const gap = 14;
            const startY = centerY - 45;

            for (let i = 0; i < 3; i++) {
                if (i === 2) continue; // SKIP MULTIPLAYER (Disabled)
                const y = startY + i * (buttonH + gap);
                if (touchY >= y && touchY <= y + buttonH) {
                    gameState.ui.menuSelection = i;
                    onMenuSelect();
                    return;
                }
            }
        } else if (screen === 'death_screen') {
            const buttonH = 60;
            const gap = 20;
            const startY = centerY + 10;

            for (let i = 0; i < 2; i++) {
                const y = startY + i * (buttonH + gap);
                if (touchY >= y && touchY <= y + buttonH) {
                    gameState.ui.menuSelection = i;
                    onMenuSelect();
                    return;
                }
            }
        }

        // Fallback: trigger current selection
        onMenuSelect();
    }
}
