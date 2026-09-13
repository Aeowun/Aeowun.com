import { gameState, BabyData } from '../core/GameState';

export class FollowerSystem {
    public recruit(babyId: string) {
        const baby = gameState.babies[babyId];
        if (!baby || baby.state !== 'Wild') return;

        if (gameState.followerIds.includes(babyId)) return;

        baby.state = 'Following';
        gameState.followerIds.push(babyId);
    }

    public release(babyId: string) {
        const index = gameState.followerIds.indexOf(babyId);
        if (index !== -1) {
            gameState.followerIds.splice(index, 1);
            const baby = gameState.babies[babyId];
            if (baby) baby.state = 'Wild';
        }
    }

    public getFollowers(): BabyData[] {
        return gameState.followerIds.map(id => gameState.babies[id]);
    }

    /**
     * Updates baby positions based on their leader.
     * In a real implementation, this might use a position history buffer for smooth trailing.
     */
    public updatePositions(leaderX: number, leaderY: number) {
        let prevX = leaderX;
        let prevY = leaderY;
        const spacing = 40;

        for (const babyId of gameState.followerIds) {
            const baby = gameState.babies[babyId];
            if (!baby) continue;

            // Simple "pull" logic for now
            const dx = prevX - baby.x;
            const dy = prevY - baby.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > spacing) {
                const angle = Math.atan2(dy, dx);
                baby.x = prevX - Math.cos(angle) * spacing;
                baby.y = prevY - Math.sin(angle) * spacing;
            }

            prevX = baby.x;
            prevY = baby.y;
        }
    }
}

export const followerSystem = new FollowerSystem();
