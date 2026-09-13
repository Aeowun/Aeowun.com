import { gameState } from '../core/GameState';
import { SHOPS } from '../data/shops';
import { inventorySystem } from './InventorySystem';

export class ShopSystem {
    public buyItem(shopId: string, itemId: string): boolean {
        const shop = SHOPS[shopId];
        if (!shop) return false;

        const item = shop.items.find(i => i.itemId === itemId);
        if (!item) return false;

        if (gameState.buttons >= item.price) {
            if (inventorySystem.addItem(itemId)) {
                gameState.buttons -= item.price;
                console.log(`Bought ${itemId} for ${item.price} buttons.`);
                return true;
            }
        } else {
            console.log('Not enough buttons!');
        }
        return false;
    }
}

export const shopSystem = new ShopSystem();
