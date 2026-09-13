import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { saveSystem } from '../src/systems/SaveSystem';

describe('SaveSystem', () => {
    beforeEach(() => {
        // Mock localStorage
        const storage: Record<string, string> = {};
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => storage[key] || null,
            setItem: (key: string, val: string) => storage[key] = val,
        });
    });

    it('performs a faithful save/load round trip', () => {
        gameState.gameDay = 42;
        gameState.player = { id: 'player_evalynn', name: 'Evalynn', x: 123, y: 456, facing: 'up' };
        gameState.followerIds = ['baby_001'];

        saveSystem.save();

        // Wipe current state
        gameState.gameDay = 1;
        gameState.player = { id: '', name: '', x: 0, y: 0, facing: 'down' };
        gameState.followerIds = [];

        const loaded = saveSystem.load();
        expect(loaded).toBe(true);
        expect(gameState.gameDay).toBe(42);
        expect(gameState.player.x).toBe(123);
        expect(gameState.player.facing).toBe('up');
        expect(gameState.player.id).toBe('player_evalynn');
        expect(gameState.followerIds).toEqual(['baby_001']);
    });

    it('verifies baby follower state survives a true save/load round trip (C7)', () => {
        gameState.babies['baby_001'] = { id: 'baby_001', state: 'Following', x: 100, y: 120, needs: { state: 'Content', hunger: 0, energy: 100, happiness: 100 } };
        gameState.followerIds = ['baby_001'];

        saveSystem.save();

        // Overwrite status to wild to mimic memory reset
        gameState.babies['baby_001'] = { id: 'baby_001', state: 'Wild', x: 0, y: 0, needs: { state: 'Hungry', hunger: 50, energy: 50, happiness: 50 } };
        gameState.followerIds = [];

        const loaded = saveSystem.load();
        expect(loaded).toBe(true);
        expect(gameState.babies['baby_001'].state).toBe('Following');
        expect(gameState.babies['baby_001'].x).toBe(100);
        expect(gameState.babies['baby_001'].y).toBe(120);
        expect(gameState.followerIds).toEqual(['baby_001']);
    });
});
