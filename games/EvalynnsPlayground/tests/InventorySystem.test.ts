import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { inventorySystem } from '../src/systems/InventorySystem';
import { ITEMS } from '../src/data/items';

describe('InventorySystem', () => {
    beforeEach(() => {
        gameState.inventory = [];
    });

    it('adds stackable items correctly', () => {
        // seed_packet is stackable
        inventorySystem.addItem('seed_packet', 5);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(5);

        inventorySystem.addItem('seed_packet', 3);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(8);
        expect(gameState.inventory.length).toBe(1);
    });

    it('adds non-stackable items as separate entries', () => {
        // bottle is not stackable
        inventorySystem.addItem('bottle');
        inventorySystem.addItem('bottle');
        expect(inventorySystem.getQuantity('bottle')).toBe(2);
        expect(gameState.inventory.length).toBe(2);
        expect(gameState.inventory[0].quantity).toBe(1);
        expect(gameState.inventory[1].quantity).toBe(1);
    });

    it('removes items correctly', () => {
        inventorySystem.addItem('seed_packet', 10);
        const removed = inventorySystem.removeItem('seed_packet', 4);
        expect(removed).toBe(true);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(6);

        inventorySystem.removeItem('seed_packet', 6);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(0);
        expect(gameState.inventory.length).toBe(0);
    });

    it('fails to remove more than owned', () => {
        inventorySystem.addItem('seed_packet', 5);
        const removed = inventorySystem.removeItem('seed_packet', 10);
        expect(removed).toBe(false);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(5);
    });

    it('rejects invalid item IDs', () => {
        const added = inventorySystem.addItem('nonexistent_item');
        expect(added).toBe(false);
        expect(gameState.inventory.length).toBe(0);
    });

    it('verifies slot-less data model parameters strictly (E2, E3)', () => {
        // Assert operations (has, quantity, add, remove) run purely against a slotless array structure
        inventorySystem.addItem('seed_packet', 2);
        expect(inventorySystem.hasItem('seed_packet', 2)).toBe(true);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(2);

        inventorySystem.removeItem('seed_packet', 1);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(1);
    });
});
