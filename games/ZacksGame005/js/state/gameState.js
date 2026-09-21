import { INITIAL_SEED } from '../config.js';

export function createGameState() {
    return {
        seed: INITIAL_SEED,

        player: {
            x: 80.5,
            y: 74.5,
            radius: 9,
            speed: 3.5,
            dirX: 0,
            dirY: 1,
            facing: 'down',
            hp: 5,
            maxHP: 5,
            animTime: 0,
            moving: false,
            attackTimer: 0,
            attackCooldown: 0,
            attackAngle: 0,
            swordPickedUp: false,
            steelSword: false,
            coins: 0,
            xp: 0,
            level: 1,
            xpToNextLevel: 100,
            baseAttack: 1,
            baseDefense: 0,
            dodgeTimer: 0,
            dodgeCooldown: 0,
            isDodging: false,
            dungeonDiamonds: 0,
            dungeonKeys: {},
            inventory: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            }
        },

        currentWorld: 'overworld',

        worlds: {
            overworld: null,
            dungeon: null
        },

        dungeonStartPending: false,

        boss: null,

        camera: {
            x: 80.5,
            y: 74.5
        },

        enemies: [
            {
                x: 65.5,
                y: 62.5,
                hp: 3,
                maxHP: 3,
                radius: 0.35,
                speed: 1.35,
                alive: true,
                attackCooldown: 0,
                animTime: 0,
                hitFlash: 0,
                attackMeter: 0,
                spawnX: 65.5,
                spawnY: 62.5,
                targetX: 65.5,
                targetY: 62.5,
                wanderTimer: 0
            }
        ],

        npcs: [
            {
                x: 78.5,
                y: 79.5,
                name: "Village Elder"
            },
            {
                x: 89,
                y: 70,
                name: "Shopkeeper"
            },
            {
                x: 75,
                y: 72,
                name: "Mara"
            },
            {
                x: 32,
                y: 76,
                name: "Tessa"
            },
            {
                x: 70,
                y: 107,
                name: "Fen"
            },
            {
                x: 105,
                y: 73,
                name: "Orren"
            }
        ],

        sword: {
            x: 82.2,
            y: 74.5,
            pickedUp: false
        },

        quest: {
            state: "not_started",
            rewardClaimed: false
        },

        ui: {
            currentScreen: 'main_menu',
            dialogueOpen: false,
            activeNPC: null,
            storeOpen: false,
            storeMessage: "",
            inventoryOpen: false,
            inventorySelection: 0,
            levelUpOpen: false,
            levelUpSelection: 0,
            fadeAlpha: 0,
            transitioning: false,
            transitionPhase: 0,
            transitionTimer: 0,
            menuSelection: 0,
            paused: false
        },

        otherPlayers: {},

        multiplayer: {
            id: null,
            status: 'disconnected',
            notification: '',
            hostPeerId: null,
            hostIdInput: '',
            isHost: false,
            roomId: null,
            roomName: null,
            availableRooms: []
        },

        storageNotification: {
            text: '',
            timer: 0
        },

        notifications: [],
        billboards: [],
        projectiles: [],

        keys: {},
        touch: {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            dx: 0,
            dy: 0,
            tapTime: 0,
            isTap: false
        },

        debug: {
            ghostMode: false,
            showCoords: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        },

        world: {
            trapTimer: 0,
            trapsActive: true
        }
    };
}

export const gameState = createGameState();

export function resetGameState() {
    const freshState = createGameState();

    for (const key of Object.keys(gameState)) {
        delete gameState[key];
    }

    Object.assign(gameState, freshState);
}