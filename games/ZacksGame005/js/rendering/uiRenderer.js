import { gameState } from '../state/gameState.js';
import { map, inside } from '../world/map.js';
import { TILE_TYPES } from '../config.js';
import { QUEST_TEXT } from '../data/textData.js';
import { getDungeonState } from '../systems/dungeon.js';
import { getQuestStage } from '../systems/quests.js';

/**
 * Utility to draw wrapped text on a canvas context.
 * Supports manual newlines \n and text alignment.
 * @returns {number} The total height used.
 */
function drawTextWrapped(ctx, text, x, y, maxWidth, lineHeight, align = 'left', measureOnly = false) {
    const lines = text.split('\n');
    let currentY = y;
    const oldAlign = ctx.textAlign;
    ctx.textAlign = align;

    for (const paragraph of lines) {
        const words = paragraph.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                if (!measureOnly) ctx.fillText(line.trim(), x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        if (!measureOnly) ctx.fillText(line.trim(), x, currentY);
        currentY += lineHeight;
    }
    ctx.textAlign = oldAlign;
    return currentY - y;
}

export function drawMainMenu(ctx, innerWidth, innerHeight) {
    const { ui } = gameState;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const selection = Number.isInteger(ui.menuSelection)
        ? ui.menuSelection
        : 0;

    ctx.fillStyle = '#0b0d10';
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    ctx.fillStyle = 'rgba(70, 82, 96, 0.12)';
    ctx.fillRect(0, 0, innerWidth, innerHeight * 0.35);

    ctx.fillStyle = '#e8d9a3';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ZACKSGAME005', centerX, centerY - 150);

    ctx.fillStyle = '#8da0ad';
    ctx.font = '18px sans-serif';
    drawTextWrapped(
        ctx,
        'A Small World of Roads, Ruins, and Monsters',
        centerX,
        centerY - 112,
        innerWidth - 40,
        22,
        'center'
    );

    const buttons = [
        { label: 'NEW GAME', disabled: false },
        { label: 'RESUME GAME', disabled: false },
        { label: 'MULTIPLAYER', disabled: true }
    ];

    const buttonW = Math.min(360, innerWidth - 80);
    const buttonH = 52;
    const gap = 14;
    const startY = centerY - 45;

    buttons.forEach((btn, index) => {
        const y = startY + index * (buttonH + gap);
        const selected = selection === index && !btn.disabled;

        if (btn.disabled) {
            ctx.fillStyle = 'rgba(15, 15, 15, 0.5)';
        } else {
            ctx.fillStyle = selected
                ? 'rgba(70, 130, 180, 0.85)'
                : 'rgba(25, 28, 33, 0.95)';
        }

        ctx.fillRect(
            centerX - buttonW / 2,
            y,
            buttonW,
            buttonH
        );

        if (btn.disabled) {
            ctx.strokeStyle = 'rgba(40, 40, 40, 0.5)';
        } else {
            ctx.strokeStyle = selected
                ? '#9fd9ff'
                : '#58616a';
        }

        ctx.lineWidth = selected ? 2.5 : 1;
        ctx.strokeRect(
            centerX - buttonW / 2,
            y,
            buttonW,
            buttonH
        );

        ctx.fillStyle = btn.disabled ? '#444' : '#ffffff';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText(btn.label, centerX, y + 33);
    });

    ctx.fillStyle = '#777f87';
    ctx.font = '13px sans-serif';
    ctx.fillText(
        'Arrow keys / Tap to navigate  •  Enter to select',
        centerX,
        innerHeight - 45
    );

    ctx.textAlign = 'left';
}

export function drawServerBrowser(ctx, innerWidth, innerHeight) {
    const { multiplayer, ui } = gameState;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const selection = Number.isInteger(ui.menuSelection)
        ? ui.menuSelection
        : 0;

    const rooms = Array.isArray(multiplayer.availableRooms)
        ? multiplayer.availableRooms
        : [];

    const roomCount = rooms.length;
    const refreshIndex = roomCount;
    const hostIndex = roomCount + 1;
    const backIndex = roomCount + 2;

    ctx.fillStyle = '#0b0d10';
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    const panelW = Math.min(820, innerWidth - 40);
    const desiredPanelH = 190 + Math.max(roomCount, 1) * 62;
    const panelH = Math.min(
        Math.max(390, desiredPanelH),
        innerHeight - 40
    );
    const panelX = centerX - panelW / 2;
    const panelY = centerY - panelH / 2;

    ctx.fillStyle = 'rgba(17, 20, 24, 0.98)';
    ctx.fillRect(panelX, panelY, panelW, panelH);

    ctx.strokeStyle = '#58616a';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    ctx.fillStyle = '#e8d9a3';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OPEN WORLDS', centerX, panelY + 52);

    ctx.fillStyle = '#8da0ad';
    ctx.font = '14px sans-serif';
    ctx.fillText(
        'Find a world and join instantly',
        centerX,
        panelY + 78
    );

    const rowX = panelX + 35;
    const rowW = panelW - 70;
    const rowH = 54;
    const rowGap = 8;
    const listY = panelY + 100;

    if (roomCount === 0) {
        ctx.fillStyle = '#68727b';
        ctx.font = '15px sans-serif';
        ctx.fillText(
            'No open worlds found. Host one to get started.',
            centerX,
            listY + 35
        );
    } else {
        rooms.forEach((room, index) => {
            const y = listY + index * (rowH + rowGap);
            const selected = selection === index;
            const players = Number(room?.players ?? 0);
            const maxPlayers = Number(room?.maxPlayers ?? 8);
            const name = room?.roomName || 'Unnamed World';
            const world = room?.world || 'overworld';
            const region = room?.region || '';

            ctx.fillStyle = selected
                ? 'rgba(70, 130, 180, 0.85)'
                : 'rgba(25, 28, 33, 0.95)';
            ctx.fillRect(rowX, y, rowW, rowH);

            ctx.strokeStyle = selected
                ? '#9fd9ff'
                : '#58616a';
            ctx.lineWidth = selected ? 2.5 : 1;
            ctx.strokeRect(rowX, y, rowW, rowH);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText(name, rowX + 15, y + 22);

            ctx.fillStyle = '#9aa5ad';
            ctx.font = '12px sans-serif';
            ctx.fillText(
                `${world}${region ? `  •  ${region}` : ''}`,
                rowX + 15,
                y + 41
            );

            ctx.textAlign = 'right';
            ctx.fillStyle = players >= maxPlayers
                ? '#d46a6a'
                : '#9fd9ff';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(
                `${players}/${maxPlayers}`,
                rowX + rowW - 15,
                y + 31
            );
        });
    }

    const actionsY = listY + Math.max(roomCount, 1) * (rowH + rowGap) + 10;
    const actionGap = 10;
    const actionW = Math.min(250, (rowW - actionGap * 2) / 3);
    const actionH = 48;

    const actions = [
        ['REFRESH', refreshIndex],
        ['HOST WORLD', hostIndex],
        ['BACK', backIndex]
    ];

    actions.forEach(([label, index], actionIndex) => {
        const x = rowX + actionIndex * (actionW + actionGap);
        const selected = selection === index;

        ctx.fillStyle = selected
            ? 'rgba(70, 130, 180, 0.85)'
            : 'rgba(25, 28, 33, 0.95)';
        ctx.fillRect(x, actionsY, actionW, actionH);

        ctx.strokeStyle = selected
            ? '#9fd9ff'
            : '#58616a';
        ctx.lineWidth = selected ? 2.5 : 1;
        ctx.strokeRect(x, actionsY, actionW, actionH);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(
            label,
            x + actionW / 2,
            actionsY + 30
        );
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8d9a3';
    ctx.font = '13px sans-serif';
    ctx.fillText(
        multiplayer.notification || 'Select a world to join.',
        centerX,
        Math.min(panelY + panelH - 42, actionsY + actionH + 28)
    );

    ctx.fillStyle = '#68727b';
    ctx.font = '12px sans-serif';
    ctx.fillText(
        'Arrow keys / Enter  •  ESC to return',
        centerX,
        panelY + panelH - 20
    );

    ctx.textAlign = 'left';
}

export function drawHUD(ctx, innerWidth, innerHeight, playerX, playerY) {
    const { player, quest, multiplayer, currentWorld, ui } = gameState;

    const isDungeon = currentWorld === 'dungeon';
    const dungeon = isDungeon ? getDungeonState() : null;

    // ==========================================
    // 1. TOP-LEFT: STATUS PANEL
    // ==========================================
    const statusW = 300;
    const statusH = 82;
    const padding = 15;

    ctx.fillStyle = 'rgba(0,0,0,.72)';
    ctx.fillRect(padding, padding, statusW, statusH);

    if (isDungeon) {
        ctx.strokeStyle = 'rgba(212,175,55,.45)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(padding, padding, statusW, statusH);
    }

    ctx.fillStyle = isDungeon ? '#e8d9a8' : '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(isDungeon ? `DUNGEON • LVL ${dungeon.level}` : 'ZACKSGAME005', padding + 12, padding + 25);

    // Hearts
    for (let i = 0; i < player.maxHP; i++) {
        const hx = padding + 12 + i * 22;
        const hy = padding + 40;
        ctx.fillStyle = i < player.hp ? '#ff5577' : '#333';
        ctx.beginPath();
        ctx.arc(hx + 4, hy + 4, 4.5, 0, Math.PI * 2);
        ctx.arc(hx + 11, hy + 4, 4.5, 0, Math.PI * 2);
        ctx.moveTo(hx + 0.5, hy + 6);
        ctx.lineTo(hx + 7.5, hy + 13);
        ctx.lineTo(hx + 14.5, hy + 6);
        ctx.fill();
    }

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#ddd';
    ctx.fillText(`Gold: ${player.coins}`, padding + 12, padding + 70);
    ctx.fillText(`Weapon: ${player.steelSword ? 'Steel' : (player.swordPickedUp ? 'Old' : 'None')}`, padding + 130, padding + 70);

    // ==========================================
    // 2. TOP-LEFT: QUEST PANEL + COMPASS
    // ==========================================
    const questX = padding;
    const questY = padding + statusH + 8;
    const questW = 300;
    const compassRadius = 26;
    const compassPadding = 10;
    const textMaxWidth = questW - (compassRadius * 2 + compassPadding * 3);

    ctx.save();
    ctx.font = 'bold 13px sans-serif';
    const questText = 'Quest: ' + (QUEST_TEXT[quest.state] || quest.state);

    // Measure text height to adjust panel height if needed
    const textHeight = drawTextWrapped(ctx, questText, 0, 0, textMaxWidth, 16, 'left', true);
    const qHeight = Math.max(compassRadius * 2 + 20, textHeight + 20);

    ctx.fillStyle = 'rgba(0,0,0,.72)';
    ctx.fillRect(questX, questY, questW, qHeight);

    ctx.fillStyle = '#fff';
    drawTextWrapped(ctx, questText, questX + 12, questY + 16, textMaxWidth, 16);

    // COMPASS CENTER
    const cx = questX + questW - compassRadius - compassPadding;
    const cy = questY + qHeight / 2;

    // Dial background
    ctx.beginPath();
    ctx.arc(cx, cy, compassRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Labels N S E W
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('N', cx, cy - compassRadius + 5);
    ctx.fillText('S', cx, cy + compassRadius - 5);
    ctx.fillText('E', cx + compassRadius - 5, cy);
    ctx.fillText('W', cx - compassRadius + 5, cy);

    // 1. DIRECTION NEEDLE (Bold Black - North)
    ctx.save();
    ctx.translate(cx, cy);
    // In our top-down coordinate system, North is -Y (0 radians is East, -PI/2 is North)
    // For the UI compass, we treat UP as North.
    ctx.beginPath();
    ctx.moveTo(0, -compassRadius + 8); // Tip
    ctx.lineTo(4, 0); // Base right
    ctx.lineTo(-4, 0); // Base left
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();

    // 2. QUEST NEEDLE (Thin Golden)
    const stage = getQuestStage();
    if (stage && stage.targetX != null) {
        let tx = stage.targetX;
        let ty = stage.targetY;
        let targetWorld = stage.world;

        // Prioritize closest uncollected diamond in the dungeon
        if (currentWorld === 'dungeon' && player.dungeonDiamonds < 2) {
            const dState = getDungeonState();
            const diamonds = [
                { id: 1, x: 22, y: 81 },
                { id: 2, x: 104, y: 69 }
            ];

            let closest = null;
            let minDist = Infinity;

            for (const d of diamonds) {
                const item = dState.doors['diamond' + d.id];
                if (item && !item.collected) {
                    const distToD = Math.hypot(playerX - d.x, playerY - d.y);
                    if (distToD < minDist) {
                        minDist = distToD;
                        closest = d;
                    }
                }
            }

            if (closest) {
                tx = closest.x;
                ty = closest.y;
                targetWorld = 'dungeon';
            }
        }

        // Cross-world logic: point to transitions
        if (targetWorld !== currentWorld) {
            if (currentWorld === 'overworld') {
                // Point to cave entrance
                tx = 67; ty = 49;
            } else {
                // Point to dungeon exit (level 1 entrance at 61, 116)
                tx = 61; ty = 116;
            }
        }

        const angle = Math.atan2(ty - playerY, tx - playerX);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle + Math.PI/2); // Align arrow tip with target direction

        // Needle Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 2;

        ctx.beginPath();
        ctx.moveTo(0, -compassRadius + 6); // Sharper tip
        ctx.lineTo(2, 0);
        ctx.lineTo(-2, 0);
        ctx.closePath();
        ctx.fillStyle = '#ffd700'; // GOLD
        ctx.fill();

        // Center Pin
        ctx.beginPath();
        ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.restore();
    }

    ctx.restore();

    // ==========================================
    // 3. CONTEXT PANEL: DUNGEON EXTRAS
    // ==========================================
    if (isDungeon) {
        const extraX = padding;
        const extraY = questY + qHeight + 8;
        const extraW = 300;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.72)';

        const hasMessage = dungeon && dungeon.message;
        let msgH = 35;
        if (hasMessage) {
            ctx.font = 'italic 12px sans-serif';
            msgH = drawTextWrapped(ctx, dungeon.message, 0, 0, extraW - 24, 15, 'left', true) + 25;
        }

        ctx.fillRect(extraX, extraY, extraW, msgH);
        ctx.strokeStyle = 'rgba(212,175,55,.45)';
        ctx.strokeRect(extraX, extraY, extraW, msgH);

        ctx.fillStyle = '#b9f7ff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`Diamonds: ${player.dungeonDiamonds || 0}/2`, extraX + 12, extraY + 18);

        if (hasMessage) {
            ctx.fillStyle = '#d8d0bf';
            ctx.font = 'italic 12px sans-serif';
            drawTextWrapped(ctx, dungeon.message, extraX + 12, extraY + 38, extraW - 24, 15);
        }
        ctx.restore();
    }

    // ==========================================
    // 3. BOTTOM-CENTER: DEBUG / TILE INFO
    // ==========================================
    const tx = Math.floor(player.x);
    const ty = Math.floor(player.y);
    let tileName = 'Unknown';
    if (inside(tx, ty)) {
        const typeId = map[ty][tx];
        tileName = Object.keys(TILE_TYPES).find(k => TILE_TYPES[k] === typeId) || 'Unknown';
    }

    const infoText = `Pos: [${tx}, ${ty}] - ${tileName}`;
    ctx.font = 'bold 13px monospace';
    const textW = ctx.measureText(infoText).width;
    const centerX = innerWidth / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(centerX - textW / 2 - 10, innerHeight - 40, textW + 20, 25);
    ctx.fillStyle = '#0f0';
    ctx.textAlign = 'center';
    ctx.fillText(infoText, centerX, innerHeight - 23);
    ctx.textAlign = 'left';

    // ==========================================
    // 4. BOTTOM-LEFT: CONTROLS & NOTIFICATIONS
    // ==========================================
    const controlY = innerHeight - 65;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px sans-serif';
    const moveHint = gameState.touch.active ? 'Drag to Move' : 'WASD = Move';
    const interactHint = gameState.touch.active ? 'Tap = Interact' : 'E = Interact';
    ctx.fillText(`${moveHint} | ${interactHint} | P = Save`, padding + 5, controlY);

    drawNotifications(ctx, innerWidth, innerHeight);

    // ==========================================
    // 5. TOUCH JOYSTICK OVERLAY
    // ==========================================
    if (gameState.touch.active && !ui.paused) {
        const { startX, startY, currentX, currentY } = gameState.touch;

        ctx.beginPath();
        ctx.arc(startX, startY, 40, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(currentX, currentY, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }

    // ==========================================
    // 6. PAUSE BUTTON (Mobile)
    // ==========================================
    if (gameState.touch.active || true) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(innerWidth - 50, 10, 40, 40);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(innerWidth - 50, 10, 40, 40);

        ctx.fillStyle = '#fff';
        if (ui.paused) {
             ctx.beginPath();
             ctx.moveTo(innerWidth - 38, 20);
             ctx.lineTo(innerWidth - 38, 40);
             ctx.lineTo(innerWidth - 20, 30);
             ctx.fill();
        } else {
            ctx.fillRect(innerWidth - 38, 22, 6, 16);
            ctx.fillRect(innerWidth - 28, 22, 6, 16);
        }
    }

    // ==========================================
    // 7. TOP-RIGHT: MULTIPLAYER
    // ==========================================
    if (multiplayer.roomId) {
        const rightBoxW = 260;
        const rightBoxH = 85;
        const rightBoxX = innerWidth - rightBoxW - padding;
        const rightBoxY = padding;

        ctx.fillStyle = 'rgba(0,0,0,.75)';
        ctx.fillRect(rightBoxX, rightBoxY, rightBoxW, rightBoxH);
        ctx.strokeStyle = '#4682b4';
        ctx.strokeRect(rightBoxX, rightBoxY, rightBoxW, rightBoxH);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('MULTIPLAYER', rightBoxX + 12, rightBoxY + 20);

        ctx.font = '11px monospace';
        ctx.fillStyle = '#fff';
        const myId = multiplayer.id ? multiplayer.id.substring(0, 12) + '...' : 'Unknown';
        ctx.fillText(`ID: ${myId}`, rightBoxX + 12, rightBoxY + 38);
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Status: ${multiplayer.status}`, rightBoxX + 12, rightBoxY + 54);
        ctx.fillStyle = '#e8d9a3';
        ctx.fillText(multiplayer.roomName || 'Multiplayer World', rightBoxX + 12, rightBoxY + 70);
    }
}

export function drawNotifications(ctx, innerWidth, innerHeight) {
    const { notifications } = gameState;
    if (!notifications.length) return;

    const padding = 15;
    const x = padding + 5;
    let y = innerHeight - 85;

    notifications.forEach(n => {
        ctx.save();
        ctx.globalAlpha = n.alpha;

        const colors = {
            info: '#ffffff',
            success: '#ffd700',
            danger: '#ff3333'
        };

        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';

        const maxWidth = Math.min(300, innerWidth * 0.4);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        const linesHeight = drawTextWrapped(ctx, n.text, x + 1, y + 1, maxWidth, 15, 'left');

        ctx.fillStyle = colors[n.type] || colors.info;
        drawTextWrapped(ctx, n.text, x, y, maxWidth, 15, 'left');

        y -= (linesHeight + 5); // Stack upwards
        ctx.restore();
    });
}

export function drawStore(ctx, innerWidth, innerHeight) {
    const { ui, player } = gameState;
    if (!ui.storeOpen) return;

    const w = Math.min(560, innerWidth - 40);
    const h = Math.min(360, innerHeight - 40);
    const x = (innerWidth - w) / 2;
    const y = (innerHeight - h) / 2;

    ctx.fillStyle = 'rgba(12,12,12,.97)';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = '#c8b08a';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#e9dcc7';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('VILLAGE STORE', x + 28, y + 45);

    ctx.fillStyle = '#fff';
    ctx.font = '17px sans-serif';
    ctx.fillText('Gold: ' + player.coins, x + 28, y + 78);

    ctx.fillStyle = '#806448';
    ctx.fillRect(x + 28, y + 105, w - 56, 88);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText('Steel Sword', x + 48, y + 135);

    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.fillText('Damage: 2', x + 48, y + 160);
    ctx.fillText('Price: 50 gold', x + 48, y + 181);

    ctx.fillStyle = player.steelSword ? '#777' : '#a78650';
    ctx.fillRect(x + w - 170, y + 125, 110, 45);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
        player.steelSword ? 'OWNED' : 'Press E',
        x + w - 115,
        y + 153
    );
    ctx.textAlign = 'left';

    ctx.fillStyle = '#aaa';
    ctx.font = '14px sans-serif';
    ctx.fillText('B = close store', x + 28, y + h - 30);

    if (ui.storeMessage) {
        ctx.fillStyle = '#e8d9a3';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(
            ui.storeMessage,
            x + 28,
            y + h - 58
        );
    }
}

export function drawDialogue(ctx, innerWidth, innerHeight) {
    const { ui } = gameState;
    if (!ui.dialogueOpen || !ui.activeNPC) return;

    const boxW = Math.min(innerWidth - 40, 760);
    const boxX = (innerWidth - boxW) / 2;

    // Calculate required height
    ctx.save();
    ctx.font = '16px sans-serif';
    const textHeight = drawTextWrapped(ctx, ui.activeNPC.dialogue, 0, 0, boxW - 40, 22, 'left', true);
    ctx.restore();

    const boxH = Math.max(145, 65 + textHeight + 60);
    const boxY = innerHeight - boxH - 25;

    ctx.fillStyle = 'rgba(10,10,10,.95)';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = '#b6a58c';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#b6a58c';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(
        ui.activeNPC.name,
        boxX + 20,
        boxY + 30
    );

    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    drawTextWrapped(ctx, ui.activeNPC.dialogue, boxX + 20, boxY + 65, boxW - 40, 22);

    ctx.fillStyle = '#888';
    ctx.font = '13px sans-serif';
    ctx.fillText(
        'Press E to close',
        boxX + 20,
        boxY + boxH - 20
    );
}

export function drawDeathScreen(ctx, innerWidth, innerHeight) {
    const { ui } = gameState;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const selection = Number.isInteger(ui.menuSelection) ? ui.menuSelection : 0;

    // Dark reddish overlay
    ctx.fillStyle = 'rgba(30, 0, 0, 0.85)';
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    // Title
    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 82px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('YOU DIED!', centerX, centerY - 120);

    const buttons = ['CONTINUE', 'NEW GAME'];
    const buttonW = 320;
    const buttonH = 60;
    const gap = 20;
    const startY = centerY + 10;

    buttons.forEach((label, index) => {
        const y = startY + index * (buttonH + gap);
        const selected = selection === index;

        ctx.fillStyle = selected ? 'rgba(200, 30, 30, 0.9)' : 'rgba(40, 10, 10, 0.95)';
        ctx.fillRect(centerX - buttonW / 2, y, buttonW, buttonH);

        ctx.strokeStyle = selected ? '#ffaaaa' : '#551111';
        ctx.lineWidth = selected ? 3 : 1;
        ctx.strokeRect(centerX - buttonW / 2, y, buttonW, buttonH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(label, centerX, y + 38);
    });

    ctx.fillStyle = '#886666';
    ctx.font = '14px sans-serif';
    drawTextWrapped(ctx, 'Continue to respawn at a safe location.', centerX, startY + (buttonH + gap) * 2 + 30, innerWidth - 40, 18, 'center');

    ctx.textAlign = 'left';
}

export function drawPauseMenu(ctx, innerWidth, innerHeight) {
    const { ui } = gameState;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const selection = Number.isInteger(ui.menuSelection) ? ui.menuSelection : 0;

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    // Title
    ctx.fillStyle = '#e8d9a3';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', centerX, centerY - 100);

    const buttons = ['RESUME', 'QUIT TO MENU'];
    const buttonW = 320;
    const buttonH = 60;
    const gap = 20;
    const startY = centerY + 10;

    buttons.forEach((label, index) => {
        const y = startY + index * (buttonH + gap);
        const selected = selection === index;

        ctx.fillStyle = selected ? 'rgba(70, 130, 180, 0.9)' : 'rgba(25, 28, 33, 0.95)';
        ctx.fillRect(centerX - buttonW / 2, y, buttonW, buttonH);

        ctx.strokeStyle = selected ? '#9fd9ff' : '#58616a';
        ctx.lineWidth = selected ? 3 : 1;
        ctx.strokeRect(centerX - buttonW / 2, y, buttonW, buttonH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(label, centerX, y + 38);
    });

    ctx.textAlign = 'left';
}
