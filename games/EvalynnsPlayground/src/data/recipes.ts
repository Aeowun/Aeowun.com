export interface RecipeInput {
    itemId: string;
    quantity: number;
}

export interface Recipe {
    id: string;
    name: string;
    inputs: RecipeInput[];
    outputItemId: string;
    outputQuantity: number;
}

export const RECIPES: Record<string, Recipe> = {
    'craft_teddy_bear': {
        id: 'craft_teddy_bear',
        name: 'Craft Teddy Bear',
        inputs: [
            { itemId: 'seed_packet', quantity: 2 } // Placeholder: using seeds as materials for now
        ],
        outputItemId: 'teddy_bear',
        outputQuantity: 1
    },
    'craft_bottle': {
        id: 'craft_bottle',
        name: 'Craft Milk Bottle',
        inputs: [
            { itemId: 'seed_packet', quantity: 1 }
        ],
        outputItemId: 'bottle',
        outputQuantity: 1
    }
};
