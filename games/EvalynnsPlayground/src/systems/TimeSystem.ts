import { gameState } from '../core/GameState';
import { babyCareSystem } from './BabyCareSystem';

export class TimeSystem {
    public advanceDay() {
        gameState.gameDay += 1;
        babyCareSystem.advanceNeeds();
    }
}

export const timeSystem = new TimeSystem();

