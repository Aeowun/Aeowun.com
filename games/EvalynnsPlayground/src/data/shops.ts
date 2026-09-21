export interface ShopItem {
    itemId: string;
    price: number;
}

export interface ShopDefinition {
    id: string;
    name: string;
    items: ShopItem[];
}

export const SHOPS: Record<string, ShopDefinition> = {
    'village_general_store': {
        id: 'village_general_store',
        name: 'General Store',
        items: [
            { itemId: 'seed_packet', price: 5 },
            { itemId: 'bottle', price: 10 },
            { itemId: 'teddy_bear', price: 25 }
        ]
    }
};
