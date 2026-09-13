export function drawEnemy(ctx, x, y, scale, enemy) {
    const bob = enemy.alive ? Math.abs(Math.sin(enemy.animTime)) * 1.5 * scale : 0;

    ctx.save();
    ctx.translate(x, y - bob);

    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.beginPath();
    ctx.ellipse(0, 14 * scale, 9 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.restore();

    const barWidth = 24 * scale;
    const barHeight = 3 * scale;
    const hpPercent = enemy.hp / enemy.maxHP;

    ctx.fillStyle = "rgba(0,0,0,.7)";
    ctx.fillRect(x - barWidth / 2, y - 22 * scale, barWidth, barHeight);
    ctx.fillStyle = "#d44848";
    ctx.fillRect(x - barWidth / 2, y - 22 * scale, barWidth * hpPercent, barHeight);
}
