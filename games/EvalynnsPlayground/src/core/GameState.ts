export type BabyState = 'Wild' | 'Following' | 'Nursery' | 'Playing';
export type BabyNeedState = 'Content' | 'Hungry' | 'Tired' | 'Upset' | 'Comforted';

export type QuestStatus = 'NotStarted' | 'Active' | 'Completed';

export interface BabyNeeds {
    state: BabyNeedState;
    hunger: number; // 0 to 100
    energy: number; // 0 to 100
    happiness: number; // 0 to 100
}

export interface QuestState {
    id: string;
    status: QuestStatus;
}

export interface BabyData {
    id: string;
    name: string; // Dynamic name that can be changed
    state: BabyState;
    x: number;
    y: number;
    nurserySlotId?: string;
    needs: BabyNeeds;
}

export interface PlacedObject {
    id: string;
    type: string;
    gridX: number;
    gridY: number;
    width: number;
    height: number;
}

export type GardenStage = 'Empty' | 'Tilled' | 'Planted' | 'Growing' | 'Harvestable';

export interface GardenTile {
    gridX: number;
    gridY: number;
    stage: GardenStage;
    plantId?: string;
    plantedDay?: number;
}

export interface InventoryEntry {
    itemId: string;
    quantity: number;
}

export interface WorldItemData {
    id: string;
    itemId: string;
    x: number;
    y: number;
}

export type PlayerFacing = 'up' | 'down' | 'left' | 'right';

export interface PlayerState {
    id: string;
    name: string;
    x: number;
    y: number;
    facing: PlayerFacing;
}

export interface NPCState {
    id: string;
    x: number;
    y: number;
}

/**
 * GameState is the authoritative persistent state container.
 * It contains all data that must survive a save/load cycle.
 *
 * Ownership Rules:
 * - player: PlayerSystem / Movement
 * - gameDay: TimeSystem
 * - babies: BabySystem (Existence), FollowerSystem (Relationships), NurserySystem (Assignments)
 * - followerIds: FollowerSystem
 * - placedObjects: PlacementSystem
 * - gardenTiles: GardeningSystem
 * - inventory: InventorySystem
 * - storageInventories: StorageSystem
 * - npcs: NPCSystem
 * - worldItems: WorldItemSystem
 */
export class GameState {
    /** Owned by PlayerSystem */
    public player: PlayerState = { id: 'player_evalynn', name: 'Evalynn', x: 400, y: 300, facing: 'down' };

    /** Owned by TimeSystem */
    public gameDay: number = 1;

    /** Owned by BabySystem/FollowerSystem/NurserySystem */
    public babies: Record<string, BabyData> = {
        'baby_001': { id: 'baby_001', name: '', state: 'Wild', x: 500, y: 500, needs: { state: 'Content', hunger: 0, energy: 100, happiness: 100 } },
        'baby_002': { id: 'baby_002', name: '', state: 'Wild', x: 600, y: 200, needs: { state: 'Content', hunger: 0, energy: 100, happiness: 100 } },
        'baby_003': { id: 'baby_003', name: '', state: 'Wild', x: 300, y: 700, needs: { state: 'Content', hunger: 0, energy: 100, happiness: 100 } }
    };

    /** Owned by FollowerSystem */
    public followerIds: string[] = [];

    /** Owned by PlacementSystem */
    public placedObjects: PlacedObject[] = [];

    /** Owned by GardeningSystem */
    public gardenTiles: Record<string, GardenTile> = {};

    /** Owned by InventorySystem */
    public inventory: InventoryEntry[] = [];

    /** Owned by StorageSystem */
    public storageInventories: Record<string, InventoryEntry[]> = {};

    /** Owned by NPCSystem */
    public npcs: Record<string, NPCState> = {
        'shopkeeper_sam': { id: 'shopkeeper_sam', x: 900, y: 900 },
        'mayor_martha': { id: 'mayor_martha', x: 1200, y: 500 }
    };

    /** Owned by QuestSystem */
    public quests: Record<string, QuestState> = {};

    /** Owned by EconomySystem */
    public buttons: number = 100;

    /** Owned by WorldItemSystem */
    public worldItems: WorldItemData[] = [
        { id: 'world_item_1', itemId: 'bottle', x: 450, y: 450 },
        { id: 'world_item_2', itemId: 'seed_packet', x: 200, y: 200 },
        { id: 'world_item_3', itemId: 'teddy_bear', x: 700, y: 100 },
        { id: 'world_item_4', itemId: 'teddy_bear', x: 300, y: 300 }
    ];
}

export const gameState = new GameState();
