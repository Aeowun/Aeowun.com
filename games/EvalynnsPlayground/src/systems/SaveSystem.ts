import { gameState } from '../core/GameState';

export class SaveSystem {
    private readonly STORAGE_KEY = 'evalynns_playground_save';

    public save() {
        const data = JSON.stringify(gameState);
        localStorage.setItem(this.STORAGE_KEY, data);
    }

    public load(): boolean {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return false;

        try {
            const parsed = JSON.parse(data);
            Object.assign(gameState, parsed);
            return true;
        } catch (e) {
            console.error('Failed to load save', e);
            return false;
        }
    }
}

export const saveSystem = new SaveSystem();
