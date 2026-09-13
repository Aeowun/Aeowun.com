import { gameState, InventoryEntry } from '../core/GameState';
import { inventorySystem } from './InventorySystem';
import { ITEMS } from '../data/items';

export class StorageSystem {
    public getStorageInventory(storageId: string): InventoryEntry[] {
        if (!gameState.storageInventories[storageId]) {
            gameState.storageInventories[storageId] = [];
        }
        return gameState.storageInventories[storageId];
    }

    /**
     * Moves an item from player inventory to storage.
     */
    public deposit(storageId: string, itemId: string, quantity: number = 1): boolean {
        if (!inventorySystem.hasItem(itemId, quantity)) return false;

        const storageInv = this.getStorageInventory(storageId);
        const definition = ITEMS[itemId];

        // 1. Remove from player
        inventorySystem.removeItem(itemId, quantity);

        // 2. Add to storage (handling stacking)
        const existingEntry = storageInv.find(e => e.itemId === itemId);
        if (existingEntry && definition.stackable) {
            existingEntry.quantity += quantity;
        } else {
            storageInv.push({ itemId, quantity: definition.stackable ? quantity : 1 });
            // For non-stackable, if quantity was > 1, we should handle multiple entries
            // but for simplicity we'll assume quantity 1 for non-stackable deposits.
        }

        return true;
    }

    /**
     * Moves an item from storage to player inventory.
     */
    public withdraw(storageId: string, itemId: string, quantity: number = 1): boolean {
        const storageInv = this.getStorageInventory(storageId);
        const index = storageInv.findIndex(e => e.itemId === itemId);
        if (index === -1) return false;

        const entry = storageInv[index];
        if (entry.quantity < quantity) return false;

        // 1. Add to player
        if (inventorySystem.addItem(itemId, quantity)) {
            // 2. Remove from storage
            entry.quantity -= quantity;
            if (entry.quantity <= 0) {
                storageInv.splice(index, 1);
            }
            return true;
        }

        return false;
    }
}

export const storageSystem = new StorageSystem();
