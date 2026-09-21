import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { questSystem } from '../src/systems/QuestSystem';
import { inventorySystem } from '../src/systems/InventorySystem';

describe('QuestSystem', () => {
    beforeEach(() => {
        gameState.quests = {};
        gameState.inventory = [];
        gameState.buttons = 100;
    });

    it('starts and tracks active quests (L1, L2)', () => {
        questSystem.startQuest('intro_find_bottle');
        expect(gameState.quests['intro_find_bottle']).toBeDefined();
        expect(gameState.quests['intro_find_bottle'].status).toBe('Active');
        expect(questSystem.getActiveQuests().length).toBe(1);
    });

    it('checks item conditions correctly (L3)', () => {
        questSystem.startQuest('intro_find_bottle');
        // Needs 1 bottle
        expect(questSystem.checkConditions('intro_find_bottle')).toBe(false);

        inventorySystem.addItem('bottle', 1);
        expect(questSystem.checkConditions('intro_find_bottle')).toBe(true);
    });

    it('completes quest and grants rewards atomically (L4)', () => {
        questSystem.startQuest('intro_find_bottle');
        inventorySystem.addItem('bottle', 1);

        const success = questSystem.completeQuest('intro_find_bottle');

        expect(success).toBe(true);
        expect(gameState.quests['intro_find_bottle'].status).toBe('Completed');
        expect(gameState.buttons).toBe(150); // 100 + 50 reward
    });
});
