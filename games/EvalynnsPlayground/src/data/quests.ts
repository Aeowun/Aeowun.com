export type QuestConditionType = 'find_item' | 'find_baby' | 'talk_to_npc' | 'reach_location';

export interface QuestCondition {
    type: QuestConditionType;
    targetId: string;
    targetQuantity?: number;
}

export interface QuestReward {
    type: 'item' | 'buttons';
    id?: string;
    quantity: number;
}

export interface QuestDefinition {
    id: string;
    title: string;
    description: string;
    conditions: QuestCondition[];
    rewards: QuestReward[];
}

export const QUESTS: Record<string, QuestDefinition> = {
    'intro_find_bottle': {
        id: 'intro_find_bottle',
        title: 'Thirsty Baby',
        description: 'Find a milk bottle for the hungry babies.',
        conditions: [
            { type: 'find_item', targetId: 'bottle', targetQuantity: 1 }
        ],
        rewards: [
            { type: 'buttons', quantity: 50 }
        ]
    },
    'intro_talk_martha': {
        id: 'intro_talk_martha',
        title: 'Meet the Mayor',
        description: 'Say hello to Mayor Martha in the village.',
        conditions: [
            { type: 'talk_to_npc', targetId: 'mayor_martha' }
        ],
        rewards: [
            { type: 'item', id: 'seed_packet', quantity: 3 }
        ]
    },
    'verification_quest': {
        id: 'verification_quest',
        title: 'First Steps',
        description: 'Find a Teddy Bear in the world to prove you are ready!',
        conditions: [
            { type: 'find_item', targetId: 'teddy_bear', targetQuantity: 1 }
        ],
        rewards: [
            { type: 'buttons', quantity: 100 }
        ]
    }
};
