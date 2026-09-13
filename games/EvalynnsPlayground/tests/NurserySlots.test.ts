import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { nurserySystem } from '../src/systems/NurserySystem';
import { followerSystem } from '../src/systems/FollowerSystem';

describe('Nursery Slots Loop (D8, D9)', () => {
    beforeEach(() => {
        gameState.followerIds = [];
        gameState.babies = {
            'baby_nursery_test': { id: 'baby_nursery_test', state: 'Wild', x: 100, y: 100, needs: { state: 'Content', hunger: 0, energy: 100, happiness: 100 } }
        };
    });

    it('enforces that a baby cannot simultaneously be Following and Nursery (D8 invariant)', () => {
        // First recruit baby into follower system
        followerSystem.recruit('baby_nursery_test');
        expect(gameState.followerIds).toContain('baby_nursery_test');
        expect(gameState.babies['baby_nursery_test'].state).toBe('Following');

        // Assign to nursery slot
        nurserySystem.registerBaby('baby_nursery_test', 'slot_crib_001');

        // Invariant check: should be removed atomically from Following when assigned to Nursery
        expect(gameState.followerIds).not.toContain('baby_nursery_test');
        expect(gameState.babies['baby_nursery_test'].state).toBe('Nursery');
        expect(gameState.babies['baby_nursery_test'].nurserySlotId).toBe('slot_crib_001');
    });

    it('handles the complete Following -> Nursery -> Leave Nursery -> Following cycle seamlessly (D9)', () => {
        // 1. Start following
        followerSystem.recruit('baby_nursery_test');
        expect(gameState.babies['baby_nursery_test'].state).toBe('Following');

        // 2. Transition to Nursery slot
        nurserySystem.registerBaby('baby_nursery_test', 'slot_crib_001');
        expect(gameState.babies['baby_nursery_test'].state).toBe('Nursery');

        // 3. Leave nursery (returns to wild baseline first)
        nurserySystem.removeBaby('baby_nursery_test');
        expect(gameState.babies['baby_nursery_test'].state).toBe('Wild');
        expect(gameState.babies['baby_nursery_test'].nurserySlotId).toBeUndefined();

        // 4. Back to following loop
        followerSystem.recruit('baby_nursery_test');
        expect(gameState.babies['baby_nursery_test'].state).toBe('Following');
    });
});
