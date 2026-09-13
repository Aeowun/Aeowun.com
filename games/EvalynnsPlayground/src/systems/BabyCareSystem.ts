import { gameState, BabyNeedState } from '../core/GameState';
import { inventorySystem } from './InventorySystem';

export class BabyCareSystem {
    /**
     * Feeds a baby with a bottle.
     * Consumes one bottle from inventory.
     */
    public feedBaby(babyId: string): boolean {
        const baby = gameState.babies[babyId];
        if (!baby) return false;

        if (!inventorySystem.hasItem('bottle', 1)) {
            console.log('No bottles left!');
            return false;
        }

        inventorySystem.removeItem('bottle', 1);

        // Improve needs
        baby.needs.hunger = Math.max(0, baby.needs.hunger - 50);
        this.updateNeedState(babyId);

        return true;
    }

    /**
     * Comforts a baby with a teddy bear.
     * Teddy bear is NOT consumed (comfort interaction).
     */
    public comfortBaby(babyId: string): boolean {
        const baby = gameState.babies[babyId];
        if (!baby) return false;

        if (!inventorySystem.hasItem('teddy_bear', 1)) {
            console.log('No teddy bear in inventory!');
            return false;
        }

        // Improve happiness
        baby.needs.happiness = Math.min(100, baby.needs.happiness + 50);
        this.updateNeedState(babyId);

        return true;
    }

    /**
     * Updates the logical need state based on current values.
     */
    public updateNeedState(babyId: string) {
        const baby = gameState.babies[babyId];
        if (!baby) return;

        const needs = baby.needs;
        let newState: BabyNeedState = 'Content';

        if (needs.hunger > 70) {
            newState = 'Hungry';
        } else if (needs.energy < 30) {
            newState = 'Tired';
        } else if (needs.happiness < 40) {
            newState = 'Upset';
        } else if (needs.happiness > 90 && needs.hunger < 10) {
            newState = 'Comforted';
        }

        needs.state = newState;
    }

    /**
     * Passively increases needs over time (e.g. daily).
     */
    public advanceNeeds() {
        Object.values(gameState.babies).forEach(baby => {
            baby.needs.hunger = Math.min(100, baby.needs.hunger + 20);
            baby.needs.energy = Math.max(0, baby.needs.energy - 10);
            baby.needs.happiness = Math.max(0, baby.needs.happiness - 5);
            this.updateNeedState(baby.id);
        });
    }
}

export const babyCareSystem = new BabyCareSystem();
