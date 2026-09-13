import { gameState, BabyData } from '../core/GameState';

export class BabyBehaviorSystem {
    /**
     * Updates behaviors for babies not in Following or Nursery state.
     */
    public update(deltaTime: number) {
        Object.values(gameState.babies).forEach(baby => {
            if (baby.state === 'Playing') {
                this.updatePlayingBehavior(baby, deltaTime);
            } else if (baby.state === 'Wild') {
                this.updateWanderBehavior(baby, deltaTime);
            }
        });
    }

    private updatePlayingBehavior(baby: BabyData, _deltaTime: number) {
        // Babies in "Playing" state wiggle or wander near their current spot
        if (Math.random() < 0.01) {
            baby.x += (Math.random() - 0.5) * 20;
            baby.y += (Math.random() - 0.5) * 20;
        }
    }

    private updateWanderBehavior(baby: BabyData, _deltaTime: number) {
        // Slow idle wandering for wild babies
        if (Math.random() < 0.005) {
            baby.x += (Math.random() - 0.5) * 10;
            baby.y += (Math.random() - 0.5) * 10;
        }
    }

    public setPlaying(babyId: string) {
        const baby = gameState.babies[babyId];
        if (baby) {
            baby.state = 'Playing';
        }
    }
}

export const babyBehaviorSystem = new BabyBehaviorSystem();
