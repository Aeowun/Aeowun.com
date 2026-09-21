import { CONFIG } from '../data/config';

export interface Interactable {
    id: string;
    type: string; // The candidate type (e.g., 'baby', 'item', 'bed', 'garden')
    x: number;
    y: number;
    priority: number;
    canInteract: () => boolean;
    onInteract: () => void;
}

export class InteractionSystem {
    private candidates: Interactable[] = [];
    private currentTarget: Interactable | null = null;

    public registerCandidate(candidate: Interactable) {
        this.candidates.push(candidate);
    }

    public unregisterCandidate(id: string) {
        this.candidates = this.candidates.filter(c => c.id !== id);
    }

    /**
     * Finds and ranks nearby candidates, selecting the best one.
     */
    public update(playerX: number, playerY: number): Interactable | null {
        const radiusSq = CONFIG.INTERACTION_RADIUS * CONFIG.INTERACTION_RADIUS;

        const validCandidates = this.candidates.filter(c => {
            if (!c.canInteract()) return false;
            const dx = c.x - playerX;
            const dy = c.y - playerY;
            return (dx * dx + dy * dy) <= radiusSq;
        });

        if (validCandidates.length === 0) {
            this.currentTarget = null;
            return null;
        }

        // Rank by priority (higher first), then by distance (closer first)
        validCandidates.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            const distASq = (a.x - playerX) ** 2 + (a.y - playerY) ** 2;
            const distBSq = (b.x - playerX) ** 2 + (b.y - playerY) ** 2;
            return distASq - distBSq;
        });

        this.currentTarget = validCandidates[0];
        return this.currentTarget;
    }

    public interact() {
        if (this.currentTarget) {
            this.currentTarget.onInteract();
        }
    }

    public getCurrentTarget(): Interactable | null {
        return this.currentTarget;
    }
}

export const interactionSystem = new InteractionSystem();
