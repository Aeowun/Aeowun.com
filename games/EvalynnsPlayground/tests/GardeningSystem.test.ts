import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { gardeningSystem } from '../src/systems/GardeningSystem';
import { timeSystem } from '../src/systems/TimeSystem';
import { inventorySystem } from '../src/systems/InventorySystem';

describe('GardeningSystem', () => {
    beforeEach(() => {
        gameState.gardenTiles = {};
        gameState.inventory = [];
        gameState.gameDay = 1;
    });

    it('transitions through stages correctly when seed packets are available', () => {
        gardeningSystem.interact(0, 0);
        const tile = gardeningSystem.getOrCreateTile(0, 0);
        expect(tile.stage).toBe('Tilled');

        // Try planting without seeds - should remain Tilled
        gardeningSystem.interact(0, 0);
        expect(tile.stage).toBe('Tilled');

        // Add seed packet and plant
        inventorySystem.addItem('seed_packet', 1);
        gardeningSystem.interact(0, 0);
        expect(tile.stage).toBe('Planted');
        expect(inventorySystem.getQuantity('seed_packet')).toBe(0);

        // Update growth - no change yet
        gardeningSystem.updateGrowth();
        expect(tile.stage).toBe('Planted');

        // Advance day
        timeSystem.advanceDay();
        gardeningSystem.updateGrowth();
        expect(tile.stage).toBe('Growing');

        // Advance another day
        timeSystem.advanceDay();
        gardeningSystem.updateGrowth();
        expect(tile.stage).toBe('Harvestable');

        // Harvest yields item configured in data (teddy_bear)
        gardeningSystem.interact(0, 0);
        expect(tile.stage).toBe('Tilled');
        expect(inventorySystem.getQuantity('teddy_bear')).toBe(1);
    });

    it('verifies gardening state survives true save/load round-trips (F7)', () => {
        inventorySystem.addItem('seed_packet', 1);
        gardeningSystem.interact(0, 0); // Till
        gardeningSystem.interact(0, 0); // Plant

        const tile = gardeningSystem.getOrCreateTile(0, 0);
        expect(tile.stage).toBe('Planted');

        const savedData = JSON.stringify({
            gardenTiles: gameState.gardenTiles,
            gameDay: gameState.gameDay
        });

        // Clear state
        gameState.gardenTiles = {};
        gameState.gameDay = 1;

        // Restore state
        const loaded = JSON.parse(savedData);
        Object.assign(gameState, loaded);

        const restoredTile = gardeningSystem.getOrCreateTile(0, 0);
        expect(restoredTile.stage).toBe('Planted');
    });
});
