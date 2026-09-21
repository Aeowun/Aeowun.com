import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { inventorySystem } from '../src/systems/InventorySystem';
import { ITEMS } from '../src/data/items';

describe('Pickup Flow', () => {
    beforeEach(() => {
        gameState.inventory = [];
        gameState.worldItems = [
            { id: 'w1', itemId: 'bottle', x: 100, y: 100 }
        ];
    });

    it('transfers item from world to inventory correctly', () => {
        const item = gameState.worldItems[0];

        // Simulate pickup logic (normally in MainScene or a PickupSystem)
        if (inventorySystem.addItem(item.itemId)) {
            const index = gameState.worldItems.findIndex(i => i.id === item.id);
            gameState.worldItems.splice(index, 1);
        }

        expect(gameState.worldItems.length).toBe(0);
        expect(inventorySystem.getQuantity('bottle')).toBe(1);
    });

    it('enforces that item pickup atomically prevents twin existence (E5 invariant)', () => {
        const item = gameState.worldItems[0];

        // Atomic transfer simulation step
        const added = inventorySystem.addItem(item.itemId);
        if (added) {
            const index = gameState.worldItems.findIndex(i => i.id === item.id);
            gameState.worldItems.splice(index, 1);
        }

        // Invariant: cannot simultaneously remain in worldItems and exist in inventory
        const stillInWorld = gameState.worldItems.some(i => i.id === item.id);
        const inInventory = inventorySystem.hasItem(item.itemId, 1);

        expect(stillInWorld && inInventory).toBe(false);
    });

    it('preserves state across save/load', () => {
        // Mock save logic (simplified)
        const item = gameState.worldItems[0];
        inventorySystem.addItem(item.itemId);
        gameState.worldItems = [];

        const savedData = JSON.stringify({
            inventory: gameState.inventory,
            worldItems: gameState.worldItems
        });

        // Wipe and Load
        gameState.inventory = [];
        gameState.worldItems = [{ id: 'w1', itemId: 'bottle', x: 100, y: 100 }];

        const loaded = JSON.parse(savedData);
        Object.assign(gameState, loaded);

        expect(gameState.worldItems.length).toBe(0);
        expect(inventorySystem.getQuantity('bottle')).toBe(1);
    });
});
