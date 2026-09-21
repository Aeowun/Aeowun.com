export interface BabyDefinition {
    id: string;
    name: string;
    description: string;
    spriteKey: string;
    // Future placeholders for Phase G (Baby Care)
    personality?: string;
    favoriteItemId?: string;
}

export const BABIES: Record<string, BabyDefinition> = {
    'baby_001': {
        id: 'baby_001',
        name: 'Little Evalynn',
        description: 'A very happy baby who loves to parade around!',
        spriteKey: 'baby_evalynn',
        personality: 'Cheerful',
        favoriteItemId: 'teddy_bear'
    },
    'baby_002': {
        id: 'baby_002',
        name: 'Bouncing Ben',
        description: 'He has so much energy and loves to jump.',
        spriteKey: 'baby_ben',
        personality: 'Energetic',
        favoriteItemId: 'bottle'
    },
    'baby_003': {
        id: 'baby_003',
        name: 'Sleepy Sarah',
        description: 'Often found napping in sunny spots.',
        spriteKey: 'baby_sarah',
        personality: 'Calm',
        favoriteItemId: 'teddy_bear'
    }
};

