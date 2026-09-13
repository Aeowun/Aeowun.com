import { CONFIG } from '../data/config';
import { MAP_DATA } from './Map';

export interface GridPos {
    x: number;
    y: number;
}

export interface WorldPos {
    x: number;
    y: number;
}

export class WorldGrid {
    private readonly tileSize: number;
    private readonly width: number;
    private readonly height: number;

    constructor(
        tileSize: number = CONFIG.TILE_SIZE,
        width: number = MAP_DATA.worldWidth / CONFIG.TILE_SIZE,
        height: number = MAP_DATA.worldHeight / CONFIG.TILE_SIZE
    ) {
        this.tileSize = tileSize;
        this.width = width;
        this.height = height;
    }

    public getTileSize(): number {
        return this.tileSize;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public isInBounds(gridX: number, gridY: number): boolean {
        return (
            gridX >= 0 &&
            gridX < this.width &&
            gridY >= 0 &&
            gridY < this.height
        );
    }

    public isWalkable(worldX: number, worldY: number): boolean {
        if (
            worldX < 0 ||
            worldY < 0 ||
            worldX >= MAP_DATA.worldWidth ||
            worldY >= MAP_DATA.worldHeight
        ) {
            return false;
        }

        const grid = this.worldToGrid(worldX, worldY);

        if (!this.isInBounds(grid.x, grid.y)) {
            return false;
        }

        return !MAP_DATA.blockedRegions.some(region =>
            worldX >= region.x &&
            worldX < region.x + region.width &&
            worldY >= region.y &&
            worldY < region.y + region.height
        );
    }

    public worldToGrid(worldX: number, worldY: number): GridPos {
        return {
            x: Math.floor(worldX / this.tileSize),
            y: Math.floor(worldY / this.tileSize)
        };
    }

    public gridToWorld(gridX: number, gridY: number): WorldPos {
        return {
            x: gridX * this.tileSize,
            y: gridY * this.tileSize
        };
    }

    public gridToWorldCenter(gridX: number, gridY: number): WorldPos {
        return {
            x: gridX * this.tileSize + this.tileSize / 2,
            y: gridY * this.tileSize + this.tileSize / 2
        };
    }

    public snapToGrid(worldX: number, worldY: number): WorldPos {
        const grid = this.worldToGrid(worldX, worldY);
        return this.gridToWorld(grid.x, grid.y);
    }

    public isFootprintValid(
        gridX: number,
        gridY: number,
        width: number,
        height: number,
        occupied: Set<string>
    ): boolean {
        if (
            !this.isInBounds(gridX, gridY) ||
            !this.isInBounds(
                gridX + width - 1,
                gridY + height - 1
            )
        ) {
            return false;
        }

        for (let x = gridX; x < gridX + width; x++) {
            for (let y = gridY; y < gridY + height; y++) {
                if (occupied.has(`${x},${y}`)) {
                    return false;
                }

                const center = this.gridToWorldCenter(x, y);

                if (!this.isWalkable(center.x, center.y)) {
                    return false;
                }
            }
        }

        return true;
    }
}