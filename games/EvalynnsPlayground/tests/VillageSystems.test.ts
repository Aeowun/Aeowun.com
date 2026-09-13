import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { dialogueSystem } from '../src/systems/DialogueSystem';
import { shopSystem } from '../src/systems/ShopSystem';
import { inventorySystem } from '../src/systems/InventorySystem';

describe('Village Systems (K4, K6)', () => {
    beforeEach(() => {
        gameState.buttons = 100;
        gameState.inventory = [];
    });

    it('manages dialogue sequences correctly (K4)', () => {
        dialogueSystem.startDialogue('sam_greet');
        expect(dialogueSystem.isActive()).toBe(true);
        expect(dialogueSystem.getCurrentLine()?.speaker).toBe('Shopkeeper Sam');

        expect(dialogueSystem.nextLine()).toBe(true); // Advance to 2nd line
        expect(dialogueSystem.nextLine()).toBe(false); // End
        expect(dialogueSystem.isActive()).toBe(false);
    });

    it('handles shop purchases correctly (K6)', () => {
        // seed_packet costs 5
        const success = shopSystem.buyItem('village_general_store', 'seed_packet');

        expect(success).toBe(true);
        expect(gameState.buttons).toBe(95);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(1);
    });

    it('prevents purchases if currency is insufficient (K6)', () => {
        gameState.buttons = 2;
        const success = shopSystem.buyItem('village_general_store', 'seed_packet');

        expect(success).toBe(false);
        expect(gameState.buttons).toBe(2);
        expect(inventorySystem.getQuantity('seed_packet')).toBe(0);
    });
});
