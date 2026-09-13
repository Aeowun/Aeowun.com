import { gameState } from '../state/gameState.js';
import { dist, map, setTile } from '../world/map.js';
import { TILE_TYPES } from '../config.js';
import { NPC_DIALOGUE } from '../data/textData.js';
import { buyStoreItem } from './economy.js';
import { updateQuestProgress } from './quests.js';
import { addBillboard } from './feedback.js';
import {
    findNearbyDoor,
    findNearbyDiamond,
    tryOpenDoor,
    setDungeonMessage,
    markDiamondCollected,
    getDungeonState
} from './dungeon.js';

export function getNearbyNPC() {
    const { player, npcs } = gameState;
    for (const npc of npcs) if (dist(player.x, player.y, npc.x, npc.y) < 1.8) return npc;
    return null;
}

function interactWithDungeon() {
    if (gameState.currentWorld !== 'dungeon') return false;

    const diamond = findNearbyDiamond(1.5);
    if (diamond) {
        markDiamondCollected(diamond.id);
        return true;
    }

    const nearbyDoor = findNearbyDoor(1.6);
    if (nearbyDoor) {
        const state = getDungeonState();
        const door = nearbyDoor.door;

        if (door.type === 'entrance' || door.type === 'closeBehind') {
            setDungeonMessage(door.type === 'entrance'
                ? 'The dungeon entrance is sealed behind you.'
                : 'The door behind you has closed.');
            return true;
        }

        tryOpenDoor(nearbyDoor.id);
        return true;
    }

    return false;
}

function interactWithSign(tx, ty) {
    const key = `${tx},${ty}`;
    const text = NPC_DIALOGUE["Sign"][key] || NPC_DIALOGUE["Sign"]["default"];

    gameState.ui.activeNPC = { name: "Sign", dialogue: text };
    gameState.ui.dialogueOpen = true;
    return true;
}

function interactWithChest(tx, ty) {
    const { player, currentWorld } = gameState;
    const isDungeon = currentWorld === 'dungeon';
    const isBossRoom = isDungeon && tx === 63 && ty === 38;

    // Remove chest after opening
    setTile(tx, ty, TILE_TYPES.Floor);

    const rand = Math.random();
    let rewardType = 'nothing';

    // Reward Chance: Boss (100%), Dungeon (60%), Overworld (30%)
    const chance = isBossRoom ? 1.0 : (isDungeon ? 0.6 : 0.3);

    if (rand < chance) {
        // 40% chance of Heart (if injured), else Gold
        if (Math.random() < 0.4 && player.hp < player.maxHP) {
            rewardType = 'heart';
            player.hp = Math.min(player.maxHP, player.hp + 1);
            addBillboard("+1 Heart", tx + 0.5, ty + 0.5, "#ff5577");
        } else {
            rewardType = 'gold';
            const amount = isBossRoom ? 100 : (isDungeon ? 25 : 10);
            player.coins += amount;
            player.lastAmount = amount;
            addBillboard(`+${amount} Gold`, tx + 0.5, ty + 0.5, "#ffd700");
        }
    }

    const messages = {
        nothing: "The chest is empty.",
        heart: "You found a heart! Your health is partially restored.",
        gold: `You found ${player.lastAmount} gold coins!`
    };

    gameState.ui.activeNPC = { name: "Chest", dialogue: messages[rewardType] };
    gameState.ui.dialogueOpen = true;
    return true;
}

export function interact() {
    const { player, ui, quest, sword } = gameState;

    if (ui.storeOpen) {
        buyStoreItem();
        return;
    }

    if (ui.dialogueOpen) {
        ui.dialogueOpen = false;
        ui.activeNPC = null;
        return;
    }

    const tx = Math.floor(player.x);
    const ty = Math.floor(player.y);

    // Check for interactables in adjacent tiles
    const checkRadius = 1;
    for (let dy = -checkRadius; dy <= checkRadius; dy++) {
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
            const sx = tx + dx, sy = ty + dy;
            const tile = map[sy] && map[sy][sx];

            if (tile === TILE_TYPES.Sign) {
                if (interactWithSign(sx, sy)) return;
            }
            if (tile === TILE_TYPES.Chest) {
                if (interactWithChest(sx, sy)) return;
            }
        }
    }

    if (interactWithDungeon()) return;

    if (!sword.pickedUp && gameState.currentWorld === 'overworld' && dist(player.x, player.y, sword.x, sword.y) < 1.4) {
        sword.pickedUp = true;
        player.swordPickedUp = true;

        if (quest.state === 'sword') {
            quest.state = 'hunt';
            ui.activeNPC = { name: 'Quest', dialogue: 'You found the sword. Now defeat the creature in the hills.' };
        } else {
            ui.activeNPC = { name: 'Item', dialogue: 'You found an old sword. It looks sharp.' };
        }
        ui.dialogueOpen = true;
        updateQuestProgress('FIND', { objectId: 'old_sword' });
        return;
    }

    const npc = getNearbyNPC();
    if (!npc || gameState.currentWorld !== 'overworld') return;

    updateQuestProgress('TALK', { npcName: npc.name });

    const dialogueData = NPC_DIALOGUE[npc.name];
    if (dialogueData) {
        const text = dialogueData[quest.state] || dialogueData.default;

        if (npc.name === 'Village Elder') {
            if (quest.state === 'return') {
                quest.state = 'complete';
                if (!quest.rewardClaimed) {
                    player.coins += 50;
                    quest.rewardClaimed = true;
                }
            } else if (quest.state === 'not_started') {
                quest.state = player.swordPickedUp ? 'hunt' : 'sword';
            }
        }

        ui.activeNPC = { name: npc.name, dialogue: text };
        ui.dialogueOpen = true;
        return;
    }

    ui.activeNPC = npc;
    ui.dialogueOpen = true;
}
