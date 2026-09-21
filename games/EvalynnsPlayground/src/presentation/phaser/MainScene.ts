import Phaser from 'phaser';
import { gameState, WorldItemData } from '../../core/GameState';
import { CONFIG } from '../../data/config';
import { WorldGrid } from '../../world/WorldGrid';
import { MAP_DATA } from '../../world/Map';

import { interactionSystem } from '../../systems/InteractionSystem';
import { playerSystem } from '../../systems/PlayerSystem';
import { followerSystem } from '../../systems/FollowerSystem';
import { PlacementSystem } from '../../systems/PlacementSystem';
import { nurserySystem } from '../../systems/NurserySystem';
import { gardeningSystem } from '../../systems/GardeningSystem';
import { babyCareSystem } from '../../systems/BabyCareSystem';
import { babyBehaviorSystem } from '../../systems/BabyBehaviorSystem';
import { craftingSystem } from '../../systems/CraftingSystem';
import { storageSystem } from '../../systems/StorageSystem';
import { timeSystem } from '../../systems/TimeSystem';
import { saveSystem } from '../../systems/SaveSystem';
import { inventorySystem } from '../../systems/InventorySystem';
import { shopSystem } from '../../systems/ShopSystem';
import { dialogueSystem } from '../../systems/DialogueSystem';
import { questSystem } from '../../systems/QuestSystem';
import { onboardingSystem } from '../../systems/OnboardingSystem';

import { ITEMS } from '../../data/items';
import { SHOPS } from '../../data/shops';

export class MainScene extends Phaser.Scene {
    private grid: WorldGrid = new WorldGrid();
    private placementSystem: PlacementSystem;

    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    private babySprites: Record<string, Phaser.GameObjects.Sprite> = {};
    private npcSprites: Record<string, Phaser.GameObjects.Sprite> = {};
    private worldItemSprites: Record<string, Phaser.GameObjects.Sprite> = {};
    private placedObjectSprites: Record<string, Phaser.GameObjects.Rectangle> = {};
    private gardenSprites: Record<string, Phaser.GameObjects.Text> = {};
    private nameTags: Record<string, Phaser.GameObjects.Text> = {};

    private roofGraphics!: Phaser.GameObjects.Graphics;
    private previewGraphics!: Phaser.GameObjects.Graphics;
    private terrainGraphics!: Phaser.GameObjects.Graphics;
    private treeSprites: Phaser.GameObjects.Graphics[] = [];

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private wasd!: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };

    private interactKey!: Phaser.Input.Keyboard.Key;
    private placementKey!: Phaser.Input.Keyboard.Key;

    private debugText!: Phaser.GameObjects.Text;
    private interactPrompt!: Phaser.GameObjects.Text;
    private inventoryHud!: Phaser.GameObjects.Text;

    private isPlacementMode = false;
    private autosaveTimer = 0;

    private joystickInput = {
        x: 0,
        y: 0
    };

    private joyPointer: number | null = null;
    private joystickEl: HTMLElement | null = null;
    private stickEl: HTMLElement | null = null;

    constructor() {
        super('MainScene');

        this.placementSystem = new PlacementSystem(this.grid);
    }

    preload() {
        // ------------------------------------------------------------
        // Player
        // ------------------------------------------------------------

        this.load.image(
            'player',
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+CiAgPHJlY3QgeD0iOCIgeT0iMTYiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMiIgcng9IjQiIGZpbGw9IiNmZmNiZTEiLz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjZmZkM2IxIi8+CiAgPHBhdGggZD0iTTEyIDRMNiA4TDEyIDEyWiIgZmlsbD0iI2ZmNjlCNCIvPgogIDxwYXRoIGQ9Ik0yMCA0TDI2IDhMMjAgMTJaIiBmaWxsPSIjZmY2OWI0Ii8+CiAgPGNpcmNsZSBjeD0iMTMiIGN5PSIxMSIgcj0iMS41IiBmaWxsPSIjMzMzIi8+CiAgPGNpcmNsZSBjeD0iMTkiIGN5PSIxMSIgcj0iMS41IiBmaWxsPSIjMzMzIi8+Cjwvc3ZnPg=='
        );

        // ------------------------------------------------------------
        // Baby
        // ------------------------------------------------------------

        this.load.image(
            'baby',
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+CiAgPHJlY3QgeD0iMTAiIHk9IjE4IiB3aWR0aD0iMTIiIGhlaWdodD0iMTAiIHJ4PSIzIiBmaWxsPSIjZmZmZDQxIi8+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxNCIgcj0iNiIgZmlsbD0iI2ZmZDNiaSIvPgogIDxjaXJjbGUgY3g9IjE0IiBjeT0iMTMiIHI9IjEiIGZpbGw9IiMzMzMiLz4KICA8Y2lyY2xlIGN4PSIxOCIgY3k9IjEzIiByPSIxIiBmaWxsPSIjMzMzIi8+Cjwvc3ZnPg=='
        );

        // ------------------------------------------------------------
        // Items
        // ------------------------------------------------------------

        this.load.image(
            'item_bottle',
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+CiAgPHJlY3QgeD0iMTEiIHk9IjgiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxOCIgcng9IjIiIGZpbGw9IiNmZmYiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHJlY3QgeD0iMTMiIHk9IjQiIHdpZHRoPSI2IiBoZWlnaHQ9IjQiIHJ4PSIxIiBmaWxsPSIjZmY5OTk5Ii8+Cjwvc3ZnPg=='
        );

        this.load.image(
            'item_seeds',
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+CiAgPHJlY3QgeD0iOCIgeT0iNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjIwIiByeD0iMiIgZmlsbD0iI2QyYjQ4YyIgc3Ryb2tlPSIjOGI0NTEzIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE0IiByPSI0IiBmaWxsPSIjNGNhZjUwIi8+Cjwvc3ZnPg=='
        );

        this.load.image(
            'item_teddy',
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxOCIgcj0iOCIgZmlsbD0iIzhCNTQyQiIvPgogIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTIiIHI9IjYiIGZpbGw9IiM4QjU0MkIiLz4KICA8Y2lyY2xlIGN4PSIxMSIgY3k9IjgiIHI9IjMiIGZpbGw9IiM4QjU0MkIiLz4KICA8Y2lyY2xlIGN4PSIyMSIgY3k9IjgiIHI9IjMiIGZpbGw9IiM4QjU0MkIiLz4KPC9zdmc+'
        );

        // ------------------------------------------------------------
        // NPCs
        // ------------------------------------------------------------

        this.load.image(
            'npc_sam',
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+CiAgPHJlY3QgeD0iOCIgeT0iMTYiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMiIgcng9IjQiIGZpbGw9IiM0NzhhZmYiLz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjZmZjYmUxIi8+Cjwvc3ZnPg=='
        );

        this.load.image(
            'npc_martha',
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+CiAgPHJlY3QgeD0iOCIgeT0iMTYiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMiIgcng9IjQiIGZpbGw9IiNhYTVmZmYiLz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjZmZjYmUxIi8+Cjwvc3ZnPg=='
        );
    }

    create() {
        this.drawGrid();
        this.setupJoystick();

        // ------------------------------------------------------------
        // Houses
        // ------------------------------------------------------------

        MAP_DATA.houses.forEach(house => {
            this.add
                .rectangle(
                    house.exterior.x,
                    house.exterior.y,
                    house.exterior.width,
                    house.exterior.height,
                    0x884422
                )
                .setOrigin(0)
                .setDepth(10);

            this.add
                .rectangle(
                    house.interior.x,
                    house.interior.y,
                    house.interior.width,
                    house.interior.height,
                    0x442211
                )
                .setOrigin(0)
                .setDepth(11);

            interactionSystem.registerCandidate({
                id: `bed_${house.id}`,
                type: 'bed',
                x: house.interior.x + 32,
                y: house.interior.y + 32,
                priority: 5,
                canInteract: () => !this.isPlacementMode,
                onInteract: () => {
                    timeSystem.advanceDay();
                    gardeningSystem.updateGrowth();
                    this.cameras.main.flash(500, 0, 0, 0);
                }
            });
        });

        // ------------------------------------------------------------
        // Garden interaction grid
        // ------------------------------------------------------------

        const garden = MAP_DATA.visualZones.garden;

        const gardenStartX = Math.floor(
            garden.x / CONFIG.TILE_SIZE
        );

        const gardenStartY = Math.floor(
            garden.y / CONFIG.TILE_SIZE
        );

        const gardenWidth = Math.floor(
            garden.width / CONFIG.TILE_SIZE
        );

        const gardenHeight = Math.floor(
            garden.height / CONFIG.TILE_SIZE
        );

        for (
            let gx = gardenStartX;
            gx < gardenStartX + gardenWidth;
            gx++
        ) {
            for (
                let gy = gardenStartY;
                gy < gardenStartY + gardenHeight;
                gy++
            ) {
                const worldX = gx * CONFIG.TILE_SIZE;
                const worldY = gy * CONFIG.TILE_SIZE;

                interactionSystem.registerCandidate({
                    id: `garden_${gx}_${gy}`,
                    type: 'garden',
                    x: worldX + CONFIG.TILE_SIZE / 2,
                    y: worldY + CONFIG.TILE_SIZE / 2,
                    priority: 2,
                    canInteract: () => !this.isPlacementMode,
                    onInteract: () => {
                        gardeningSystem.interact(gx, gy);
                    }
                });
            }
        }

        // ------------------------------------------------------------
        // Roof graphics
        // ------------------------------------------------------------

        this.roofGraphics = this.add
            .graphics()
            .setDepth(100);

        // ------------------------------------------------------------
        // Player
        // ------------------------------------------------------------

        this.player = this.physics.add
            .sprite(
                gameState.player.x,
                gameState.player.y,
                'player'
            )
            .setDepth(gameState.player.y);

        this.player.setCollideWorldBounds(true);

        // ------------------------------------------------------------
        // Keyboard
        // ------------------------------------------------------------

        this.cursors =
            this.input.keyboard!.createCursorKeys();

        this.wasd =
            this.input.keyboard!.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }) as {
                up: Phaser.Input.Keyboard.Key;
                down: Phaser.Input.Keyboard.Key;
                left: Phaser.Input.Keyboard.Key;
                right: Phaser.Input.Keyboard.Key;
            };

        this.interactKey =
            this.input.keyboard!.addKey(
                Phaser.Input.Keyboard.KeyCodes.E
            );

        this.placementKey =
            this.input.keyboard!.addKey(
                Phaser.Input.Keyboard.KeyCodes.P
            );

        // ------------------------------------------------------------
        // Placement preview
        // ------------------------------------------------------------

        this.previewGraphics = this.add
            .graphics()
            .setDepth(50);

        // ------------------------------------------------------------
        // Initial world sync
        // ------------------------------------------------------------

        this.syncWorldItems();
        this.syncBabies(true);
        this.syncNPCs(true);
        this.syncPlacedObjects();

        // ------------------------------------------------------------
        // Shop bridge
        // ------------------------------------------------------------

        (window as any).buyShopItem = (
            shopId: string,
            itemId: string
        ) => {
            if (shopSystem.buyItem(shopId, itemId)) {
                this.updateHud();
                this.updateShopUI('village_general_store');
            }
        };

        // ------------------------------------------------------------
        // Camera + physics bounds
        // ------------------------------------------------------------

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.5);

        this.cameras.main.setBounds(
            0,
            0,
            MAP_DATA.worldWidth,
            MAP_DATA.worldHeight
        );

        this.physics.world.setBounds(
            0,
            0,
            MAP_DATA.worldWidth,
            MAP_DATA.worldHeight
        );

        // ------------------------------------------------------------
        // HUD
        // ------------------------------------------------------------

        this.debugText = this.add
            .text(
                10,
                10,
                '',
                {
                    color: '#ffffff',
                    backgroundColor: '#000000',
                    padding: {
                        x: 6,
                        y: 4
                    }
                }
            )
            .setScrollFactor(0)
            .setDepth(200);

        this.interactPrompt = this.add
            .text(
                400,
                500,
                '',
                {
                    color: '#ffff00',
                    backgroundColor: '#000000',
                    padding: {
                        x: 10,
                        y: 5
                    }
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(200)
            .setVisible(false);

        this.interactPrompt.setInteractive();

        this.interactPrompt.on(
            'pointerdown',
            () => {
                interactionSystem.interact();
            }
        );

        this.inventoryHud = this.add
            .text(
                400,
                570,
                '',
                {
                    color: '#ffffff',
                    backgroundColor: '#333333',
                    padding: {
                        x: 10,
                        y: 5
                    }
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(200);

        // ------------------------------------------------------------
        // Load save
        // ------------------------------------------------------------

        if (saveSystem.load()) {
            this.player.setPosition(
                gameState.player.x,
                gameState.player.y
            );

            this.syncBabies(true);
            this.syncPlacedObjects();
            this.syncWorldItems(true);
            this.syncNPCs(true);
        }

        // ------------------------------------------------------------
        // Quests
        // ------------------------------------------------------------

        questSystem.startQuest(
            'intro_find_bottle'
        );

        questSystem.startQuest(
            'intro_talk_martha'
        );

        questSystem.startQuest(
            'verification_quest'
        );

        questSystem
            .getActiveQuests()
            .forEach(q => {
                if (questSystem.checkConditions(q.id)) {
                    questSystem.completeQuest(q.id);
                }
            });

        // ------------------------------------------------------------
        // Save when closing
        // ------------------------------------------------------------

        window.addEventListener(
            'beforeunload',
            () => {
                saveSystem.save();
            }
        );
    }

    // ================================================================
    // JOYSTICK
    // ================================================================

    private setupJoystick() {
        this.joystickEl =
            document.getElementById('joystick');

        this.stickEl =
            document.getElementById('stick');

        if (!this.joystickEl || !this.stickEl) {
            return;
        }

        document.body.addEventListener(
            'pointerdown',
            (event: PointerEvent) => {
                if (this.joyPointer !== null) {
                    return;
                }

                const target =
                    event.target as HTMLElement;

                if (
                    target.closest(
                        'button, input, #shop-box, #dialogue-box, #rename-modal'
                    )
                ) {
                    return;
                }

                this.joyPointer = event.pointerId;

                this.joystickEl!.style.display =
                    'block';

                this.joystickEl!.style.left =
                    `${event.clientX - 67}px`;

                this.joystickEl!.style.top =
                    `${event.clientY - 67}px`;

                document.body.setPointerCapture(
                    event.pointerId
                );

                this.handleJoystickMove(event);
            }
        );

        document.body.addEventListener(
            'pointermove',
            (event: PointerEvent) => {
                if (
                    event.pointerId ===
                    this.joyPointer
                ) {
                    this.handleJoystickMove(
                        event
                    );
                }
            }
        );

        const resetJoystick = () => {
            this.joyPointer = null;

            this.joystickInput = {
                x: 0,
                y: 0
            };

            if (this.stickEl) {
                this.stickEl.style.transform =
                    'translate(0px, 0px)';
            }

            if (this.joystickEl) {
                this.joystickEl.style.display =
                    'none';
            }
        };

        document.body.addEventListener(
            'pointerup',
            resetJoystick
        );

        document.body.addEventListener(
            'pointercancel',
            resetJoystick
        );
    }

    private handleJoystickMove(
        event: PointerEvent
    ) {
        if (
            !this.joystickEl ||
            !this.stickEl
        ) {
            return;
        }

        const rect =
            this.joystickEl.getBoundingClientRect();

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        let dx =
            event.clientX - centerX;

        let dy =
            event.clientY - centerY;

        const max =
            rect.width * 0.35;

        const length =
            Math.hypot(dx, dy);

        if (length > max) {
            dx =
                (dx / length) * max;

            dy =
                (dy / length) * max;
        }

        this.joystickInput.x =
            dx / max;

        this.joystickInput.y =
            dy / max;

        this.stickEl.style.transform =
            `translate(${dx}px, ${dy}px)`;
    }

    // ================================================================
    // MAP
    // ================================================================

    private drawGrid() {
        this.terrainGraphics = this.add
            .graphics()
            .setDepth(-10);

        const g = this.terrainGraphics;

        // ------------------------------------------------------------
        // Base grass
        // ------------------------------------------------------------

        g.fillStyle(
            0x6aaa4b,
            1
        );

        g.fillRect(
            0,
            0,
            MAP_DATA.worldWidth,
            MAP_DATA.worldHeight
        );

        // ------------------------------------------------------------
        // Village
        // ------------------------------------------------------------

        g.fillStyle(
            0xc9ad78,
            1
        );

        g.fillRect(
            0,
            3072,
            2048,
            1024
        );

        // ------------------------------------------------------------
        // Forest
        // ------------------------------------------------------------

        for (
            const forest of MAP_DATA.visualZones.forest
        ) {
            g.fillStyle(
                0x3d7b3d,
                1
            );

            g.fillRect(
                forest.x,
                forest.y,
                forest.width,
                forest.height
            );
        }

        // ------------------------------------------------------------
        // Forest trail
        // ------------------------------------------------------------

        const trail =
            MAP_DATA.visualZones.trail;

        g.fillStyle(
            0xb99a68,
            1
        );

        g.fillRect(
            trail.x,
            trail.y,
            trail.width,
            trail.height
        );

        // Horizontal connection.
        g.fillRect(
            768,
            2920,
            1280,
            128
        );

        // Lake approach.
        g.fillRect(
            896,
            896,
            1152,
            128
        );

        // ------------------------------------------------------------
        // Mountain range
        // ------------------------------------------------------------

        const mountains =
            MAP_DATA.visualZones.mountains;

        g.fillStyle(
            0x707070,
            1
        );

        g.fillRect(
            mountains.x,
            mountains.y,
            mountains.width,
            mountains.height
        );

        // Mountain peaks.
        g.fillStyle(
            0x969696,
            1
        );

        for (
            let x = mountains.x;
            x < mountains.x + mountains.width;
            x += 96
        ) {
            g.fillTriangle(
                x,
                640,
                x + 48,
                180,
                x + 96,
                640
            );
        }

        // Snow/stone highlights.
        g.fillStyle(
            0xd8d8d8,
            0.65
        );

        for (
            let x = mountains.x + 18;
            x < mountains.x + mountains.width;
            x += 96
        ) {
            g.fillTriangle(
                x,
                360,
                x + 48,
                230,
                x + 70,
                360
            );
        }

        // ------------------------------------------------------------
        // Crystal Lake
        // ------------------------------------------------------------

        const lake =
            MAP_DATA.visualZones.lake;

        g.fillStyle(
            0x4faecb,
            1
        );

        g.fillEllipse(
            lake.x + lake.width / 2,
            lake.y + lake.height / 2,
            960,
            820
        );

        // Shore highlight.
        g.lineStyle(
            12,
            0x87d4df,
            0.8
        );

        g.strokeEllipse(
            lake.x + lake.width / 2,
            lake.y + lake.height / 2,
            960,
            820
        );

        // Water reflections.
        g.fillStyle(
            0xb1e5ec,
            0.55
        );

        g.fillEllipse(
            lake.x + 400,
            lake.y + 320,
            280,
            70
        );

        g.fillEllipse(
            lake.x + 600,
            lake.y + 520,
            240,
            60
        );

        g.fillEllipse(
            lake.x + 310,
            lake.y + 620,
            170,
            45
        );

        // ------------------------------------------------------------
        // Village roads
        // ------------------------------------------------------------

        g.fillStyle(
            0x9b7b52,
            1
        );

        g.fillRect(
            0,
            3170,
            2048,
            120
        );

        g.fillRect(
            620,
            3072,
            120,
            1024
        );

        // ------------------------------------------------------------
        // Garden
        // ------------------------------------------------------------

        this.drawGardenArea();

        // ------------------------------------------------------------
        // Trees
        // ------------------------------------------------------------

        this.drawTrees();

        // ------------------------------------------------------------
        // Future expansion
        // ------------------------------------------------------------

        this.drawFutureExpansion();
    }

    private drawGardenArea() {
        const garden =
            MAP_DATA.visualZones.garden;

        const padding = 24;

        const g = this.add
            .graphics()
            .setDepth(-5);

        // Brown soil.
        g.fillStyle(
            0x795548,
            1
        );

        g.fillRect(
            garden.x,
            garden.y,
            garden.width,
            garden.height
        );

        // Dark furrows.
        g.lineStyle(
            2,
            0x5d4037,
            0.9
        );

        for (
            let y = garden.y + 24;
            y < garden.y + garden.height;
            y += 24
        ) {
            g.moveTo(
                garden.x + 8,
                y
            );

            g.lineTo(
                garden.x + garden.width - 8,
                y
            );
        }

        g.strokePath();

        // Fence rails.
        g.lineStyle(
            8,
            0x6d4c41,
            1
        );

        g.strokeRect(
            garden.x - padding,
            garden.y - padding,
            garden.width + padding * 2,
            garden.height + padding * 2
        );

        // Fence posts.
        g.fillStyle(
            0x8d6e63,
            1
        );

        for (
            let x =
                garden.x - padding;
            x <=
            garden.x +
                garden.width +
                padding;
            x += 32
        ) {
            g.fillRect(
                x - 4,
                garden.y - padding - 8,
                8,
                24
            );

            g.fillRect(
                x - 4,
                garden.y +
                    garden.height +
                    padding -
                    16,
                8,
                24
            );
        }

        for (
            let y =
                garden.y - padding;
            y <=
            garden.y +
                garden.height +
                padding;
            y += 32
        ) {
            g.fillRect(
                garden.x - padding - 8,
                y - 4,
                24,
                8
            );

            g.fillRect(
                garden.x +
                    garden.width +
                    padding -
                    16,
                y - 4,
                24,
                8
            );
        }
    }

    private drawTrees() {
        this.treeSprites.forEach(
            tree => tree.destroy()
        );

        this.treeSprites = [];

        const positions: Array<
            [number, number]
        > = [
            // North forest.
            [140, 880],
            [260, 820],
            [380, 940],
            [520, 860],
            [680, 920],

            [180, 1120],
            [340, 1240],
            [580, 1160],
            [720, 1320],

            // Middle forest.
            [120, 1580],
            [280, 1710],
            [440, 1600],
            [620, 1810],
            [760, 1680],

            [160, 2020],
            [360, 2140],
            [540, 1980],
            [700, 2260],

            // South forest.
            [120, 2500],
            [300, 2660],
            [480, 2520],
            [660, 2780],
            [760, 2920]
        ];

        for (
            const [x, y] of positions
        ) {
            const tree =
                this.add.graphics();

            tree.setPosition(
                x,
                y
            );

            // Trunk.
            tree.fillStyle(
                0x6d4c41,
                1
            );

            tree.fillRect(
                -8,
                8,
                16,
                48
            );

            // Large canopy.
            tree.fillStyle(
                0x245d2b,
                1
            );

            tree.fillCircle(
                0,
                -8,
                40
            );

            tree.fillStyle(
                0x2f7b35,
                1
            );

            tree.fillCircle(
                -18,
                -2,
                26
            );

            tree.fillCircle(
                18,
                0,
                28
            );

            tree.setData(
                'isOccludingTree',
                true
            );

            tree.setDepth(
                y + 55
            );

            this.treeSprites.push(
                tree
            );
        }
    }

    private drawFutureExpansion() {
        const zone =
            MAP_DATA.visualZones.futureExpansion;

        const g = this.add
            .graphics()
            .setDepth(80);

        // Dark blocked territory.
        g.fillStyle(
            0x263238,
            0.82
        );

        g.fillRect(
            zone.x,
            zone.y,
            zone.width,
            zone.height
        );

        // Diagonal barrier pattern.
        g.lineStyle(
            6,
            0x8d6e63,
            0.95
        );

        for (
            let y = 0;
            y < MAP_DATA.worldHeight;
            y += 64
        ) {
            g.moveTo(
                zone.x,
                y
            );

            g.lineTo(
                zone.x + zone.width,
                y + 24
            );
        }

        g.strokePath();

        // Label.
        g.fillStyle(
            0xffffff,
            0.92
        );

        g.fillRect(
            zone.x + 100,
            1900,
            760,
            78
        );

        this.add
            .text(
                zone.x + 130,
                1924,
                'AREA RESERVED FOR FUTURE EXPANSION',
                {
                    fontSize: '18px',
                    color: '#263238',
                    fontStyle: 'bold'
                }
            )
            .setDepth(81);
    }

    // ================================================================
    // UPDATE
    // ================================================================

    update(
        _time: number,
        delta: number
    ) {
        // Autosave.
        this.autosaveTimer += delta;

        if (
            this.autosaveTimer >= 10000
        ) {
            saveSystem.save();
            this.autosaveTimer = 0;
        }

        // Placement mode.
        if (
            Phaser.Input.Keyboard.JustDown(
                this.placementKey
            )
        ) {
            this.isPlacementMode =
                !this.isPlacementMode;

            if (this.isPlacementMode) {
                this.placementSystem.startPlacement(
                    'crib',
                    2,
                    2
                );
            }
        }

        if (this.isPlacementMode) {
            this.updatePlacement();
        } else {
            this.updateGameplay(delta);
        }

        this.updateInteriors();
        this.updateGardening();
        this.updateDialogue();
        this.updateHud();
        this.updateDebugText();
        this.syncSprites();
        this.updateTreeOcclusion();

        babyBehaviorSystem.update(
            delta / 1000
        );
    }

    // ================================================================
    // TREE OCCLUSION / DEPTH
    // ================================================================

    private updateTreeOcclusion() {
        // Actor depth.
        if (this.player) {
            this.player.setDepth(
                this.player.y
            );
        }

        for (
            const baby of Object.values(
                this.babySprites
            )
        ) {
            baby.setDepth(
                baby.y
            );
        }

        for (
            const npc of Object.values(
                this.npcSprites
            )
        ) {
            npc.setDepth(
                npc.y
            );
        }

        // Trees get a depth offset so their canopy covers
        // actors positioned behind them.
        for (
            const tree of this.treeSprites
        ) {
            tree.setDepth(
                tree.y + 55
            );
        }

        // Nametags stay just above their actors.
        Object.values(
            this.nameTags
        ).forEach(tag => {
            if (tag.scrollFactorX !== 0) {
                tag.setDepth(
                    tag.y + 1
                );
            }
        });
    }

    // ================================================================
    // DIALOGUE
    // ================================================================

    private updateDialogue() {
        const dialogueBox =
            document.getElementById(
                'dialogue-box'
            );

        const speakerEl =
            document.getElementById(
                'dialogue-speaker'
            );

        const textEl =
            document.getElementById(
                'dialogue-text'
            );

        if (
            dialogueSystem.isActive()
        ) {
            const line =
                dialogueSystem.getCurrentLine();

            if (
                dialogueBox &&
                speakerEl &&
                textEl &&
                line
            ) {
                dialogueBox.style.display =
                    'block';

                speakerEl.innerText =
                    line.speaker;

                textEl.innerText =
                    line.text;
            }

            if (
                Phaser.Input.Keyboard.JustDown(
                    this.interactKey
                )
            ) {
                const endedSpeaker =
                    line?.speaker;

                if (
                    !dialogueSystem.nextLine()
                ) {
                    if (
                        endedSpeaker ===
                        'Shopkeeper Sam'
                    ) {
                        this.updateShopUI(
                            'village_general_store'
                        );

                        const shopBox =
                            document.getElementById(
                                'shop-box'
                            );

                        if (shopBox) {
                            shopBox.style.display =
                                'block';
                        }
                    }
                }
            }
        } else {
            if (dialogueBox) {
                dialogueBox.style.display =
                    'none';
            }
        }
    }

    // ================================================================
    // SHOP
    // ================================================================

    private updateShopUI(
        shopId: string
    ) {
        const shop =
            SHOPS[shopId];

        const container =
            document.getElementById(
                'shop-items'
            );

        const currencyEl =
            document.getElementById(
                'shop-currency'
            );

        if (
            !shop ||
            !container ||
            !currencyEl
        ) {
            return;
        }

        currencyEl.innerText =
            `Buttons: ${gameState.buttons}`;

        container.innerHTML = '';

        shop.items.forEach(
            (item: any) => {
                const def =
                    ITEMS[item.itemId];

                const div =
                    document.createElement(
                        'div'
                    );

                div.style.display =
                    'flex';

                div.style.justifyContent =
                    'space-between';

                div.style.alignItems =
                    'center';

                div.style.padding =
                    '10px';

                div.style.borderBottom =
                    '1px solid #333';

                div.innerHTML = `
                    <span>
                        ${
                            def?.name ||
                            item.itemId
                        }
                        (${item.price} Buttons)
                    </span>
                    <button
                        onclick="window.buyShopItem('${shopId}', '${item.itemId}')"
                        style="padding:3px 10px;cursor:pointer;"
                    >
                        Buy
                    </button>
                `;

                container.appendChild(
                    div
                );
            }
        );
    }

    // ================================================================
    // GAMEPLAY
    // ================================================================

    private updateGameplay(
        delta: number
    ) {
        this.previewGraphics.clear();

        let vx = 0;
        let vy = 0;

        const isInputFocused =
            document.activeElement instanceof
            HTMLInputElement;

        if (!isInputFocused) {
            vx =
                this.joystickInput.x;

            vy =
                this.joystickInput.y;

            if (
                this.cursors.left.isDown ||
                this.wasd.left.isDown
            ) {
                vx -= 1;
            }

            if (
                this.cursors.right.isDown ||
                this.wasd.right.isDown
            ) {
                vx += 1;
            }

            if (
                this.cursors.up.isDown ||
                this.wasd.up.isDown
            ) {
                vy -= 1;
            }

            if (
                this.cursors.down.isDown ||
                this.wasd.down.isDown
            ) {
                vy += 1;
            }
        }

        // Save previous position so blocked terrain can reject movement.
        const previousX =
            gameState.player.x;

        const previousY =
            gameState.player.y;

        playerSystem.move(
            vx,
            vy,
            delta / 1000
        );

        // Prevent walking through mountains/lake/reserved zones.
        if (
            !this.grid.isWalkable(
                gameState.player.x,
                gameState.player.y
            )
        ) {
            gameState.player.x =
                previousX;

            gameState.player.y =
                previousY;
        }

        this.player.setPosition(
            gameState.player.x,
            gameState.player.y
        );

        const target =
            interactionSystem.update(
                this.player.x,
                this.player.y
            );

        this.interactPrompt.setVisible(
            target !== null
        );

        if (target) {
            let label =
                'Interact';

            if (
                target.type === 'baby'
            ) {
                label =
                    'Grab Lost Baby';
            }

            else if (
                target.type === 'care'
            ) {
                const babyId =
                    target.id.replace(
                        'care_',
                        ''
                    );

                const baby =
                    gameState.babies[
                        babyId
                    ];

                if (
                    baby.state ===
                        'Nursery' &&
                    baby.needs.hunger < 30
                ) {
                    label =
                        `Grab ${
                            baby.name ||
                            'Baby'
                        } to train`;
                } else {
                    label =
                        `Care for ${
                            baby.name ||
                            'Baby'
                        } (${
                            baby.needs.state
                        })`;
                }
            }

            else if (
                target.type ===
                'rename'
            ) {
                const babyId =
                    target.id.replace(
                        'rename_',
                        ''
                    );

                label =
                    `Rename ${
                        gameState.babies[
                            babyId
                        ].name ||
                        'Baby'
                    }`;
            }

            else if (
                target.type ===
                'npc'
            ) {
                const npcName =
                    target.id
                        .split('_')
                        .map(word =>
                            word.charAt(0)
                                .toUpperCase() +
                            word.slice(1)
                        )
                        .join(' ');

                label =
                    `Talk to ${npcName}`;
            }

            else if (
                target.type ===
                'item'
            ) {
                const worldItem =
                    gameState.worldItems.find(
                        item =>
                            item.id ===
                            target.id
                    );

                if (worldItem) {
                    const def =
                        ITEMS[
                            worldItem.itemId
                        ];

                    label =
                        `Pick up ${
                            def?.name ||
                            worldItem.itemId
                        }`;
                }
            }

            else if (
                target.type ===
                'bed'
            ) {
                label =
                    'Sleep (Next Day)';
            }

            else if (
                target.type ===
                'garden'
            ) {
                const parts =
                    target.id.split('_');

                const gx =
                    parseInt(parts[1]);

                const gy =
                    parseInt(parts[2]);

                const tile =
                    gardeningSystem
                        .getOrCreateTile(
                            gx,
                            gy
                        );

                label =
                    `Garden: ${tile.stage}`;
            }

            else if (
                target.type ===
                'workshop'
            ) {
                label =
                    'Open Workshop (Craft)';
            }

            else if (
                target.type ===
                'storage'
            ) {
                label =
                    'Open Storage (Transfer)';
            }

            else if (
                target.type ===
                'nursery'
            ) {
                const babyId =
                    gameState
                        .followerIds[0];

                if (babyId) {
                    label =
                        `Put ${
                            gameState.babies[
                                babyId
                            ].name ||
                            'Baby'
                        } in Crib`;
                }
            }

            this.interactPrompt.setText(
                `Press E to ${label}`
            );

            if (
                Phaser.Input.Keyboard.JustDown(
                    this.interactKey
                )
            ) {
                interactionSystem.interact();
            }
        }

        followerSystem.updatePositions(
            this.player.x,
            this.player.y
        );
    }

    // ================================================================
    // PLACEMENT
    // ================================================================

    private updatePlacement() {
        this.player.setVelocity(
            0
        );

        this.placementSystem.updatePreview(
            this.player.x,
            this.player.y
        );

        const preview =
            this.placementSystem.getPreview();

        this.previewGraphics.clear();

        if (preview) {
            this.previewGraphics.lineStyle(
                2,
                preview.valid
                    ? 0x00ff00
                    : 0xff0000,
                0.8
            );

            this.previewGraphics.strokeRect(
                preview.x,
                preview.y,
                preview.width *
                    CONFIG.TILE_SIZE,
                preview.height *
                    CONFIG.TILE_SIZE
            );
        }

        if (
            Phaser.Input.Keyboard.JustDown(
                this.interactKey
            )
        ) {
            const committed =
                this.placementSystem.commit();

            if (!committed) {
                return;
            }

            this.syncPlacedObjects();

            this.isPlacementMode =
                false;

            if (
                committed.type ===
                    'crib' &&
                gameState
                    .followerIds.length >
                    0
            ) {
                const babyId =
                    gameState
                        .followerIds[0];

                nurserySystem.registerBaby(
                    babyId,
                    committed.id
                );

                const baby =
                    gameState.babies[
                        babyId
                    ];

                baby.x =
                    committed.gridX *
                        CONFIG.TILE_SIZE +
                    committed.width *
                        CONFIG.TILE_SIZE /
                        2;

                baby.y =
                    committed.gridY *
                        CONFIG.TILE_SIZE +
                    committed.height *
                        CONFIG.TILE_SIZE /
                        2;
            }
        }
    }

    // ================================================================
    // HOUSE ROOFS
    // ================================================================

    private updateInteriors() {
        this.roofGraphics.clear();

        MAP_DATA.houses.forEach(
            house => {
                const interior =
                    new Phaser.Geom.Rectangle(
                        house.interior.x,
                        house.interior.y,
                        house.interior.width,
                        house.interior.height
                    );

                const isInside =
                    Phaser.Geom.Rectangle.Contains(
                        interior,
                        this.player.x,
                        this.player.y
                    );

                if (!isInside) {
                    this.roofGraphics.fillStyle(
                        0x663311,
                        1
                    );

                    this.roofGraphics.fillRect(
                        house.exterior.x,
                        house.exterior.y,
                        house.exterior.width,
                        house.exterior.height
                    );
                }
            }
        );
    }

    // ================================================================
    // GARDEN STATE
    // ================================================================

    private updateGardening() {
        Object.values(
            gameState.gardenTiles
        ).forEach(tile => {
            const key =
                `${tile.gridX},${tile.gridY}`;

            if (
                !this.gardenSprites[key]
            ) {
                this.gardenSprites[key] =
                    this.add
                        .text(
                            tile.gridX *
                                CONFIG.TILE_SIZE,
                            tile.gridY *
                                CONFIG.TILE_SIZE,
                            '',
                            {
                                fontSize:
                                    '10px',
                                color:
                                    '#ffffff',
                                backgroundColor:
                                    '#00000088',
                                padding: {
                                    x: 2,
                                    y: 1
                                }
                            }
                        )
                        .setDepth(
                            tile.gridY *
                                CONFIG.TILE_SIZE +
                                2
                        );
            }

            this.gardenSprites[key].setText(
                tile.stage === 'Empty'
                    ? ''
                    : tile.stage
            );
        });
    }

    // ================================================================
    // BABIES
    // ================================================================

    private syncBabies(
        full = false
    ) {
        if (full) {
            Object.values(
                this.babySprites
            ).forEach(
                sprite => sprite.destroy()
            );

            Object.values(
                this.nameTags
            ).forEach(tag => {
                if (
                    tag.name.startsWith(
                        'baby_'
                    )
                ) {
                    tag.destroy();
                }
            });

            this.babySprites = {};
        }

        Object.values(
            gameState.babies
        ).forEach(baby => {
            if (
                !this.babySprites[
                    baby.id
                ]
            ) {
                const sprite =
                    this.add
                        .sprite(
                            baby.x,
                            baby.y,
                            'baby'
                        )
                        .setDepth(
                            baby.y
                        );

                this.babySprites[
                    baby.id
                ] = sprite;

                const tag =
                    this.add
                        .text(
                            baby.x,
                            baby.y - 20,
                            baby.name,
                            {
                                fontSize:
                                    '12px',
                                backgroundColor:
                                    '#ffffffaa',
                                color:
                                    '#000000',
                                padding: {
                                    x: 4,
                                    y: 2
                                }
                            }
                        )
                        .setOrigin(0.5)
                        .setDepth(
                            baby.y + 1
                        );

                tag.name =
                    `baby_${baby.id}`;

                this.nameTags[
                    baby.id
                ] = tag;
            }
        });
    }

    // ================================================================
    // NPCS
    // ================================================================

    private syncNPCs(
        full = false
    ) {
        if (full) {
            Object.values(
                this.npcSprites
            ).forEach(
                sprite => sprite.destroy()
            );

            Object.values(
                this.nameTags
            ).forEach(tag => {
                if (
                    tag.name.startsWith(
                        'npc_'
                    )
                ) {
                    tag.destroy();
                }
            });

            this.npcSprites = {};
        }

        Object.values(
            gameState.npcs
        ).forEach(npc => {
            if (
                !this.npcSprites[
                    npc.id
                ]
            ) {
                const spriteKey =
                    `npc_${
                        npc.id.split('_')[1]
                    }`;

                this.npcSprites[
                    npc.id
                ] =
                    this.add
                        .sprite(
                            npc.x,
                            npc.y,
                            spriteKey
                        )
                        .setDepth(
                            npc.y
                        );

                const name =
                    npc.id
                        .split('_')
                        .map(word =>
                            word.charAt(0)
                                .toUpperCase() +
                            word.slice(1)
                        )
                        .join(' ');

                const tag =
                    this.add
                        .text(
                            npc.x,
                            npc.y - 25,
                            name,
                            {
                                fontSize:
                                    '12px',
                                backgroundColor:
                                    '#ffeb3baa',
                                color:
                                    '#000000',
                                padding: {
                                    x: 4,
                                    y: 2
                                }
                            }
                        )
                        .setOrigin(0.5)
                        .setDepth(
                            npc.y + 1
                        );

                tag.name =
                    `npc_${npc.id}`;

                this.nameTags[
                    npc.id
                ] = tag;

                interactionSystem.registerCandidate({
                    id: npc.id,
                    type: 'npc',
                    x: npc.x,
                    y: npc.y,
                    priority: 20,
                    canInteract: () =>
                        !this.isPlacementMode &&
                        !dialogueSystem.isActive(),
                    onInteract: () => {
                        if (
                            npc.id ===
                            'shopkeeper_sam'
                        ) {
                            dialogueSystem.startDialogue(
                                'sam_greet'
                            );
                        } else {
                            dialogueSystem.startDialogue(
                                'martha_greet'
                            );
                        }

                        questSystem
                            .getActiveQuests()
                            .forEach(q => {
                                if (
                                    q.conditions.some(
                                        condition =>
                                            condition.type ===
                                                'talk_to_npc' &&
                                            condition.targetId ===
                                                npc.id
                                    )
                                ) {
                                    questSystem.completeQuest(
                                        q.id
                                    );
                                }
                            });
                    }
                });
            }
        });
    }

    // ================================================================
    // WORLD ITEMS
    // ================================================================

    private syncWorldItems(
        full = false
    ) {
        if (full) {
            Object.values(
                this.worldItemSprites
            ).forEach(
                sprite => sprite.destroy()
            );

            this.worldItemSprites = {};
        }

        gameState.worldItems.forEach(
            item => {
                if (
                    !this.worldItemSprites[
                        item.id
                    ]
                ) {
                    const def =
                        ITEMS[
                            item.itemId
                        ];

                    const sprite =
                        this.add
                            .sprite(
                                item.x,
                                item.y,
                                def
                                    ? def.spriteKey
                                    : 'item_bottle'
                            )
                            .setDepth(
                                item.y
                            );

                    this.worldItemSprites[
                        item.id
                    ] = sprite;

                    interactionSystem.registerCandidate({
                        id: item.id,
                        type: 'item',
                        x: item.x,
                        y: item.y,
                        priority: 20,
                        canInteract: () =>
                            true,
                        onInteract: () =>
                            this.pickUpItem(
                                item
                            )
                    });
                }
            }
        );
    }

    private pickUpItem(
        item: WorldItemData
    ) {
        if (
            !inventorySystem.addItem(
                item.itemId
            )
        ) {
            return;
        }

        const index =
            gameState.worldItems.findIndex(
                worldItem =>
                    worldItem.id ===
                    item.id
            );

        if (index !== -1) {
            gameState.worldItems.splice(
                index,
                1
            );
        }

        interactionSystem
            .unregisterCandidate(
                item.id
            );

        const sprite =
            this.worldItemSprites[
                item.id
            ];

        if (sprite) {
            sprite.destroy();

            delete this.worldItemSprites[
                item.id
            ];
        }

        questSystem
            .getActiveQuests()
            .forEach(q => {
                if (
                    q.conditions.some(
                        condition =>
                            condition.type ===
                                'find_item' &&
                            condition.targetId ===
                                item.itemId
                    )
                ) {
                    questSystem.completeQuest(
                        q.id
                    );
                }
            });
    }

    // ================================================================
    // PLACED OBJECTS
    // ================================================================

    private syncPlacedObjects() {
        Object.values(
            this.placedObjectSprites
        ).forEach(sprite => {
            const id =
                sprite.name;

            sprite.destroy();

            interactionSystem
                .unregisterCandidate(id);
        });

        this.placedObjectSprites = {};

        gameState.placedObjects.forEach(
            object => {
                const rect =
                    this.add
                        .rectangle(
                            object.gridX *
                                CONFIG.TILE_SIZE,
                            object.gridY *
                                CONFIG.TILE_SIZE,
                            object.width *
                                CONFIG.TILE_SIZE,
                            object.height *
                                CONFIG.TILE_SIZE,
                            0xaaaaaa
                        )
                        .setOrigin(0)
                        .setDepth(
                            object.gridY *
                                CONFIG.TILE_SIZE
                        );

                rect.name =
                    object.id;

                this.placedObjectSprites[
                    object.id
                ] = rect;

                if (
                    object.type ===
                    'workshop_bench'
                ) {
                    interactionSystem.registerCandidate({
                        id: object.id,
                        type: 'workshop',
                        x:
                            object.gridX *
                                CONFIG.TILE_SIZE +
                            object.width *
                                CONFIG.TILE_SIZE /
                                2,
                        y:
                            object.gridY *
                                CONFIG.TILE_SIZE +
                            object.height *
                                CONFIG.TILE_SIZE /
                                2,
                        priority: 5,
                        canInteract: () =>
                            !this.isPlacementMode,
                        onInteract: () => {
                            const recipes =
                                craftingSystem.getAvailableRecipes();

                            for (
                                const recipe of recipes
                            ) {
                                if (
                                    craftingSystem.craft(
                                        recipe.id
                                    )
                                ) {
                                    break;
                                }
                            }
                        }
                    });
                }

                if (
                    object.type ===
                    'storage_chest'
                ) {
                    interactionSystem.registerCandidate({
                        id: object.id,
                        type: 'storage',
                        x:
                            object.gridX *
                                CONFIG.TILE_SIZE +
                            object.width *
                                CONFIG.TILE_SIZE /
                                2,
                        y:
                            object.gridY *
                                CONFIG.TILE_SIZE +
                            object.height *
                                CONFIG.TILE_SIZE /
                                2,
                        priority: 5,
                        canInteract: () =>
                            !this.isPlacementMode,
                        onInteract: () => {
                            const seedCount =
                                inventorySystem.getQuantity(
                                    'seed_packet'
                                );

                            if (
                                seedCount > 0
                            ) {
                                storageSystem.deposit(
                                    object.id,
                                    'seed_packet',
                                    seedCount
                                );
                            } else {
                                const stored =
                                    storageSystem.getStorageInventory(
                                        object.id
                                    );

                                if (
                                    stored.length >
                                    0
                                ) {
                                    storageSystem.withdraw(
                                        object.id,
                                        stored[0]
                                            .itemId,
                                        stored[0]
                                            .quantity
                                    );
                                }
                            }
                        }
                    });
                }

                if (
                    object.type.startsWith(
                        'playground_'
                    )
                ) {
                    interactionSystem.registerCandidate({
                        id: object.id,
                        type: 'playground',
                        x:
                            object.gridX *
                                CONFIG.TILE_SIZE +
                            object.width *
                                CONFIG.TILE_SIZE /
                                2,
                        y:
                            object.gridY *
                                CONFIG.TILE_SIZE +
                            object.height *
                                CONFIG.TILE_SIZE /
                                2,
                        priority: 5,
                        canInteract: () =>
                            !this.isPlacementMode,
                        onInteract: () => {
                            if (
                                gameState.followerIds
                                    .length ===
                                0
                            ) {
                                return;
                            }

                            const babyId =
                                gameState.followerIds[0];

                            followerSystem.release(
                                babyId
                            );

                            babyBehaviorSystem.setPlaying(
                                babyId
                            );

                            const baby =
                                gameState.babies[
                                    babyId
                                ];

                            baby.x =
                                object.gridX *
                                    CONFIG.TILE_SIZE +
                                object.width *
                                    CONFIG.TILE_SIZE /
                                    2;

                            baby.y =
                                object.gridY *
                                    CONFIG.TILE_SIZE +
                                object.height *
                                    CONFIG.TILE_SIZE /
                                    2;
                        }
                    });
                }

                if (
                    object.type ===
                    'crib'
                ) {
                    interactionSystem.registerCandidate({
                        id: object.id,
                        type: 'nursery',
                        x:
                            object.gridX *
                                CONFIG.TILE_SIZE +
                            object.width *
                                CONFIG.TILE_SIZE /
                                2,
                        y:
                            object.gridY *
                                CONFIG.TILE_SIZE +
                            object.height *
                                CONFIG.TILE_SIZE /
                                2,
                        priority: 25,
                        canInteract: () => {
                            if (
                                this.isPlacementMode
                            ) {
                                return false;
                            }

                            if (
                                gameState
                                    .followerIds
                                    .length === 0
                            ) {
                                return false;
                            }

                            const occupied =
                                Object.values(
                                    gameState.babies
                                ).some(
                                    baby =>
                                        baby.nurserySlotId ===
                                        object.id
                                );

                            return !occupied;
                        },
                        onInteract: () => {
                            const babyId =
                                gameState
                                    .followerIds[0];

                            if (!babyId) {
                                return;
                            }

                            nurserySystem.registerBaby(
                                babyId,
                                object.id
                            );

                            const baby =
                                gameState.babies[
                                    babyId
                                ];

                            baby.x =
                                object.gridX *
                                    CONFIG.TILE_SIZE +
                                object.width *
                                    CONFIG.TILE_SIZE /
                                    2;

                            baby.y =
                                object.gridY *
                                    CONFIG.TILE_SIZE +
                                object.height *
                                    CONFIG.TILE_SIZE /
                                    2;
                        }
                    });
                }
            }
        );
    }

    // ================================================================
    // SPRITE SYNCHRONIZATION
    // ================================================================

    private syncSprites() {
        Object.values(
            gameState.babies
        ).forEach(baby => {
            const sprite =
                this.babySprites[
                    baby.id
                ];

            const tag =
                this.nameTags[
                    baby.id
                ];

            if (sprite) {
                sprite.x =
                    baby.x;

                sprite.y =
                    baby.y;

                sprite.setDepth(
                    baby.y
                );
            }

            if (tag) {
                tag.x =
                    baby.x;

                tag.y =
                    baby.y - 20;

                tag.setText(
                    baby.name
                );

                tag.setVisible(
                    baby.name !== ''
                );

                tag.setDepth(
                    baby.y + 1
                );
            }

            interactionSystem
                .unregisterCandidate(
                    baby.id
                );

            interactionSystem
                .unregisterCandidate(
                    `care_${baby.id}`
                );

            interactionSystem
                .unregisterCandidate(
                    `rename_${baby.id}`
                );

            interactionSystem.registerCandidate({
                id: baby.id,
                type: 'baby',
                x: baby.x,
                y: baby.y,
                priority: 10,
                canInteract: () =>
                    baby.state ===
                    'Wild',
                onInteract: () => {
                    followerSystem.recruit(
                        baby.id
                    );

                    if (!baby.name) {
                        this.openRenameModal(
                            baby.id
                        );
                    }
                }
            });

            interactionSystem.registerCandidate({
                id:
                    `care_${baby.id}`,
                type: 'care',
                x: baby.x,
                y: baby.y,
                priority: 15,
                canInteract: () =>
                    baby.state ===
                    'Nursery',
                onInteract: () => {
                    if (
                        baby.needs.hunger <
                        30
                    ) {
                        nurserySystem.removeBaby(
                            baby.id
                        );

                        followerSystem.recruit(
                            baby.id
                        );
                    } else if (
                        inventorySystem.hasItem(
                            'bottle'
                        )
                    ) {
                        babyCareSystem.feedBaby(
                            baby.id
                        );
                    } else if (
                        inventorySystem.hasItem(
                            'teddy_bear'
                        )
                    ) {
                        babyCareSystem.comfortBaby(
                            baby.id
                        );
                    }
                }
            });

            interactionSystem.registerCandidate({
                id:
                    `rename_${baby.id}`,
                type: 'rename',
                x: baby.x,
                y: baby.y + 20,
                priority: 8,
                canInteract: () =>
                    baby.state ===
                    'Nursery',
                onInteract: () =>
                    this.openRenameModal(
                        baby.id
                    )
            });
        });

        // Player nametag.
        if (this.player) {
            const playerId =
                gameState.player.id;

            if (
                !this.nameTags[playerId]
            ) {
                this.nameTags[playerId] =
                    this.add
                        .text(
                            this.player.x,
                            this.player.y - 25,
                            gameState.player.name,
                            {
                                fontSize:
                                    '12px',
                                backgroundColor:
                                    '#e91e63aa',
                                color:
                                    '#ffffff',
                                padding: {
                                    x: 4,
                                    y: 2
                                }
                            }
                        )
                        .setOrigin(0.5)
                        .setDepth(
                            this.player.y + 1
                        );
            }

            this.nameTags[
                playerId
            ].x =
                this.player.x;

            this.nameTags[
                playerId
            ].y =
                this.player.y - 25;

            this.nameTags[
                playerId
            ].setDepth(
                this.player.y + 1
            );
        }
    }

    // ================================================================
    // RENAME
    // ================================================================

    private openRenameModal(
        babyId: string
    ) {
        const modal =
            document.getElementById(
                'rename-modal'
            );

        const input =
            document.getElementById(
                'rename-input'
            ) as HTMLInputElement;

        const confirmBtn =
            document.getElementById(
                'rename-confirm'
            );

        if (
            !modal ||
            !input ||
            !confirmBtn
        ) {
            return;
        }

        input.value =
            gameState.babies[
                babyId
            ].name;

        modal.style.display =
            'block';

        confirmBtn.onclick =
            () => {
                const name =
                    input.value.trim();

                if (!name) {
                    return;
                }

                gameState.babies[
                    babyId
                ].name =
                    name;

                modal.style.display =
                    'none';

                this.syncSprites();
            };
    }

    // ================================================================
    // HUD
    // ================================================================

    private updateHud() {
        const entries =
            inventorySystem.getAllEntries();

        const grouped:
            Record<string, number> =
            {};

        entries.forEach(entry => {
            grouped[entry.itemId] =
                (
                    grouped[
                        entry.itemId
                    ] || 0
                ) + entry.quantity;
        });

        const inventoryText =
            Object.entries(
                grouped
            )
                .map(
                    ([
                        itemId,
                        quantity
                    ]) => {
                        const def =
                            ITEMS[itemId];

                        return `${
                            def?.name ||
                            itemId
                        } x${quantity}`;
                    }
                )
                .join(' | ') ||
            'Inventory Empty';

        this.inventoryHud.setText(
            inventoryText
        );

        const domBar =
            document.getElementById(
                'inventory-bar'
            );

        if (domBar) {
            domBar.innerText =
                inventoryText;
        }
    }

    // ================================================================
    // DEBUG / QUEST HUD
    // ================================================================

    private updateDebugText() {
        const activeQuests =
            questSystem.getActiveQuests();

        const questListHtml =
            activeQuests
                .map(
                    quest =>
                        `<div style="margin-bottom:5px;">• ${quest.title}</div>`
                )
                .join('') ||
            'None';

        const questEl =
            document.getElementById(
                'quest-list'
            );

        const buttonEl =
            document.getElementById(
                'button-count'
            );

        const dayEl =
            document.getElementById(
                'day-count'
            );

        if (questEl) {
            questEl.innerHTML =
                questListHtml;
        }

        if (buttonEl) {
            buttonEl.innerText =
                `Buttons: ${gameState.buttons}`;
        }

        if (dayEl) {
            dayEl.innerText =
                `Day: ${gameState.gameDay}`;
        }

        const step =
            onboardingSystem.getCurrentStep();

        const onboardingOverlay =
            document.getElementById(
                'onboarding-overlay'
            );

        const onboardingText =
            document.getElementById(
                'onboarding-text'
            );

        if (
            onboardingOverlay &&
            onboardingText
        ) {
            if (step) {
                onboardingOverlay.style.display =
                    'block';

                onboardingText.innerText =
                    step.text;
            } else {
                onboardingOverlay.style.display =
                    'none';
            }
        }

        this.debugText.setFontSize(
            16
        );

        this.debugText.setText([
            `Mode: ${
                this.isPlacementMode
                    ? 'Placement'
                    : 'Explore'
            }`,
            `Followers: ${
                gameState.followerIds.length
            }`,
            `Nursery: ${
                Object.values(
                    gameState.babies
                ).filter(
                    baby =>
                        baby.state ===
                        'Nursery'
                ).length
            }`
        ]);
    }
}