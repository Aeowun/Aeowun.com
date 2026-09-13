import { RECIPES } from '../data/recipes';
import { inventorySystem } from './InventorySystem';

export class CraftingSystem {
    /**
     * Checks if all required materials for a recipe are present in inventory.
     */
    public canCraft(recipeId: string): boolean {
        const recipe = RECIPES[recipeId];
        if (!recipe) return false;

        for (const input of recipe.inputs) {
            if (!inventorySystem.hasItem(input.itemId, input.quantity)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Atomically consumes inputs and produces output.
     * Failure leaves state unchanged.
     */
    public craft(recipeId: string): boolean {
        if (!this.canCraft(recipeId)) {
            console.log(`Missing materials for recipe: ${recipeId}`);
            return false;
        }

        const recipe = RECIPES[recipeId];

        // 1. Consume inputs
        for (const input of recipe.inputs) {
            inventorySystem.removeItem(input.itemId, input.quantity);
        }

        // 2. Produce output
        inventorySystem.addItem(recipe.outputItemId, recipe.outputQuantity);

        console.log(`Successfully crafted: ${recipe.name}`);
        return true;
    }

    public getAvailableRecipes() {
        return Object.values(RECIPES);
    }
}

export const craftingSystem = new CraftingSystem();
