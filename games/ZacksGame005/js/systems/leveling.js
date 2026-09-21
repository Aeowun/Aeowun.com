import { gameState } from '../state/gameState.js';
import { notify, addBillboard } from './feedback.js';
import { playSFX } from './audio.js';

/**
 * Adds XP to the player and checks for level up.
 * @param {number} amount
 */
export function gainXP(amount) {
    const { player, ui } = gameState;
    player.xp += amount;

    notify(`+${amount} XP`, 'info');

    if (player.xp >= player.xpToNextLevel) {
        triggerLevelUp();
    }
}

function triggerLevelUp() {
    const { player, ui } = gameState;
    player.level++;
    player.xp -= player.xpToNextLevel;
    player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);

    ui.levelUpOpen = true;
    ui.levelUpSelection = 0;
    playSFX('sfx_reward'); // Assuming this exists or falls back
    notify(`LEVEL UP! REACHED LEVEL ${player.level}`, 'success');
}

/**
 * Applies the chosen upgrade and closes the menu.
 * @param {number} index - 0: +1 Heart, 1: +1 Attack
 */
export function applyUpgrade(index) {
    const { player, ui } = gameState;

    if (index === 0) {
        player.maxHP++;
        player.hp = player.maxHP; // Fully heal on heart upgrade
        notify(`Max Hearts increased to ${player.maxHP}!`, 'success');
    } else {
        player.baseAttack++;
        notify(`Base Attack increased to ${player.baseAttack}!`, 'success');
    }

    ui.levelUpOpen = false;
}
