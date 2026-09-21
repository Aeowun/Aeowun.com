export function drawEnemy(ctx, x, y, scale, enemy) {
    const type = enemy.type || 'demon';
    const bob = enemy.alive ? Math.abs(Math.sin(enemy.animTime)) * 1.5 * scale : 0;

    ctx.save();
    ctx.translate(x, y - bob);

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.beginPath();
    ctx.ellipse(0, 14 * scale, type === 'wolf' ? 12 * scale : 9 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'demon') {
        drawDemon(ctx, scale, enemy);
    } else if (type === 'wolf') {
        drawWolf(ctx, scale, enemy);
    } else if (type === 'bandit') {
        drawBandit(ctx, scale, enemy);
    } else if (type === 'ghost') {
        ctx.globalAlpha = 0.6;
        drawGhost(ctx, scale, enemy);
        ctx.globalAlpha = 1.0;
    } else if (type === 'drowned') {
        drawDrowned(ctx, scale, enemy);
    }

    ctx.restore();

    // Enemy Health: HEARTS
    const heartSpacing = 10 * scale;
    const startX = x - ((enemy.maxHP - 1) * heartSpacing) / 2;
    const heartY = y - 24 * scale;

    for (let i = 0; i < enemy.maxHP; i++) {
        const hx = startX + i * heartSpacing;
        ctx.fillStyle = i < enemy.hp ? '#ff5577' : '#333';

        // Miniature heart shape
        ctx.beginPath();
        const r = 2.5 * scale;
        ctx.arc(hx - r * 0.7, heartY, r, 0, Math.PI * 2);
        ctx.arc(hx + r * 0.7, heartY, r, 0, Math.PI * 2);
        ctx.moveTo(hx - r * 1.4, heartY + r * 0.5);
        ctx.lineTo(hx, heartY + r * 2.2);
        ctx.lineTo(hx + r * 1.4, heartY + r * 0.5);
        ctx.fill();
    }

    // ATTACK METER (Under hearts)
    if (enemy.attackMeter > 0) {
        const meterW = 24 * scale;
        const meterH = 3 * scale;
        ctx.fillStyle = 'rgba(0,0,0,.7)';
        ctx.fillRect(x - meterW / 2, y - 18 * scale, meterW, meterH);
        ctx.fillStyle = '#ffd700'; // GOLD
        ctx.fillRect(x - meterW / 2, y - 18 * scale, meterW * enemy.attackMeter, meterH);
    }
}

function drawDemon(ctx, scale, enemy) {
    ctx.fillStyle = enemy.hitFlash > 0 ? "#fff" : "#7d332f";
    ctx.beginPath();
    ctx.arc(0, -4 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#57201d";
    ctx.fillRect(-10 * scale, -2 * scale, 5 * scale, 10 * scale);
    ctx.fillRect(5 * scale, -2 * scale, 5 * scale, 10 * scale);

    ctx.fillStyle = "#251818";
    ctx.fillRect(-7 * scale, 4 * scale, 5 * scale, 9 * scale);
    ctx.fillRect(2 * scale, 4 * scale, 5 * scale, 9 * scale);

    ctx.fillStyle = "#151515";
    ctx.beginPath();
    ctx.arc(-3 * scale, -5 * scale, 1.3 * scale, 0, Math.PI * 2);
    ctx.arc(3 * scale, -5 * scale, 1.3 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d6d6d6";
    ctx.beginPath();
    ctx.moveTo(-7 * scale, -10 * scale);
    ctx.lineTo(-4 * scale, -17 * scale);
    ctx.lineTo(-1 * scale, -10 * scale);
    ctx.moveTo(1 * scale, -10 * scale);
    ctx.lineTo(4 * scale, -17 * scale);
    ctx.lineTo(7 * scale, -10 * scale);
    ctx.fill();

    ctx.fillStyle = "#171717";
    ctx.fillRect(-4 * scale, 0, 8 * scale, 2 * scale);
}

function drawWolf(ctx, scale, enemy) {
    ctx.fillStyle = enemy.hitFlash > 0 ? "#fff" : "#555";
    // Body
    ctx.fillRect(-12 * scale, 2 * scale, 24 * scale, 8 * scale);
    // Head
    ctx.beginPath();
    ctx.arc(10 * scale, 0, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.moveTo(6 * scale, -4 * scale);
    ctx.lineTo(8 * scale, -10 * scale);
    ctx.lineTo(10 * scale, -4 * scale);
    ctx.fill();
    // Tail
    ctx.fillStyle = "#444";
    ctx.fillRect(-16 * scale, 4 * scale, 6 * scale, 3 * scale);
}

function drawBandit(ctx, scale, enemy) {
    ctx.fillStyle = enemy.hitFlash > 0 ? "#fff" : "#b97855"; // Skin
    ctx.beginPath();
    ctx.arc(0, -6 * scale, 7 * scale, 0, Math.PI * 2);
    ctx.fill();
    // Bandana
    ctx.fillStyle = "#700";
    ctx.fillRect(-8 * scale, -10 * scale, 16 * scale, 4 * scale);
    // Shirt
    ctx.fillStyle = "#333";
    ctx.fillRect(-8 * scale, 1 * scale, 16 * scale, 12 * scale);
}

function drawGhost(ctx, scale, enemy) {
    ctx.fillStyle = enemy.hitFlash > 0 ? "#fff" : "#0ff";
    ctx.beginPath();
    ctx.arc(0, -4 * scale, 10 * scale, 0, Math.PI); // Top half
    ctx.fill();
    ctx.fillRect(-10 * scale, -4 * scale, 20 * scale, 14 * scale); // Bottom rect
    // Eyes
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-4 * scale, -4 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.arc(4 * scale, -4 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
}

function drawDrowned(ctx, scale, enemy) {
    ctx.fillStyle = enemy.hitFlash > 0 ? "#fff" : "#2a4d4a";
    ctx.beginPath();
    ctx.arc(0, -4 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();
    // Seaweed bits
    ctx.fillStyle = "#1e332c";
    ctx.fillRect(-4 * scale, -14 * scale, 2 * scale, 8 * scale);
    ctx.fillRect(2 * scale, -12 * scale, 2 * scale, 6 * scale);
    // Body
    ctx.fillStyle = "#355e5a";
    ctx.fillRect(-8 * scale, 5 * scale, 16 * scale, 10 * scale);
}
