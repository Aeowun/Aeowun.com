import { gameState } from '../core/GameState';

export interface OnboardingStep {
    id: string;
    text: string;
    isComplete: () => boolean;
}

export class OnboardingSystem {
    private steps: OnboardingStep[] = [
        {
            id: 'move',
            text: 'Welcome Evalynn! Move around using [WASD] or the Joystick.',
            isComplete: () => Math.hypot(gameState.player.x - 400, gameState.player.y - 300) > 50
        },
        {
            id: 'recruit',
            text: 'Look for a Lost Baby and press [E] to grab them and start a train!',
            isComplete: () => gameState.followerIds.length > 0
        },
        {
            id: 'talk',
            text: 'Go to the Village and talk to Shopkeeper Sam.',
            isComplete: () => gameState.buttons < 100 || gameState.inventory.some(i => i.itemId === 'seed_packet' && i.quantity > 3)
            // Simplified check: if they bought something or have more seeds (reward)
        }
    ];

    public getCurrentStep(): OnboardingStep | null {
        // In a real system, we'd persist the current index.
        // For minimalist approach, we find the first incomplete step.
        return this.steps.find(s => !s.isComplete()) || null;
    }
}

export const onboardingSystem = new OnboardingSystem();
