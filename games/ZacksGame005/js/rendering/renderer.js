import { W, H, T } from '../config.js';
import { gameState } from '../state/gameState.js';
import { dist } from '../world/map.js';
import { drawWorld, drawRoofs, drawDecorations } from './worldRenderer.js';
import { drawHuman } from './human.js';
import { drawEnemy } from './enemyRenderer.js';
import { drawSword, drawAttack } from './effectsRenderer.js';
import { drawHUD, drawStore, drawDialogue, drawMainMenu, drawServerBrowser, drawDeathScreen, drawNotifications, drawPauseMenu } from './uiRenderer.js';

export function draw(ctx, innerWidth, innerHeight) {
    const { player, camera, enemies, npcs, sword, ui, billboards } = gameState;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    if (ui.currentScreen === 'main_menu') {
        drawMainMenu(ctx, innerWidth, innerHeight);
        return;
    }

    if (ui.currentScreen === 'server_browser') {
        drawServerBrowser(ctx, innerWidth, innerHeight);
        return;
    }

    if (ui.currentScreen === 'death_screen') {
        drawDeathScreen(ctx, innerWidth, innerHeight);
        return;
    }

    const sx = innerWidth / (W * T);
    const sy = innerHeight / (H * T);
    const scale = Math.min(sx, sy) * 15;
    const screenX = innerWidth / 2;
    const screenY = innerHeight / 2;

    drawWorld(ctx, camera, scale, innerWidth, innerHeight);

    if (!sword.pickedUp && gameState.currentWorld === 'overworld') {
        const swordX = screenX + (sword.x - camera.x) * T * scale;
        const swordY = screenY + (sword.y - camera.y) * T * scale;
        drawSword(ctx, swordX, swordY, scale * 0.65);

        if (dist(player.x, player.y, sword.x, sword.y) < 1.8) {
            ctx.fillStyle = '#fff';
            ctx.font = `${7 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('E - PICK UP', swordX, swordY - 20 * scale);
            ctx.textAlign = 'left';
        }
    }

    // Dungeon enemies and overworld enemies use the same renderer.
    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (gameState.currentWorld === 'dungeon' && enemy.dungeonLevel == null) continue;
        if (gameState.currentWorld === 'overworld' && enemy.dungeonLevel != null) continue;

        const enemyX = screenX + (enemy.x - camera.x) * T * scale;
        const enemyY = screenY + (enemy.y - camera.y) * T * scale;
        drawEnemy(ctx, enemyX, enemyY, scale, enemy);

        if (enemy.attackTimer > 0) {
            drawAttack(ctx, enemyX, enemyY, scale, enemy);
        }
    }

    // Final boss.
    if (gameState.currentWorld === 'dungeon' && gameState.boss?.alive) {
        const boss = gameState.boss;
        const bossX = screenX + (boss.x - camera.x) * T * scale;
        const bossY = screenY + (boss.y - camera.y) * T * scale;

        ctx.save();
        ctx.translate(bossX, bossY);
        ctx.fillStyle = boss.hitFlash > 0 ? '#f2c1c1' : '#4b2730';
        ctx.beginPath();
        ctx.arc(0, 0, 19 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#27151b';
        ctx.beginPath();
        ctx.arc(0, 4 * scale, 13 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e5b84b';
        ctx.beginPath();
        ctx.moveTo(-11 * scale, -10 * scale);
        ctx.lineTo(-4 * scale, -19 * scale);
        ctx.lineTo(0, -11 * scale);
        ctx.lineTo(7 * scale, -19 * scale);
        ctx.lineTo(12 * scale, -9 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffcc55';
        ctx.fillRect(-7 * scale, -2 * scale, 4 * scale, 3 * scale);
        ctx.fillRect(3 * scale, -2 * scale, 4 * scale, 3 * scale);
        ctx.restore();

        if (boss.attackTimer > 0) {
            drawAttack(ctx, bossX, bossY, scale, boss);
        }

        // Boss health bar (represented as hearts logic is handled in drawHUD, but we keep the visual here too if preferred, or remove it. User asked for hearts instead of health bars. I'll keep it for now but adjust it to hearts logic if needed. Actually user said "Lets add hear system instead of health bars". So I should remove the boss bar.)
        /*
        const barW = 110 * scale;
        const barH = 7 * scale;
        ...
        */
    }

    for (const npc of npcs) {
        if (gameState.currentWorld !== 'overworld') continue;

        const npcX = screenX + (npc.x - camera.x) * T * scale;
        const npcY = screenY + (npc.y - camera.y) * T * scale;

        drawHuman(ctx, npcX, npcY, scale, {
            skin: '#b97855', hair: '#2a1b16', shirt: '#7a4b3a', pants: '#252b31', moving: false, facing: 'down'
        });

        if (dist(player.x, player.y, npc.x, npc.y) < 1.8 && !ui.dialogueOpen) {
            ctx.fillStyle = 'rgba(0,0,0,.8)';
            ctx.fillRect(npcX - 20 * scale, npcY - 28 * scale, 40 * scale, 10 * scale);
            ctx.fillStyle = '#fff';
            ctx.font = `${6 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('E - TALK', npcX, npcY - 20 * scale);
            ctx.textAlign = 'left';
        }
    }

    const playerX = screenX;
    const playerY = screenY;

    if (player.swordPickedUp) {
        ctx.save();
        const bob = player.moving ? Math.abs(Math.sin(player.animTime)) * 1.2 * scale : 0;
        let handX = 0, handY = 0, swordRot = 0;

        switch (player.facing) {
            case 'down': handX = 7 * scale; handY = 6 * scale - bob; swordRot = 2.4; break;
            case 'up': handX = -7 * scale; handY = 2 * scale - bob; swordRot = -0.4; break;
            case 'left': handX = -4 * scale; handY = 6 * scale - bob; swordRot = -1.8; break;
            case 'right': handX = 4 * scale; handY = 6 * scale - bob; swordRot = 1.8; break;
        }

        ctx.translate(playerX + handX, playerY + handY);
        ctx.rotate(swordRot);
        ctx.fillStyle = '#202020';
        ctx.fillRect(-1 * scale, 0, 2 * scale, 8 * scale);
        ctx.fillStyle = '#c6a94b';
        ctx.fillRect(-3 * scale, 0, 6 * scale, 2 * scale);
        ctx.fillStyle = player.steelSword ? '#b0c4de' : '#e1e8ef';
        ctx.beginPath();
        ctx.moveTo(0, -18 * scale);
        ctx.lineTo(2.2 * scale, 0);
        ctx.lineTo(-2.2 * scale, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawHuman(ctx, playerX, playerY, scale, {
        skin: '#d09a72', hair: '#3b2418', shirt: '#536b80', pants: '#202832',
        moving: player.moving, animTime: player.animTime, facing: player.facing
    });

    if (gameState.otherPlayers) {
        for (const id in gameState.otherPlayers) {
            const op = gameState.otherPlayers[id];
            if (op.currentWorld !== gameState.currentWorld) continue;

            const opX = screenX + (op.x - camera.x) * T * scale;
            const opY = screenY + (op.y - camera.y) * T * scale;
            drawHuman(ctx, opX, opY, scale, {
                skin: '#a4c2f4', hair: '#1155cc', shirt: '#3c78d8', pants: '#1c4587',
                moving: op.moving, animTime: op.animTime, facing: op.facing
            });

            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.font = `bold ${5 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(`Player ${id.substring(0, 6)}`, opX, opY - 18 * scale);
            ctx.restore();

            if (op.attackTimer > 0) drawAttack(ctx, opX, opY, scale, op);
        }
    }

    drawRoofs(ctx, camera, scale, innerWidth, innerHeight, { x: player.x, y: player.y });
    drawAttack(ctx, playerX, playerY, scale, player);

    // Draw Floating Billboards in World Space
    if (billboards && billboards.length) {
        billboards.forEach(b => {
            const bx = screenX + (b.x - camera.x) * T * scale;
            const by = screenY + (b.y - camera.y) * T * scale + (b.offsetY * T * scale);

            ctx.save();
            ctx.fillStyle = b.color;
            ctx.font = `bold ${8 * scale}px sans-serif`;
            ctx.textAlign = 'center';

            // Text Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;

            ctx.fillText(b.text, bx, by);
            ctx.restore();
        });
    }

    drawDecorations(ctx, camera, scale, innerWidth, innerHeight, { x: player.x, y: player.y });

    drawHUD(ctx, innerWidth, innerHeight, player.x, player.y);
    drawDialogue(ctx, innerWidth, innerHeight);
    drawStore(ctx, innerWidth, innerHeight);
    drawNotifications(ctx, innerWidth, innerHeight);

    if (ui.paused) {
        drawPauseMenu(ctx, innerWidth, innerHeight);
    }

    // Full-screen travel fade. Everything underneath is hidden while the camera/map swap occurs.
    if (ui.fadeAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, ui.fadeAlpha));
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, innerWidth, innerHeight);
        ctx.restore();
    }
}
