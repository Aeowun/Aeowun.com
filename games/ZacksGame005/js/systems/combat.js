import { gameState } from '../state/gameState.js';
import { dist, map, inside } from '../world/map.js';
import { canMoveTo } from './movement.js';
import { TILE_TYPES } from '../config.js';
import { playSFX } from './audio.js';
import { broadcastImmediateAttack } from './multiplayer.js';
import { damageBoss, getDungeonState } from './dungeon.js';
import { addBillboard } from './feedback.js';
import { updateQuestProgress } from './quests.js';
import { gainXP } from './leveling.js';

let spikeDamageTimer = 0;

export function startAttack() {
    const { player, ui, enemies, quest, projectiles } = gameState;
    if (ui.dialogueOpen || ui.storeOpen || player.attackTimer > 0 || player.attackCooldown > 0 || !player.swordPickedUp || player.isDodging) return;

    const equippedWeapon = player.equipment.weapon;
    const isRanged = equippedWeapon && equippedWeapon.id.includes('bow');

    if (isRanged) {
        // RANGED ATTACK (BOW)
        player.attackTimer = 0.25;
        player.attackCooldown = 0.6;
        const angle = Math.atan2(player.dirY, player.dirX);

        projectiles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 12,
            vy: Math.sin(angle) * 12,
            angle: angle,
            owner: 'player',
            damage: (equippedWeapon.damage || 1) + (player.baseAttack - 1),
            life: 1.5 // Seconds before despawn
        });

        playSFX('sfx_slash'); // TODO: Add shoot sfx
    } else {
        // MELEE ATTACK (SWORD)
        player.attackTimer = .32;
        player.attackCooldown = .48;
        player.attackAngle = Math.atan2(player.dirY, player.dirX);
        playSFX('sfx_slash');

        try {
            broadcastImmediateAttack(player.attackAngle);
        } catch (e) {
            console.error('Failed to broadcast attack:', e);
        }

        // Damage based on sword tier + base attack level
        const damage = (player.steelSword ? 2 : 1) + (player.baseAttack - 1);

        for (const enemy of enemies) {
            if (enemy.dungeonLevel != null && gameState.currentWorld !== 'dungeon') continue;
            if (enemy.dungeonLevel == null && gameState.currentWorld === 'dungeon') continue;
            if (!enemy.alive) continue;

            if (dist(player.x, player.y, enemy.x, enemy.y) < 2.4) {
                applyDamageToEnemy(enemy, damage);
            }
        }

        if (gameState.currentWorld === 'dungeon' && gameState.boss?.alive) {
            const boss = gameState.boss;
            const state = getDungeonState();
            const hitRange = 2.6;
            const d = dist(player.x, player.y, boss.x, boss.y);

            if (d < hitRange) {
                boss.hitFlash = .18;
                damageBoss(damage);
                playSFX('sfx_hit');
                addBillboard(`-${damage} Heart`, boss.x, boss.y, "#ffcc55");

                if (state.boss.hp <= 0) {
                    boss.hp = 0;
                    boss.alive = false;
                    gainXP(250); // Big boss reward
                }
            }
        }
    }
}

function applyDamageToEnemy(enemy, damage) {
    enemy.hp -= damage;
    enemy.hitFlash = .18;
    playSFX('sfx_hit');
    addBillboard(`-${damage} Heart`, enemy.x, enemy.y, "#ffaa00");

    if (enemy.hp <= 0) {
        enemy.hp = 0;
        enemy.alive = false;

        // XP REWARDS
        const xpMap = {
            wolf: 15,
            demon: 15,
            bandit: 25,
            ghost: 35,
            drowned: 35
        };
        gainXP(xpMap[enemy.type] || 15);

        if (enemy.dungeonLevel == null) {
            updateQuestProgress('KILL', { target: 'creature' });
        }
    }
}

function updateProjectiles(dt) {
    const { projectiles, enemies, boss, currentWorld } = gameState;

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        // Collision with walls
        if (isBlocked(p.x, p.y) || p.life <= 0) {
            projectiles.splice(i, 1);
            continue;
        }

        // Collision with enemies (if player owned)
        if (p.owner === 'player') {
            let hit = false;
            for (const enemy of enemies) {
                if (!enemy.alive) continue;
                if (enemy.dungeonLevel != null && currentWorld !== 'dungeon') continue;
                if (enemy.dungeonLevel == null && currentWorld === 'dungeon') continue;

                if (dist(p.x, p.y, enemy.x, enemy.y) < 0.8) {
                    applyDamageToEnemy(enemy, p.damage);
                    hit = true;
                    break;
                }
            }

            if (!hit && currentWorld === 'dungeon' && boss?.alive) {
                if (dist(p.x, p.y, boss.x, boss.y) < 1.5) {
                    boss.hitFlash = 0.18;
                    damageBoss(p.damage);
                    playSFX('sfx_hit');
                    addBillboard(`-${p.damage} Heart`, boss.x, boss.y, "#ffcc55");
                    hit = true;
                }
            }

            if (hit) {
                projectiles.splice(i, 1);
            }
        }
    }
}

function applyDamageToPlayer(amount, enemyType = 'enemy') {
    const { player } = gameState;
    if (player.isDodging) return;

    // Every point of defense adds a 12% block chance
    const blockChance = (player.equipment.armor?.defense || 0) * 0.12;

    if (Math.random() < blockChance) {
        addBillboard("BLOCK!", player.x, player.y, "#44ccff");
        playSFX('sfx_hit'); // Clang sound?
        return;
    }

    player.hp = Math.max(0, player.hp - amount);
    addBillboard(`-${amount} Heart`, player.x, player.y, "#ff3333");
    playSFX('sfx_hit');

    if (enemyType === 'drowned') {
        player.slowTimer = 2.0; // Slow for 2 seconds
        import('./feedback.js').then(mod => mod.notify("Drowned: You feel heavy...", "info"));
    }
}

function updateBoss(dt) {
    const boss = gameState.boss;
    if (!boss?.alive || gameState.currentWorld !== 'dungeon') return;

    boss.hitFlash = Math.max(0, boss.hitFlash - dt);
    boss.attackCooldown = Math.max(0, boss.attackCooldown - dt);
    boss.attackTimer = Math.max(0, (boss.attackTimer || 0) - dt);

    const dx = gameState.player.x - boss.x;
    const dy = gameState.player.y - boss.y;
    const d = Math.hypot(dx, dy);

    // The boss is intentionally larger and slower than regular enemies.
    if (d > 1.55 && d > 0) {
        const nx = dx / d;
        const ny = dy / d;
        const moveX = nx * boss.speed * dt;
        const moveY = ny * boss.speed * dt;

        if (canMoveTo(boss.x + moveX, boss.y)) boss.x += moveX;
        if (canMoveTo(boss.x, boss.y + moveY)) boss.y += moveY;
    }

    if (d < 1.65 && boss.attackCooldown <= 0) {
        applyDamageToPlayer(1, 'boss');
        boss.attackCooldown = 1.65;

        // Attack effects
        boss.attackTimer = 0.32;
        boss.attackAngle = Math.atan2(dy, dx);
        playSFX('sfx_slash');
    }

    const state = getDungeonState();
    if (state.boss.hp <= 0) boss.alive = false;
}

function resetAfterPlayerDeath() {
    const { player } = gameState;
    if (player.hp <= 0) {
        gameState.ui.currentScreen = 'death_screen';
        gameState.ui.menuSelection = 0; // Default to 'CONTINUE'
    }
}

export function updateCombat(dt) {
    const { player, enemies, quest, ui } = gameState;

    player.attackTimer = Math.max(0, player.attackTimer - dt);
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.slowTimer = Math.max(0, (player.slowTimer || 0) - dt);

    if (ui.dialogueOpen || ui.storeOpen || ui.paused) return;

    // Ensure dungeon state/boss activation is checked every frame
    if (gameState.currentWorld === 'dungeon') {
        getDungeonState();
    }

    updateBoss(dt);
    updateProjectiles(dt);

    // Update Global Trap State
    gameState.world.trapTimer += dt;
    // Toggle every 2.5 seconds
    if (gameState.world.trapTimer > 2.5) {
        gameState.world.trapTimer = 0;
        gameState.world.trapsActive = !gameState.world.trapsActive;
    }

    // Trap Damage (Spikes)
    spikeDamageTimer = Math.max(0, spikeDamageTimer - dt);
    const txp = Math.floor(player.x), typ = Math.floor(player.y);
    if (inside(txp, typ) && map[typ][txp] === TILE_TYPES.Spike && gameState.world.trapsActive && spikeDamageTimer <= 0 && !player.isDodging) {
        applyDamageToPlayer(1, 'spike');
        spikeDamageTimer = 1.0;
    }

    const detectRange = 5.0;

    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (gameState.currentWorld === 'dungeon' && enemy.dungeonLevel !== getDungeonState().level) continue;
        if (gameState.currentWorld === 'overworld' && enemy.dungeonLevel != null) continue;

        enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
        enemy.attackTimer = Math.max(0, (enemy.attackTimer || 0) - dt);
        enemy.attackMeter = enemy.attackMeter || 0;

        const ex = player.x - enemy.x;
        const ey = player.y - enemy.y;
        const ed = Math.hypot(ex, ey);
        const isHunting = gameState.currentWorld === 'overworld' && quest.state === 'hunt';

        // WOLF STALKER SPEED
        const currentSpeed = enemy.type === 'wolf' ? enemy.speed * 1.4 : enemy.speed;
        const currentDetect = enemy.type === 'wolf' ? detectRange * 1.5 : detectRange;

        if (ed < currentDetect || (isHunting && ed < 10.0)) {
            // MOVEMENT
            if (ed > 1.1 && ed > 0) {
                const enx = ex / ed;
                const eny = ey / ed;
                const enemyMoveX = enx * currentSpeed * dt;
                const enemyMoveY = eny * currentSpeed * dt;

                // GHOSTS IGNORE WALLS
                const canPhase = (enemy.type === 'ghost');
                if (canPhase || canMoveTo(enemy.x + enemyMoveX, enemy.y)) enemy.x += enemyMoveX;
                if (canPhase || canMoveTo(enemy.x, enemy.y + enemyMoveY)) enemy.y += enemyMoveY;
                enemy.animTime += dt * 12;
            }

            // ATTACK METER BUILDING
            if (ed < 1.8) {
                enemy.attackMeter = Math.min(1, enemy.attackMeter + dt * 0.8); // 1.25s to fill

                if (enemy.attackMeter >= 1) {
                    enemy.attackMeter = 0; // Reset

                    // Trigger Attack
                    if (ed < 1.3) {
                        applyDamageToPlayer(1, enemy.type);
                    }

                    // Attack Visuals
                    enemy.attackTimer = 0.32;
                    enemy.attackAngle = Math.atan2(ey, ex);
                    playSFX('sfx_slash');
                }
            } else {
                // Slowly drain meter if out of range
                enemy.attackMeter = Math.max(0, enemy.attackMeter - dt * 0.5);
            }
        } else {
            enemy.wanderTimer -= dt;
            if (enemy.wanderTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                const wanderDistance = 1 + Math.random() * 3;
                enemy.targetX = enemy.spawnX + Math.cos(angle) * wanderDistance;
                enemy.targetY = enemy.spawnY + Math.sin(angle) * wanderDistance;
                enemy.wanderTimer = 2 + Math.random() * 4;
            }

            const tx = enemy.targetX - enemy.x;
            const ty = enemy.targetY - enemy.y;
            const td = Math.hypot(tx, ty);
            if (td > 0.1) {
                const wanderSpeed = enemy.speed * 0.4;
                const enx = tx / td;
                const eny = ty / td;
                const moveX = enx * wanderSpeed * dt;
                const moveY = eny * wanderSpeed * dt;
                if (canMoveTo(enemy.x + moveX, enemy.y)) enemy.x += moveX;
                if (canMoveTo(enemy.x, enemy.y + moveY)) enemy.y += moveY;
                enemy.animTime += dt * 5;
            }
        }
    }

    resetAfterPlayerDeath();
}
