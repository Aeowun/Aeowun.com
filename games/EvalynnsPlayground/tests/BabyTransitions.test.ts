import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { followerSystem } from '../src/systems/FollowerSystem';
import { interactionSystem } from '../src/systems/InteractionSystem';

describe('Baby Transitions (C2, C3, C4)', () => {
    beforeEach(() => {
        gameState.babies = {
            'baby_test': { id: 'baby_test', state: 'Wild', x: 500, y: 500, needs: { state: 'Content', hunger: 0, energy: 100, happiness: 100 } }
        };
        gameState.followerIds = [];
        interactionSystem.unregisterCandidate('baby_test');
    });

    it('manages authoritative wild baby state cleanly (C2)', () => {
        expect(gameState.babies['baby_test'].state).toBe('Wild');
        expect(gameState.babies['baby_test'].id).toBe('baby_test');
    });

    it('creates a valid interaction prompt/candidate when wild (C3)', () => {
        interactionSystem.registerCandidate({
            id: 'baby_test',
            type: 'baby',
            x: 500,
            y: 500,
            priority: 10,
            canInteract: () => gameState.babies['baby_test'].state === 'Wild',
            onInteract: () => followerSystem.recruit('baby_test')
        });

        const target = interactionSystem.update(510, 510);
        expect(target?.id).toBe('baby_test');
        expect(target?.type).toBe('baby');
    });

    it('transitions wild baby to following atomically via recruitment callback (C4)', () => {
        interactionSystem.registerCandidate({
            id: 'baby_test',
            type: 'baby',
            x: 500,
            y: 500,
            priority: 10,
            canInteract: () => gameState.babies['baby_test'].state === 'Wild',
            onInteract: () => followerSystem.recruit('baby_test')
        });

        // Execute interaction callback loop
        const target = interactionSystem.update(500, 500);
        expect(target).toBeDefined();

        interactionSystem.interact();

        // Verify C4 transition invariants
        expect(gameState.babies['baby_test'].state).toBe('Following');
        expect(gameState.followerIds).toContain('baby_test');

        // Check that interaction prompt updates cleanly (cannot re-recruit already recruited baby)
        const nextTarget = interactionSystem.update(500, 500);
        expect(nextTarget).toBeNull();
    });
});
