export interface ItemDefinition {
    id: string;
    name: string;
    spriteKey: string;
    description: string;
    stackable: boolean;
}

export const ITEMS: Record<string, ItemDefinition> = {
    'bottle': {
        id: 'bottle',
        name: 'Milk Bottle',
        spriteKey: 'item_bottle',
        description: 'A warm bottle of milk for a hungry baby.',
        stackable: false
    },
    'seed_packet': {
        id: 'seed_packet',
        name: 'Seed Packet',
        spriteKey: 'item_seeds',
        description: 'Magic seeds that grow into beautiful flowers.',
        stackable: true
    },
    'teddy_bear': {
        id: 'teddy_bear',
        name: 'Teddy Bear',
        spriteKey: 'item_teddy',
        description: 'A soft friend to keep a baby happy.',
        stackable: false
    }
};
