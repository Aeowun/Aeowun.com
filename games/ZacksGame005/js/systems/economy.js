import { gameState } from '../state/gameState.js';

export function toggleStore() {
    const { ui } = gameState;
    ui.storeOpen = !ui.storeOpen;
    ui.dialogueOpen = false;
    ui.activeNPC = null;
    ui.storeMessage = "";
}

export function buyStoreItem() {
    const { player, ui } = gameState;
    if (player.steelSword) {
        ui.storeMessage = "Already owned!";
        return;
    }
    if (player.coins >= 50) {
        player.coins -= 50;
        player.steelSword = true;
        ui.storeMessage = "Steel Sword purchased!";
    } else {
        ui.storeMessage = "You need 50 gold.";
    }
}
