export function drawSword(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y + Math.sin(performance.now() * .004) * 2 * scale);
    ctx.rotate(-.65);

    ctx.fillStyle = "#151515";
    ctx.fillRect(-2 * scale, 3 * scale, 4 * scale, 13 * scale);

    ctx.fillStyle = "#d7b35c";
    ctx.fillRect(-4 * scale, 1 * scale, 8 * scale, 2 * scale);

    ctx.fillStyle = "#dfe6ed";
    ctx.beginPath();
    ctx.moveTo(0, -16 * scale);
    ctx.lineTo(3 * scale, 1 * scale);
    ctx.lineTo(-3 * scale, 1 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(0, -14 * scale);
    ctx.lineTo(1.5 * scale, -1 * scale);
    ctx.stroke();

    ctx.restore();
}

export function drawArrow(ctx, x, y, scale, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Shaft
    ctx.strokeStyle = '#8b5e3c';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(-10 * scale, 0);
    ctx.lineTo(10 * scale, 0);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.moveTo(10 * scale, 0);
    ctx.lineTo(4 * scale, -4 * scale);
    ctx.lineTo(4 * scale, 4 * scale);
    ctx.fill();

    // Fletching
    ctx.fillStyle = '#fff';
    ctx.fillRect(-10 * scale, -2 * scale, 4 * scale, 4 * scale);

    ctx.restore();
}


export function drawAttack(ctx, x, y, scale, player) {
    if (player.attackTimer <= 0) return;

    const progress = 1 - player.attackTimer / .32;
    const angle = player.attackAngle + (-1.1 + progress * 2.2);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.strokeStyle = "rgba(235,235,235,.95)";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(0, 0, 21 * scale, -.9, .9);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.arc(0, 0, 24 * scale, -.8, .8);
    ctx.stroke();

    ctx.restore();
}


