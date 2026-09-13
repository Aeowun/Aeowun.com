export interface FurnitureDefinition {
    type: string;
    name: string;
    width: number; // in grid cells
    height: number; // in grid cells
    description: string;
}

export const FURNITURE_DATA: Record<string, FurnitureDefinition> = {
    'crib': {
        type: 'crib',
        name: 'Cozy Crib',
        width: 2,
        height: 2,
        description: 'A beautiful small crib for assignment inside the nursery slots.'
    },
    'toy_box': {
        type: 'toy_box',
        name: 'Toy Chest',
        width: 2,
        height: 1,
        description: 'Perfect for storing small baby toys.'
    },
    'workshop_bench': {
        type: 'workshop_bench',
        name: 'Workshop Bench',
        width: 3,
        height: 1,
        description: 'A place to craft toys and tools for the babies.'
    },
    'storage_chest': {
        type: 'storage_chest',
        name: 'Wooden Chest',
        width: 1,
        height: 1,
        description: 'A sturdy chest to keep items safe.'
    },
    'playground_slide': {
        type: 'playground_slide',
        name: 'Pink Slide',
        width: 2,
        height: 3,
        description: 'A fun slide for the babies to zoom down!'
    },
    'playground_sandbox': {
        type: 'playground_sandbox',
        name: 'Sandbox',
        width: 3,
        height: 3,
        description: 'A place for babies to build sandcastles.'
    }
};
