import { gameState, InventoryEntry } from '../core/GameState';
import { ITEMS } from '../data/items';

export class InventorySystem {
    /**
     * Adds an item to the inventory.
     * Handles stacking if the item definition allows it.
     */
    public addItem(itemId: string, quantity: number = 1): boolean {
        const definition = ITEMS[itemId];
        if (!definition) {
            console.error(`Attempted to add invalid item: ${itemId}`);
            return false;
        }

        if (quantity <= 0) return false;

        const existingEntry = gameState.inventory.find(e => e.itemId === itemId);

        if (existingEntry && definition.stackable) {
            existingEntry.quantity += quantity;
            return true;
        }

        if (existingEntry && !definition.stackable) {
            // Cannot stack non-stackable items.
            // Depending on game rules, we might allow multiple entries or just ignore.
            // The invariant states: non-stackable items may not have quantity greater than one.
            // We'll treat them as unique entries if we wanted slots, but since it's slotless,
            // we'll just return true and not increase quantity if it's already there.
            // Or we could allow multiple instances of non-stackables in the list.
            // Given "quantity must be 1 for non-stackable", we'll just push a new entry if we want multiple items.
            // But usually "bottle" is a single item. If we want 2 bottles, we have 2 entries.
            // The plan says: "Unique items remain quantity 1".
            // So for non-stackables, we add a new entry.
            gameState.inventory.push({ itemId, quantity: 1 });
            return true;
        }

        // New item
        gameState.inventory.push({ itemId, quantity: definition.stackable ? quantity : 1 });
        return true;
    }

    /**
     * Removes a quantity of an item.
     */
    public removeItem(itemId: string, quantity: number = 1): boolean {
        const index = gameState.inventory.findIndex(e => e.itemId === itemId);
        if (index === -1) return false;

        const entry = gameState.inventory[index];
        if (entry.quantity < quantity) return false;

        entry.quantity -= quantity;

        if (entry.quantity <= 0) {
            gameState.inventory.splice(index, 1);
        }

        return true;
    }

    public hasItem(itemId: string, minQuantity: number = 1): boolean {
        const total = gameState.inventory
            .filter(e => e.itemId === itemId)
            .reduce((sum, e) => sum + e.quantity, 0);
        return total >= minQuantity;
    }

    public getQuantity(itemId: string): number {
        return gameState.inventory
            .filter(e => e.itemId === itemId)
            .reduce((sum, e) => sum + e.quantity, 0);
    }

    public getAllEntries(): InventoryEntry[] {
        return [...gameState.inventory];
    }
}

export const inventorySystem = new InventorySystem();
