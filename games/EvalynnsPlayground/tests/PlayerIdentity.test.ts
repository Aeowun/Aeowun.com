import { describe, it, expect } from 'vitest';
import { gameState } from '../src/core/GameState';

describe('Player Identity and State', () => {
    it('has standard player identity properties', () => {
        expect(gameState.player.id).toBeDefined();
        expect(typeof gameState.player.id).toBe('string');
        expect(gameState.player.name).toBeDefined();
        expect(typeof gameState.player.name).toBe('string');
    });

    it('has player position and facing state independent of presentation', () => {
        gameState.player.x = 500;
        gameState.player.y = 600;
        gameState.player.facing = 'left';

        expect(gameState.player.x).toBe(500);
        expect(gameState.player.y).toBe(600);
        expect(gameState.player.facing).toBe('left');
    });
});
