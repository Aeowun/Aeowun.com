export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface HouseDefinition {
    id: string;
    exterior: Rectangle;
    interior: Rectangle;
}

export interface RegionDefinition extends Rectangle {
    id: string;
    name: string;
}

export const MAP_DATA = {
    worldWidth: 4096,
    worldHeight: 4096,

    houses: [
        {
            id: 'evalynn_house',
            exterior: {
                x: 320,
                y: 160,
                width: 320,
                height: 224
            },
            interior: {
                x: 360,
                y: 200,
                width: 240,
                height: 144
            }
        },
        {
            id: 'village_shop',
            exterior: {
                x: 720,
                y: 3380,
                width: 320,
                height: 256
            },
            interior: {
                x: 760,
                y: 3420,
                width: 240,
                height: 176
            }
        }
    ] as HouseDefinition[],

    regions: [
        {
            id: 'player_home',
            x: 0,
            y: 0,
            width: 1024,
            height: 960,
            name: "Evalynn's Home"
        },
        {
            id: 'forest',
            x: 96,
            y: 768,
            width: 768,
            height: 2240,
            name: 'Forest'
        },
        {
            id: 'forest_trail',
            x: 768,
            y: 768,
            width: 1280,
            height: 2304,
            name: 'Forest Trail'
        },
        {
            id: 'mountains',
            x: 1408,
            y: 128,
            width: 640,
            height: 896,
            name: 'Mountain Range'
        },
        {
            id: 'lake',
            x: 2048,
            y: 1024,
            width: 1024,
            height: 1024,
            name: 'Crystal Lake'
        },
        {
            id: 'village',
            x: 0,
            y: 3072,
            width: 2048,
            height: 1024,
            name: 'Village'
        },
        {
            id: 'future_expansion',
            x: 3072,
            y: 0,
            width: 1024,
            height: 1024,
            name: 'Reserved Expansion'
        }
    ] as RegionDefinition[],

    blockedRegions: [
        // Outer boundaries
        { x: 0, y: 0, width: 4096, height: 64 },
        { x: 0, y: 4032, width: 4096, height: 64 },
        { x: 0, y: 0, width: 64, height: 4096 },
        { x: 4032, y: 0, width: 64, height: 4096 },

        // Mountain range
        { x: 1408, y: 128, width: 640, height: 640 },

        // Central mountain barriers
        { x: 1152, y: 1216, width: 384, height: 1024 },
        { x: 0, y: 1408, width: 320, height: 640 },

        // Lake
        { x: 2144, y: 1120, width: 832, height: 832 },

        // Reserved expansion
        { x: 3072, y: 0, width: 1024, height: 1024 }
    ],

    visualZones: {
        garden: {
            x: 448,
            y: 448,
            width: 192,
            height: 192
        },

        forest: [
            {
                x: 96,
                y: 768,
                width: 672,
                height: 704
            },
            {
                x: 96,
                y: 1536,
                width: 672,
                height: 832
            },
            {
                x: 96,
                y: 2432,
                width: 672,
                height: 576
            }
        ],

        trail: {
            x: 768,
            y: 768,
            width: 128,
            height: 2304
        },

        lake: {
            x: 2048,
            y: 1024,
            width: 1024,
            height: 1024
        },

        mountains: {
            x: 1408,
            y: 128,
            width: 640,
            height: 896
        },

        futureExpansion: {
            x: 3072,
            y: 0,
            width: 1024,
            height: 1024
        }
    }
};