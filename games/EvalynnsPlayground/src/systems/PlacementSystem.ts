import { gameState, PlacedObject } from '../core/GameState';
import { WorldGrid } from '../world/WorldGrid';

export class PlacementSystem {
    private grid: WorldGrid;
    private previewItem: { type: string, width: number, height: number } | null = null;
    private previewPos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(grid: WorldGrid) {
        this.grid = grid;
    }

    public startPlacement(type: string, width: number, height: number) {
        this.previewItem = { type, width, height };
    }

    public updatePreview(worldX: number, worldY: number) {
        const snapped = this.grid.snapToGrid(worldX, worldY);
        this.previewPos = snapped;
    }

    public isValid(): boolean {
        if (!this.previewItem) return false;

        const gridPos = this.grid.worldToGrid(this.previewPos.x, this.previewPos.y);

        // Check bounds
        for (let x = gridPos.x; x < gridPos.x + this.previewItem.width; x++) {
            for (let y = gridPos.y; y < gridPos.y + this.previewItem.height; y++) {
                if (!this.grid.isInBounds(x, y)) {
                    return false;
                }
            }
        }

        // Get all occupied cells
        const occupied = new Set<string>();
        gameState.placedObjects.forEach(obj => {
            for (let x = obj.gridX; x < obj.gridX + obj.width; x++) {
                for (let y = obj.gridY; y < obj.gridY + obj.height; y++) {
                    occupied.add(`${x},${y}`);
                }
            }
        });

        return this.grid.isFootprintValid(gridPos.x, gridPos.y, this.previewItem.width, this.previewItem.height, occupied);
    }

    public commit(): PlacedObject | null {
        if (!this.previewItem || !this.isValid()) return null;

        const gridPos = this.grid.worldToGrid(this.previewPos.x, this.previewPos.y);
        const newObj: PlacedObject = {
            id: `obj_${Date.now()}`,
            type: this.previewItem.type,
            gridX: gridPos.x,
            gridY: gridPos.y,
            width: this.previewItem.width,
            height: this.previewItem.height
        };

        gameState.placedObjects.push(newObj);
        this.previewItem = null;
        return newObj;
    }

    public getPreview() {
        return this.previewItem ? { ...this.previewItem, ...this.previewPos, valid: this.isValid() } : null;
    }
}
