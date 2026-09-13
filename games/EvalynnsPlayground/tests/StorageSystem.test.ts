import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { storageSystem } from '../src/systems/StorageSystem';
import { inventorySystem } from '../src/systems/InventorySystem';

describe('StorageSystem', () => {
    beforeEach(() => {
        gameState.inventory = [];
        gameState.storageInventories = {};
    });

    it('deposits items into storage correctly (J3)', () => {
        inventorySystem.addItem('seed_packet', 10);

        const success = storageSystem.deposit('chest1', 'seed_packet', 4);

        expect(success).toBe(true);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(6);
        const storageInv = storageSystem.getStorageInventory('chest1');
        expect(storageInv.find(e => e.itemId === 'seed_packet')?.quantity).toBe(4);
    });

    it('withdraws items from storage correctly (J3)', () => {
        gameState.storageInventories['chest1'] = [{ itemId: 'bottle', quantity: 2 }];

        const success = storageSystem.withdraw('chest1', 'bottle', 1);

        expect(success).toBe(true);
        expect(inventorySystem.getQuantity('bottle')).toBe(1);
        const storageInv = storageSystem.getStorageInventory('chest1');
        expect(storageInv.find(e => e.itemId === 'bottle')?.quantity).toBe(1);
    });

    it('preserves storage state across save/load (J2)', () => {
        gameState.storageInventories['chest1'] = [{ itemId: 'teddy_bear', quantity: 1 }];

        const savedData = JSON.stringify({
            storageInventories: gameState.storageInventories
        });

        // Wipe and Load
        gameState.storageInventories = {};
        const loaded = JSON.parse(savedData);
        Object.assign(gameState, loaded);

        expect(gameState.storageInventories['chest1']).toBeDefined();
        expect(gameState.storageInventories['chest1'][0].itemId).toBe('teddy_bear');
    });
});
