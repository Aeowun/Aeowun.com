export interface NPCDefinition {
    id: string;
    name: string;
    spriteKey: string;
    description: string;
    initialX: number;
    initialY: number;
}

export const NPCS: Record<string, NPCDefinition> = {
    'shopkeeper_sam': {
        id: 'shopkeeper_sam',
        name: 'Shopkeeper Sam',
        spriteKey: 'npc_sam',
        description: 'He sells seeds and supplies for your garden.',
        initialX: 900,
        initialY: 900
    },
    'mayor_martha': {
        id: 'mayor_martha',
        name: 'Mayor Martha',
        spriteKey: 'npc_martha',
        description: 'The kind mayor of the baby village.',
        initialX: 1200,
        initialY: 500
    }
};
