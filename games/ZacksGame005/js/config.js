export const W = 128;
export const H = 128;
export const T = 32;
export const TILE_TYPES = {
    Water: 0,
    Dirt: 1,
    Grass: 2,
    Mountain: 3,
    Road: 4,
    Building: 5,
    Decoration: 6,
    Floor: 7,
    Door: 8,
    Cave: 9,
    Void: 10,
    HiddenPassage: 11,
    Torch: 12,
    Diamond: 13,
    Crypt: 14,
    Sign: 15,
    Chest: 16
};

export const COLORS = [
    "#16384a", // 0: Water
    "#6b4930", // 1: Dirt
    "#31452f", // 2: Grass
    "#302b29", // 3: Mountain
    "#806448", // 4: Road
    "#352823", // 5: Building (Walls)
    "#4d5a43", // 6: Decoration
    "#5a4d36", // 7: Floor (Interior)
    "#2a1a0a", // 8: Door
    "#111111", // 9: Cave Entrance
    "#000000", // 10: Void (Dungeon Abyss)
    "#000000", // 11: Hidden Passage (invisible until discovered)
    "#5a3b18", // 12: Torch base tile
    "#75602b", // 13: Diamond base tile
    "#332c28", // 14: Crypt stone
    "#8b5e3c", // 15: Sign post
    "#7b4b3a"  // 16: Chest wood
];

export const INITIAL_SEED = 938271;
