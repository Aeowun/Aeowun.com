import { gameState } from '../core/GameState';
import { CONFIG } from '../data/config';
import { WorldGrid } from '../world/WorldGrid';

export class PlayerSystem {
    private grid = new WorldGrid();

    /**
     * Updates the player's authoritative position based on velocity inputs and a time delta (in seconds).
     * Enforces world boundaries and walkable terrain independent of presentation.
     */
    public move(vx: number, vy: number, deltaTime: number) {
        let moveX = vx;
        let moveY = vy;

        const length = Math.hypot(moveX, moveY);
        if (length > 1) {
            moveX /= length;
            moveY /= length;
        }

        const speed = CONFIG.PLAYER_SPEED;
        const nextX = gameState.player.x + moveX * speed * deltaTime;
        const nextY = gameState.player.y + moveY * speed * deltaTime;

        // Enforce walkable terrain independently per axis to allow sliding along walls
        if (this.grid.isWalkable(nextX, gameState.player.y)) {
            gameState.player.x = nextX;
        }
        if (this.grid.isWalkable(gameState.player.x, nextY)) {
            gameState.player.y = nextY;
        }

        // Update facing direction based on primary movement axis
        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX > 0) gameState.player.facing = 'right';
            else if (moveX < 0) gameState.player.facing = 'left';
        } else if (Math.abs(moveY) > Math.abs(moveX)) {
            if (moveY > 0) gameState.player.facing = 'down';
            else if (moveY < 0) gameState.player.facing = 'up';
        }
    }
}

export const playerSystem = new PlayerSystem();

