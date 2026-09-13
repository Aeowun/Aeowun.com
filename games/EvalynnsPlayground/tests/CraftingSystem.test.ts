import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { craftingSystem } from '../src/systems/CraftingSystem';
import { inventorySystem } from '../src/systems/InventorySystem';

describe('CraftingSystem', () => {
    beforeEach(() => {
        gameState.inventory = [];
    });

    it('validates recipe requirements correctly (I2)', () => {
        // Recipe craft_bottle needs 1 seed_packet
        expect(craftingSystem.canCraft('craft_bottle')).toBe(false);

        inventorySystem.addItem('seed_packet', 1);
        expect(craftingSystem.canCraft('craft_bottle')).toBe(true);
    });

    it('crafts item and consumes inputs atomically (I3)', () => {
        inventorySystem.addItem('seed_packet', 2);

        // craft_teddy_bear needs 2 seed_packet
        const success = craftingSystem.craft('craft_teddy_bear');

        expect(success).toBe(true);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(0);
        expect(inventorySystem.getQuantity('teddy_bear')).toBe(1);
    });

    it('fails craft and leaves state unchanged if materials are missing (I3)', () => {
        inventorySystem.addItem('seed_packet', 1);

        // craft_teddy_bear needs 2
        const success = craftingSystem.craft('craft_teddy_bear');

        expect(success).toBe(false);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(1);
        expect(inventorySystem.getQuantity('teddy_bear')).toBe(0);
    });
});
