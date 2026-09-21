import { gameState } from '../state/gameState.js';

/**
 * Adds a persistent notification to the side list.
 * @param {string} text - Message content
 * @param {string} type - 'info', 'success', or 'danger'
 */
export function notify(text, type = 'info') {
    gameState.notifications.push({
        text,
        type,
        timer: 4.0,
        alpha: 1.0
    });
}

/**
 * Adds a floating world-space text popup.
 * @param {string} text - Message content
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 * @param {string} color - CSS color string
 */
export function addBillboard(text, x, y, color = '#ffffff') {
    gameState.billboards.push({
        text,
        x,
        y,
        color,
        timer: 1.2,
        offsetY: 0
    });
}

/**
 * Updates all timers and handles expiration/fading.
 * @param {number} dt - Delta time
 */
export function updateFeedback(dt) {
    // Update side notifications
    for (let i = gameState.notifications.length - 1; i >= 0; i--) {
        const n = gameState.notifications[i];
        n.timer -= dt;

        // Fade out in last second
        if (n.timer < 1.0) {
            n.alpha = Math.max(0, n.timer);
        }

        if (n.timer <= 0) {
            gameState.notifications.splice(i, 1);
        }
    }

    // Update floating billboards
    for (let i = gameState.billboards.length - 1; i >= 0; i--) {
        const b = gameState.billboards[i];
        b.timer -= dt;

        // Float upwards
        b.offsetY -= dt * 1.2;

        if (b.timer <= 0) {
            gameState.billboards.splice(i, 1);
        }
    }
}
