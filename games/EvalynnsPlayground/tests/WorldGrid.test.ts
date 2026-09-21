import { describe, it, expect } from 'vitest';
import { WorldGrid } from '../src/world/WorldGrid';

describe('WorldGrid', () => {
    const grid = new WorldGrid(32);

    it('converts world to grid correctly', () => {
        expect(grid.worldToGrid(0, 0)).toEqual({ x: 0, y: 0 });
        expect(grid.worldToGrid(31, 31)).toEqual({ x: 0, y: 0 });
        expect(grid.worldToGrid(32, 32)).toEqual({ x: 1, y: 1 });
        expect(grid.worldToGrid(63, 63)).toEqual({ x: 1, y: 1 });
        expect(grid.worldToGrid(-1, -1)).toEqual({ x: -1, y: -1 });
    });

    it('converts grid to world correctly', () => {
        expect(grid.gridToWorld(0, 0)).toEqual({ x: 0, y: 0 });
        expect(grid.gridToWorld(1, 1)).toEqual({ x: 32, y: 32 });
    });

    it('snaps world to grid correctly', () => {
        expect(grid.snapToGrid(10, 10)).toEqual({ x: 0, y: 0 });
        expect(grid.snapToGrid(40, 40)).toEqual({ x: 32, y: 32 });
    });

    it('validates bounds correctly', () => {
        const boundedGrid = new WorldGrid(32, 10, 10);
        expect(boundedGrid.isInBounds(0, 0)).toBe(true);
        expect(boundedGrid.isInBounds(9, 9)).toBe(true);
        expect(boundedGrid.isInBounds(10, 5)).toBe(false);
        expect(boundedGrid.isInBounds(5, 10)).toBe(false);
        expect(boundedGrid.isInBounds(-1, 5)).toBe(false);
    });

    it('validates walkability against blocked regions and world bounds', () => {
        expect(grid.isWalkable(500, 500)).toBe(true);
        // Map boundary at top (y: 0-32) is blocked
        expect(grid.isWalkable(100, 16)).toBe(false);
        // Off world grid dimensions completely
        expect(grid.isWalkable(-10, 500)).toBe(false);
        expect(grid.isWalkable(2100, 500)).toBe(false);
    });

    it('validates footprints correctly', () => {
        const occupied = new Set<string>();
        occupied.add('1,1');

        // Valid footprint
        expect(grid.isFootprintValid(0, 0, 1, 1, occupied)).toBe(true);
        // Overlapping footprint
        expect(grid.isFootprintValid(0, 0, 2, 2, occupied)).toBe(false);
        // Just touching but not overlapping
        expect(grid.isFootprintValid(2, 2, 1, 1, occupied)).toBe(true);
    });
});
