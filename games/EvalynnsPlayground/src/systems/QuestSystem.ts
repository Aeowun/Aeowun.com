import { gameState } from '../core/GameState';
import { QUESTS, QuestDefinition } from '../data/quests';
import { inventorySystem } from './InventorySystem';

export class QuestSystem {
    public startQuest(questId: string) {
        if (!QUESTS[questId]) return;
        if (gameState.quests[questId]) return;

        gameState.quests[questId] = { id: questId, status: 'Active' };
        console.log(`Quest Started: ${QUESTS[questId].title}`);
    }

    public checkConditions(questId: string): boolean {
        const qState = gameState.quests[questId];
        if (!qState || qState.status !== 'Active') return false;

        const def = QUESTS[questId];
        for (const cond of def.conditions) {
            if (cond.type === 'find_item') {
                if (!inventorySystem.hasItem(cond.targetId, cond.targetQuantity || 1)) {
                    return false;
                }
            }
            // Add other condition checks as needed (talk_to_npc is usually triggered by the NPC)
        }
        return true;
    }

    public completeQuest(questId: string): boolean {
        const qState = gameState.quests[questId];
        if (!qState || qState.status !== 'Active') return false;

        if (!this.checkConditions(questId)) return false;

        const def = QUESTS[questId];

        // Grant Rewards
        for (const reward of def.rewards) {
            if (reward.type === 'buttons') {
                gameState.buttons += reward.quantity;
            } else if (reward.type === 'item' && reward.id) {
                inventorySystem.addItem(reward.id, reward.quantity);
            }
        }

        qState.status = 'Completed';
        console.log(`Quest Completed: ${def.title}`);
        return true;
    }

    public getActiveQuests(): QuestDefinition[] {
        return Object.values(gameState.quests)
            .filter(q => q.status === 'Active')
            .map(q => QUESTS[q.id]);
    }
}

export const questSystem = new QuestSystem();
