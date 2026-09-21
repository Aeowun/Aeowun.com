import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { onboardingSystem } from '../src/systems/OnboardingSystem';

describe('OnboardingSystem', () => {
    beforeEach(() => {
        gameState.player.x = 400;
        gameState.player.y = 300;
        gameState.followerIds = [];
    });

    it('identifies the current onboarding step (move)', () => {
        const step = onboardingSystem.getCurrentStep();
        expect(step?.id).toBe('move');
    });

    it('advances to next step once complete (recruit)', () => {
        // Complete move step
        gameState.player.x = 600;

        const step = onboardingSystem.getCurrentStep();
        expect(step?.id).toBe('recruit');
    });
});
