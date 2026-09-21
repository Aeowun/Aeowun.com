export interface PlantDefinition {
    id: string;
    name: string;
    growthDays: number;
    yieldItemId: string;
    yieldQuantity: number;
}

export const PLANTS: Record<string, PlantDefinition> = {
    'flower_001': {
        id: 'flower_001',
        name: 'Evalynn Rose',
        growthDays: 2,
        yieldItemId: 'teddy_bear', // Yields a teddy bear or we can yield a seed packet/bottle
        yieldQuantity: 1
    }
};
