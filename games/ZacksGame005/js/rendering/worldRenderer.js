import { W, H, T, COLORS, TILE_TYPES } from '../config.js';
import { gameState } from '../state/gameState.js';
import { map, inside } from '../world/map.js';

export function drawWorld(ctx, camera, scale, innerWidth, innerHeight) {
    const screenX = innerWidth / 2;
    const screenY = innerHeight / 2;

    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const px = screenX + (x - camera.x) * T * scale;
        const py = screenY + (y - camera.y) * T * scale;
        const sz = T * scale;

        if (px + sz < 0 || py + sz < 0 || px > innerWidth || py > innerHeight) continue;

        const tileType = map[y][x];
        if (tileType === TILE_TYPES.HiddenPassage) {
            ctx.fillStyle = COLORS[TILE_TYPES.Void];
        } else if (tileType === TILE_TYPES.Decoration) {
            ctx.fillStyle = COLORS[TILE_TYPES.Grass];
        } else {
            ctx.fillStyle = COLORS[tileType] ?? COLORS[TILE_TYPES.Void];
        }
        ctx.fillRect(px, py, sz + 1, sz + 1);

        if (tileType === TILE_TYPES.Water) {
            ctx.strokeStyle = 'rgba(255,255,255,.035)';
            ctx.beginPath();
            ctx.moveTo(px + 5 * scale, py + 15 * scale);
            ctx.lineTo(px + 20 * scale, py + 15 * scale);
            ctx.stroke();
        }

        if (tileType === TILE_TYPES.Mountain) {
            ctx.fillStyle = 'rgba(255,255,255,.05)';
            ctx.beginPath();
            ctx.moveTo(px + 6 * scale, py + 26 * scale);
            ctx.lineTo(px + 16 * scale, py + 6 * scale);
            ctx.lineTo(px + 28 * scale, py + 26 * scale);
            ctx.fill();
        }

        if (tileType === TILE_TYPES.Building) {
            ctx.fillStyle = 'rgba(0,0,0,.15)';
            ctx.fillRect(px + 2 * scale, py + 2 * scale, sz - 4 * scale, sz - 4 * scale);
            ctx.strokeStyle = 'rgba(255,255,255,.05)';
            ctx.strokeRect(px + 1 * scale, py + 1 * scale, sz - 2 * scale, sz - 2 * scale);
        }

        if (tileType === TILE_TYPES.Crypt) {
            drawCrypt(ctx, px, py, sz, scale, x, y);
        }

        if (tileType === TILE_TYPES.Door) {
            ctx.fillStyle = '#3d2a1d';
            ctx.fillRect(px + 4 * scale, py + 2 * scale, sz - 8 * scale, sz - 2 * scale);
            ctx.fillStyle = '#d4af37';
            ctx.beginPath();
            ctx.arc(px + sz - 6 * scale, py + sz / 2 + 2 * scale, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        if (tileType === TILE_TYPES.Cave) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(px + sz / 2, py + sz / 2, sz / 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.stroke();
        }

        if (tileType === TILE_TYPES.Torch) {
            ctx.fillStyle = '#4b321e';
            ctx.fillRect(px + sz * .43, py + sz * .42, sz * .14, sz * .4);
            const flicker = .75 + Math.sin(performance.now() * .01 + x * 1.7 + y) * .15;
            ctx.save();
            ctx.globalAlpha = flicker;
            ctx.fillStyle = '#ffbd45';
            ctx.beginPath();
            ctx.arc(px + sz / 2, py + sz * .32, sz * .13, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff0a6';
            ctx.beginPath();
            ctx.arc(px + sz / 2, py + sz * .3, sz * .055, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (tileType === TILE_TYPES.Diamond) {
            const pulse = 0.9 + Math.sin(performance.now() * 0.006 + x) * 0.1;
            ctx.save();
            ctx.translate(px + sz / 2, py + sz / 2);
            ctx.rotate(Math.PI / 4);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = '#b9f7ff';
            ctx.fillRect(-sz * .19, -sz * .19, sz * .38, sz * .38);
            ctx.restore();
        }

        if (tileType === TILE_TYPES.Sign) {
            ctx.fillStyle = '#4a321e'; // Post
            ctx.fillRect(px + sz * .43, py + sz * .5, sz * .14, sz * .4);
            ctx.fillStyle = '#8b5e3c'; // Board
            ctx.fillRect(px + sz * .15, py + sz * .2, sz * .7, sz * .4);
            ctx.strokeStyle = '#5a3b18';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + sz * .15, py + sz * .2, sz * .7, sz * .4);
        }

        if (tileType === TILE_TYPES.Chest) {
            ctx.fillStyle = '#5d3b2a'; // Main wood
            ctx.fillRect(px + sz * .15, py + sz * .3, sz * .7, sz * .55);
            ctx.fillStyle = '#7a5a40'; // Lid highlight
            ctx.fillRect(px + sz * .15, py + sz * .3, sz * .7, sz * .2);
            ctx.fillStyle = '#c5a044'; // Lock
            ctx.fillRect(px + sz * .43, py + sz * .45, sz * .14, sz * .14);
            ctx.strokeStyle = '#3d2518';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px + sz * .15, py + sz * .3, sz * .7, sz * .55);
        }

        if (tileType === TILE_TYPES.Spike) {
            const isActive = gameState.world.trapsActive;
            ctx.fillStyle = isActive ? '#555' : '#111'; // Black when safe
            ctx.fillRect(px, py, sz, sz);

            if (isActive) {
                ctx.fillStyle = '#999';
                // Draw sharp spikes only if active
                for (let i = 0; i < 3; i++) {
                    const ox = (i + 0.5) * (sz / 3);
                    ctx.beginPath();
                    ctx.moveTo(px + ox, py + sz * 0.2);
                    ctx.lineTo(px + ox - sz * 0.15, py + sz * 0.8);
                    ctx.lineTo(px + ox + sz * 0.15, py + sz * 0.8);
                    ctx.fill();
                }
            }
        }
    }
}

function drawCrypt(ctx, px, py, sz, scale, x, y) {
    const inset = 3 * scale;
    const top = py + 5 * scale;
    const left = px + inset;
    const width = sz - inset * 2;
    const height = sz - 8 * scale;

    ctx.fillStyle = '#252322';
    ctx.fillRect(left, top, width, height);

    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.fillRect(left + 2 * scale, top + 2 * scale, width - 4 * scale, 3 * scale);

    ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.lineWidth = Math.max(1, scale * 1.2);
    ctx.strokeRect(left, top, width, height);

    ctx.strokeStyle = 'rgba(180,170,155,.2)';
    ctx.beginPath();
    ctx.moveTo(px + sz * .5, top + 6 * scale);
    ctx.lineTo(px + sz * .5, py + sz - 6 * scale);
    ctx.stroke();

    ctx.fillStyle = 'rgba(212,175,55,.22)';
    ctx.fillRect(px + sz * .44, py + sz * .28, sz * .12, sz * .07);
    ctx.fillRect(px + sz * .47, py + sz * .25, sz * .06, sz * .13);

    const worn = ((x * 17 + y * 31) % 3) * .02;
    ctx.fillStyle = `rgba(0,0,0,${.16 + worn})`;
    ctx.fillRect(left + 4 * scale, py + sz - 7 * scale, width - 8 * scale, 3 * scale);
}

export function drawRoofs(ctx, camera, scale, innerWidth, innerHeight, playerPos) {
    const screenX = innerWidth / 2;
    const screenY = innerHeight / 2;
    const tx = Math.floor(playerPos.x);
    const ty = Math.floor(playerPos.y);

    const currentTile = inside(tx, ty) ? map[ty][tx] : TILE_TYPES.Void;
    const isInside =
        currentTile === TILE_TYPES.Floor ||
        currentTile === TILE_TYPES.Torch ||
        currentTile === TILE_TYPES.Diamond ||
        currentTile === TILE_TYPES.Crypt ||
        currentTile === TILE_TYPES.Chest ||
        currentTile === TILE_TYPES.Spike;

    if (isInside || currentTile === TILE_TYPES.HiddenPassage) return;

    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const tile = map[y][x];

        // Render a roof if it's a Floor tile, OR if it's an interactive tile surrounded by Floor/Buildings
        let shouldHaveRoof = (tile === TILE_TYPES.Floor);

        if (!shouldHaveRoof && (tile === TILE_TYPES.Chest || tile === TILE_TYPES.Spike || tile === TILE_TYPES.Torch)) {
            // Check neighbors to see if this is an "Indoor" version of the item
            if (inside(x, y-1) && (map[y-1][x] === TILE_TYPES.Floor || map[y-1][x] === TILE_TYPES.Building)) shouldHaveRoof = true;
            else if (inside(x, y+1) && (map[y+1][x] === TILE_TYPES.Floor || map[y+1][x] === TILE_TYPES.Building)) shouldHaveRoof = true;
        }

        if (!shouldHaveRoof) continue;

        const px = screenX + (x - camera.x) * T * scale;
        const py = screenY + (y - camera.y) * T * scale;
        const sz = T * scale;

        if (px + sz < 0 || py + sz < 0 || px > innerWidth || py > innerHeight) continue;

        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(px - 1, py - 1, sz + 2, sz + 2);
        ctx.fillStyle = 'rgba(0,0,0,.1)';
        ctx.fillRect(px, py + sz / 2, sz, sz / 2);
    }
}

export function drawDecorations(ctx, camera, scale, innerWidth, innerHeight, playerPos = null) {
    const screenX = innerWidth / 2;
    const screenY = innerHeight / 2;

    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (map[y][x] !== TILE_TYPES.Decoration) continue;

        const px = screenX + (x - camera.x) * T * scale;
        const py = screenY + (y - camera.y) * T * scale;
        const sz = T * scale;

        if (px + sz < 0 || py + sz < 0 || px > innerWidth || py > innerHeight) continue;

        const treeX = px + sz / 2;
        const treeY = py + sz / 2;
        const treeScale = 2.5;
        const foliageRadius = 12 * scale * treeScale;

        let alpha = 1.0;
        if (playerPos) {
            const dx = playerPos.x - x;
            const dy = playerPos.y - y;
            if (Math.hypot(dx, dy) < 1.2) alpha = 0.5;
        }

        ctx.fillStyle = '#4a3929';
        ctx.fillRect(treeX - 3 * scale, treeY + 2 * scale, 6 * scale, 12 * scale);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#202a20';
        ctx.beginPath();
        ctx.arc(treeX, treeY - 8 * scale, foliageRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


