import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { babyCareSystem } from '../src/systems/BabyCareSystem';
import { inventorySystem } from '../src/systems/InventorySystem';

describe('BabyCareSystem', () => {
    beforeEach(() => {
        gameState.babies = {
            'b1': {
                id: 'b1',
                state: 'Wild',
                x: 0,
                y: 0,
                needs: { state: 'Content', hunger: 0, energy: 100, happiness: 100 }
            }
        };
        gameState.inventory = [];
    });

    it('feeds a baby and consumes a bottle (G3)', () => {
        gameState.babies['b1'].needs.hunger = 80;
        babyCareSystem.updateNeedState('b1');
        expect(gameState.babies['b1'].needs.state).toBe('Hungry');

        inventorySystem.addItem('bottle', 1);
        const success = babyCareSystem.feedBaby('b1');

        expect(success).toBe(true);
        expect(gameState.babies['b1'].needs.hunger).toBe(30);
        expect(gameState.babies['b1'].needs.state).toBe('Content');
        expect(inventorySystem.hasItem('bottle')).toBe(false);
    });

    it('comforts a baby with a teddy bear without consuming it (G4)', () => {
        gameState.babies['b1'].needs.happiness = 20;
        babyCareSystem.updateNeedState('b1');
        expect(gameState.babies['b1'].needs.state).toBe('Upset');

        inventorySystem.addItem('teddy_bear', 1);
        const success = babyCareSystem.comfortBaby('b1');

        expect(success).toBe(true);
        expect(gameState.babies['b1'].needs.happiness).toBe(70);
        expect(gameState.babies['b1'].needs.state).toBe('Content');
        expect(inventorySystem.hasItem('teddy_bear')).toBe(true); // Should NOT be consumed
    });

    it('advances needs over time (G2)', () => {
        babyCareSystem.advanceNeeds();
        expect(gameState.babies['b1'].needs.hunger).toBe(20);
        expect(gameState.babies['b1'].needs.energy).toBe(90);
    });
});
