import { gameState, GardenTile } from '../core/GameState';
import { PLANTS } from '../data/plants';
import { inventorySystem } from './InventorySystem';

export class GardeningSystem {
    public getOrCreateTile(gridX: number, gridY: number): GardenTile {
        const key = `${gridX},${gridY}`;
        if (!gameState.gardenTiles[key]) {
            gameState.gardenTiles[key] = { gridX, gridY, stage: 'Empty' };
        }
        return gameState.gardenTiles[key];
    }

    public interact(gridX: number, gridY: number) {
        const tile = this.getOrCreateTile(gridX, gridY);

        switch (tile.stage) {
            case 'Empty':
                tile.stage = 'Tilled';
                break;
            case 'Tilled':
                // F3: Planting consumes seed packet from inventory
                if (inventorySystem.hasItem('seed_packet', 1)) {
                    inventorySystem.removeItem('seed_packet', 1);
                    tile.stage = 'Planted';
                    tile.plantId = 'flower_001';
                    tile.plantedDay = gameState.gameDay;
                } else {
                    console.log('No seed packets left to plant!');
                }
                break;
            case 'Harvestable':
                // F6: Harvesting produces configured items back into inventory
                if (tile.plantId) {
                    const def = PLANTS[tile.plantId];
                    if (def) {
                        inventorySystem.addItem(def.yieldItemId, def.yieldQuantity);
                    }
                }
                tile.stage = 'Tilled'; // Back to tilled after harvest
                tile.plantId = undefined;
                tile.plantedDay = undefined;
                break;
        }
    }

    public updateGrowth() {
        Object.values(gameState.gardenTiles).forEach(tile => {
            if (!tile.plantId) return;
            const def = PLANTS[tile.plantId];
            if (!def) return;

            const daysPassed = gameState.gameDay - (tile.plantedDay || 0);

            if (tile.stage === 'Planted' && daysPassed >= 1) {
                tile.stage = 'Growing';
            }
            if (tile.stage === 'Growing' && daysPassed >= def.growthDays) {
                tile.stage = 'Harvestable';
            }
        });
    }
}

export const gardeningSystem = new GardeningSystem();

