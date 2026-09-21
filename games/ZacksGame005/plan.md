# ZacksGame005 Modular RPG Foundation Plan

## Goal
Replace the current monolithic preview.html script with modular browser JavaScript while preserving the existing playable prototype.

## Target Structure
ZacksGame005/
├── preview.html
├── plan.md
└── js/
    ├── main.js
    ├── config.js
    ├── state/
    │   └── gameState.js
    ├── data/
    │   ├── items.js
    │   ├── npcs.js
    │   ├── enemies.js
    │   ├── quests.js
    │   ├── shops.js
    │   └── resources.js
    ├── world/
    │   ├── map.js
    │   └── worldGenerator.js
    ├── entities/
    │   ├── player.js
    │   ├── enemy.js
    │   └── npc.js
    ├── systems/
    │   ├── movement.js
    │   ├── combat.js
    │   ├── quests.js
    │   ├── inventory.js
    │   ├── interaction.js
    │   ├── economy.js
    │   ├── skills.js
    │   └── gathering.js
    ├── input/
    │   └── keyboard.js
    ├── rendering/
    │   ├── renderer.js
    │   ├── human.js
    │   ├── enemyRenderer.js
    │   ├── worldRenderer.js
    │   └── uiRenderer.js
    └── ui/
        ├── dialogue.js
        ├── store.js
        ├── inventory.js
        └── questLog.js

## Migration Order
1. Create the module directories and files.
2. Extract configuration/constants.
3. Create one authoritative game state module.
4. Extract the existing map and world generation unchanged.
5. Extract player state, facing direction, movement, and keyboard input.
6. Extract rendering and procedural character animation.
7. Extract enemies and combat.
8. Extract NPCs and the generic interaction system.
9. Extract the quest system and convert the current Elder quest to data.
10. Extract inventory, equipment, gold, rewards, and shops.
11. Add generic item definitions.
12. Add skill/XP foundations.
13. Add gathering/resource nodes.
14. Add fishing foundations.
15. Add inventory and quest-log UI.
16. Run diagnostics and fix integration errors.

## RPG Foundation Requirements

### Player
- Position and collision
- Four-direction facing
- Idle and walking animation
- Attack animation
- HP/death/reset
- Equipment
- Inventory
- Gold
- Skill XP

### Combat
- Directional attacks
- Attack cooldown
- Attack range
- Damage calculation
- Hit flash
- Enemy death
- XP rewards
- Loot drops
- Future enemy respawn support

### NPCs
NPCs become data-driven and have roles instead of only dialogue.
Initial roles:
- Elder: quests
- Blacksmith: weapons/shop
- Fisherman: fishing supplies/tutorial
- Merchant: general store
- Healer: restore HP
- Banker: future storage
- Trainer: future skill progression

### Quests
Generic objectives:
- talk
- pickup
- kill
- collect
- gather
- fish
- deliver

Rewards should support:
- gold
- XP
- items
- equipment

### Inventory and Items
Use item IDs and reusable definitions rather than one-off booleans.
Initial items:
- old_sword
- steel_sword
- fishing_rod
- bait
- fish
- wood
- stone
- herb
- enemy loot

### Skills
Initial skills:
- Combat
- Fishing
- Woodcutting
- Mining
- Gathering

Each skill stores level and XP and uses a shared XP/leveling system.

### Gathering
Resource nodes should be generic.
Initial resource types:
- tree -> wood
- rock -> stone
- herb patch -> herbs
- fishing spot -> fish

Resource nodes should support skill requirements, gather time, output tables, and respawn timers.

### Shops
Generic shop definitions should support buying and selling.
Initial shops:
- General Store
- Blacksmith
- Fisherman

### World Interaction
Use one interaction system for nearby:
- NPCs
- pickups
- resources
- fishing spots
- loot
- doors/buildings

E should route the interaction to the correct system.

### Rendering
Keep gameplay state out of render functions where practical.
Draw order:
1. terrain
2. world/resource objects
3. NPCs/enemies
4. player
5. attack effects
6. interaction prompts
7. HUD
8. modal UI

### Persistence Preparation
Keep character state serializable so local save can be added later and a server-backed character system can eventually replace it.
Persistable state should include:
- position
- inventory
- equipment
- gold
- skills
- quests
- progression

## MMORPG Direction
Do not add networking yet. Keep the single-player architecture clean enough that multiplayer can later introduce:
- player IDs
- authoritative server state
- network snapshots
- persistent characters
- shared world state
- resource respawns
- validated combat

## Migration Rule
Move existing behavior first, then improve it. Avoid creating a second source of truth. Data belongs in data modules; gameplay behavior belongs in systems; rendering belongs in rendering modules; UI belongs in UI modules.

## Definition of First Modular Milestone
The game should still load and play, but now have modular foundations for:
- movement/facing/animation
- combat/enemies
- inventory/equipment
- items/gold/rewards
- NPC roles
- quests
- shops
- skills/XP
- gathering/resource nodes
- fishing
- dialogue
- HUD
- inventory UI
- quest log UI
