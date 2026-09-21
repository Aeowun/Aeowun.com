import { gameState } from '../state/gameState.js';
import { addBillboard, notify } from './feedback.js';

export const ITEM_DB = {
    old_sword: {
        id: 'old_sword',
        name: 'Old Sword',
        type: 'weapon',
        damage: 1,
        speed: 1,
        description: 'A rusty blade. Better than nothing.'
    },
    steel_sword: {
        id: 'steel_sword',
        name: 'Steel Sword',
        type: 'weapon',
        damage: 2,
        speed: 1.2,
        description: 'Forged from high-quality steel. Sharp and reliable.'
    },
    bow: {
        id: 'bow',
        name: 'Short Bow',
        type: 'weapon',
        damage: 1,
        range: 6,
        description: 'Allows you to strike from a distance.'
    },
    armor_leather: {
        id: 'armor_leather',
        name: 'Leather Armor',
        type: 'armor',
        defense: 1,
        description: 'Tough boiled leather. Offers minor protection.'
    },
    expert_bow: {
        id: 'expert_bow',
        name: 'Expert Bow',
        type: 'weapon',
        damage: 2,
        range: 10,
        description: 'A masterpiece of archery. High power and range.'
    },
    armor_plate: {
        id: 'armor_plate',
        name: 'Plate Armor',
        type: 'armor',
        defense: 3,
        description: 'Heavy steel plating. Near impenetrable.'
    },
    potion_health: {
        id: 'potion_health',
        name: 'Health Potion',
        type: 'consumable',
        effect: 'heal',
        value: 2,
        description: 'Restores 2 hearts when used.'
    },
    herb_stamina: {
        id: 'herb_stamina',
        name: 'Stamina Herb',
        type: 'consumable',
        effect: 'speed',
        value: 1.5,
        duration: 10,
        description: 'Provides a temporary speed boost.'
    }
};

/**
 * Adds an item to the player's inventory by ID.
 * @param {string} itemId
 */
export function addItem(itemId) {
    const itemData = ITEM_DB[itemId];
    if (!itemData) {
        console.error(`Item ID "${itemId}" not found in database.`);
        return false;
    }

    gameState.player.inventory.push({
        ...itemData,
        instanceId: Date.now() + Math.random()
    });

    notify(`Acquired ${itemData.name}`, 'success');
    return true;
}

/**
 * Equips an item from the inventory.
 * @param {number} index - Index in player.inventory array
 */
export function equipItem(index) {
    const { player } = gameState;
    const item = player.inventory[index];
    if (!item) return;

    if (item.type === 'weapon') {
        player.equipment.weapon = item;
        player.steelSword = (item.id === 'steel_sword'); // Compatibility flag
        player.swordPickedUp = true; // Compatibility flag
    } else if (item.type === 'armor') {
        player.equipment.armor = item;
    } else if (item.type === 'accessory') {
        player.equipment.accessory = item;
    }

    notify(`Equipped ${item.name}`, 'info');
}

/**
 * Uses a consumable item from the inventory.
 * @param {number} index - Index in player.inventory array
 */
export function useItem(index) {
    const { player } = gameState;
    const item = player.inventory[index];
    if (!item || item.type !== 'consumable') return;

    if (item.effect === 'heal') {
        const oldHp = player.hp;
        player.hp = Math.min(player.maxHP, player.hp + item.value);
        const healed = player.hp - oldHp;
        if (healed > 0) {
            addBillboard(`+${healed} Hearts`, player.x, player.y, "#ff5577");
            notify(`Used ${item.name}`, 'success');
        } else {
            notify(`You are already at full health!`, 'info');
            return;
        }
    } else if (item.effect === 'speed') {
        // Simple speed boost implementation
        const originalSpeed = player.speed;
        player.speed *= item.value;
        notify(`Used ${item.name}: Speed increased!`, 'success');
        setTimeout(() => {
            player.speed = originalSpeed;
            notify(`Speed boost worn off.`, 'info');
        }, item.duration * 1000);
    }

    // Remove from inventory
    player.inventory.splice(index, 1);

    // Reset selection if it goes out of bounds
    if (gameState.ui.inventorySelection >= player.inventory.length) {
        gameState.ui.inventorySelection = Math.max(0, player.inventory.length - 1);
    }
}

/**
 * Calculates current player stats based on base values + equipment.
 */
export function getPlayerStats() {
    const { player } = gameState;
    const stats = {
        attack: 1,
        defense: 0,
        speedMultiplier: 1
    };

    if (player.equipment.weapon) {
        stats.attack += player.equipment.weapon.damage || 0;
        stats.speedMultiplier *= player.equipment.weapon.speed || 1;
    }

    if (player.equipment.armor) {
        stats.defense += player.equipment.armor.defense || 0;
    }

    return stats;
}
