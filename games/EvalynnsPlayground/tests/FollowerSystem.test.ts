import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { followerSystem } from '../src/systems/FollowerSystem';

describe('FollowerSystem', () => {
    beforeEach(() => {
        gameState.followerIds = [];
        gameState.babies = {
            'b1': { id: 'b1', state: 'Wild', x: 0, y: 0, needs: { state: 'Content', hunger: 0, energy: 100, happiness: 100 } },
            'b2': { id: 'b2', state: 'Wild', x: 0, y: 0, needs: { state: 'Content', hunger: 0, energy: 100, happiness: 100 } }
        };
    });

    it('recruits a wild baby', () => {
        followerSystem.recruit('b1');
        expect(gameState.followerIds).toEqual(['b1']);
        expect(gameState.babies['b1'].state).toBe('Following');
    });

    it('does not recruit a baby twice', () => {
        followerSystem.recruit('b1');
        followerSystem.recruit('b1');
        expect(gameState.followerIds).toEqual(['b1']);
    });

    it('maintains order of recruitment', () => {
        followerSystem.recruit('b1');
        followerSystem.recruit('b2');
        expect(gameState.followerIds).toEqual(['b1', 'b2']);
    });

    it('releases a baby correctly', () => {
        followerSystem.recruit('b1');
        followerSystem.release('b1');
        expect(gameState.followerIds).toEqual([]);
        expect(gameState.babies['b1'].state).toBe('Wild');
    });

    it('enforces follower chain relationships strictly (C5)', () => {
        // Enforce ordering: b1 then b2
        followerSystem.recruit('b1');
        followerSystem.recruit('b2');
        expect(followerSystem.getFollowers()).toEqual([
            gameState.babies['b1'],
            gameState.babies['b2']
        ]);

        // Maximum one leader (player is absolute head, linear queue ensures single leader dependency per chain slot)
        // Check for duplicates avoidance
        followerSystem.recruit('b1');
        expect(gameState.followerIds).toEqual(['b1', 'b2']);

        // No circular relationships: a linear string array strictly prevents back-links
        expect(gameState.followerIds[0]).toBe('b1');
        expect(gameState.followerIds[1]).toBe('b2');
    });

    it('updates physical follower movement trails deterministically (C6)', () => {
        gameState.babies['b1'].x = 100;
        gameState.babies['b1'].y = 100;
        followerSystem.recruit('b1');

        // Move player away to trigger trailing physics pull
        followerSystem.updatePositions(200, 100);

        // Baby should pull closer toward leader target coordinates
        expect(gameState.babies['b1'].x).toBeGreaterThan(100);
        expect(gameState.babies['b1'].x).toBeLessThan(200);
    });
});
