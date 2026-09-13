import { gameState } from '../state/gameState.js';
import { dist } from '../world/map.js';
import { canMoveTo } from './movement.js';
import { playSFX } from './audio.js';
import { broadcastImmediateAttack } from './multiplayer.js';
import { damageBoss, getDungeonState } from './dungeon.js';
import { addBillboard } from './feedback.js';

export function startAttack() {
    const { player, ui, enemies, quest } = gameState;
    if (ui.dialogueOpen || ui.storeOpen || player.attackTimer > 0 || player.attackCooldown > 0 || !player.swordPickedUp) return;

    player.attackTimer = .32;
    player.attackCooldown = .48;
    player.attackAngle = Math.atan2(player.dirY, player.dirX);
    playSFX('sfx_slash');

    try {
        broadcastImmediateAttack(player.attackAngle);
    } catch (e) {
        console.error('Failed to broadcast attack:', e);
    }

    for (const enemy of enemies) {
        if (enemy.dungeonLevel != null && gameState.currentWorld !== 'dungeon') continue;
        if (enemy.dungeonLevel == null && gameState.currentWorld === 'dungeon') continue;
        if (!enemy.alive) continue;

        if (dist(player.x, player.y, enemy.x, enemy.y) < 2.4) {
            enemy.hp -= 1;
            enemy.hitFlash = .18;
            playSFX('sfx_hit');
            addBillboard("-1 Heart", enemy.x, enemy.y, "#ffaa00");

            if (enemy.hp <= 0) {
                enemy.hp = 0;
                enemy.alive = false;
                if (quest.state === 'hunt' && enemy.dungeonLevel == null) quest.state = 'return';
            }
        }
    }

    if (gameState.currentWorld === 'dungeon' && gameState.boss?.alive) {
        const boss = gameState.boss;
        const state = getDungeonState();
        const hitRange = 2.6;
        const d = dist(player.x, player.y, boss.x, boss.y);

        if (d < hitRange) {
            boss.hitFlash = .18;
            damageBoss(1);
            playSFX('sfx_hit');
            addBillboard("-1 Heart", boss.x, boss.y, "#ffcc55");

            if (state.boss.hp <= 0) {
                boss.hp = 0;
                boss.alive = false;
            }
        }
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
        gameState.player.hp = Math.max(0, gameState.player.hp - 1);
        boss.attackCooldown = 1.65;

        // Attack effects
        boss.attackTimer = 0.32;
        boss.attackAngle = Math.atan2(dy, dx);
        playSFX('sfx_slash');
        addBillboard("-1 Heart", gameState.player.x, gameState.player.y, "#ff3333");
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

    if (ui.dialogueOpen || ui.storeOpen || ui.paused) return;

    // Ensure dungeon state/boss activation is checked every frame
    if (gameState.currentWorld === 'dungeon') {
        getDungeonState();
    }

    updateBoss(dt);

    const detectRange = 5.0;

    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (gameState.currentWorld === 'dungeon' && enemy.dungeonLevel !== getDungeonState().level) continue;
        if (gameState.currentWorld === 'overworld' && enemy.dungeonLevel != null) continue;

        enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
        enemy.attackTimer = Math.max(0, (enemy.attackTimer || 0) - dt);

        const ex = player.x - enemy.x;
        const ey = player.y - enemy.y;
        const ed = Math.hypot(ex, ey);
        const isHunting = gameState.currentWorld === 'overworld' && quest.state === 'hunt';

        if (ed < detectRange || (isHunting && ed < 10.0)) {
            if (ed > 1.1 && ed > 0) {
                const enx = ex / ed;
                const eny = ey / ed;
                const enemyMoveX = enx * enemy.speed * dt;
                const enemyMoveY = eny * enemy.speed * dt;

                if (canMoveTo(enemy.x + enemyMoveX, enemy.y)) enemy.x += enemyMoveX;
                if (canMoveTo(enemy.x, enemy.y + enemyMoveY)) enemy.y += enemyMoveY;
                enemy.animTime += dt * 9;
            }

            enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
            if (ed < 1.3 && enemy.attackCooldown <= 0) {
                player.hp = Math.max(0, player.hp - 1);
                enemy.attackCooldown = 1.2;

                // Attack effects
                enemy.attackTimer = 0.32;
                enemy.attackAngle = Math.atan2(ey, ex);
                playSFX('sfx_slash');
                addBillboard("-1 Heart", player.x, player.y, "#ff3333");
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
