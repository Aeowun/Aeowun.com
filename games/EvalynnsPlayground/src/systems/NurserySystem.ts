import { gameState } from '../core/GameState';
import { followerSystem } from './FollowerSystem';

export class NurserySystem {
    public registerBaby(babyId: string, slotId: string) {
        const baby = gameState.babies[babyId];
        if (!baby) return;

        // Ensure exclusivity
        followerSystem.release(babyId);

        baby.state = 'Nursery';
        baby.nurserySlotId = slotId;
    }

    public removeBaby(babyId: string) {
        const baby = gameState.babies[babyId];
        if (baby && baby.state === 'Nursery') {
            baby.state = 'Wild';
            baby.nurserySlotId = undefined;
        }
    }
}

export const nurserySystem = new NurserySystem();
