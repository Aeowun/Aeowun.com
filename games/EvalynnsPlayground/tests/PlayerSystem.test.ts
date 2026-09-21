import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/core/GameState';
import { playerSystem } from '../src/systems/PlayerSystem';

describe('PlayerSystem', () => {
    beforeEach(() => {
        gameState.player.x = 400;
        gameState.player.y = 300;
        gameState.player.facing = 'down';
    });

    it('moves player continuously based on delta time', () => {
        // Moving right at full speed for 1 second
        // Speed = 160 units/second
        playerSystem.move(1, 0, 1);
        expect(gameState.player.x).toBe(560);
        expect(gameState.player.y).toBe(300);
        expect(gameState.player.facing).toBe('right');
    });

    it('normalizes diagonal movement speed', () => {
        // Moving diagonally (1, 1) for 1 second
        playerSystem.move(1, 1, 1);
        const distance = Math.hypot(gameState.player.x - 400, gameState.player.y - 300);
        expect(distance).toBeCloseTo(160, 5);
    });

    it('does not move when no input is provided', () => {
        playerSystem.move(0, 0, 1);
        expect(gameState.player.x).toBe(400);
        expect(gameState.player.y).toBe(300);
    });
});
