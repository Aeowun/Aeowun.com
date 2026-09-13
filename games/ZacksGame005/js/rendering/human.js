export function drawHuman(ctx, x, y, scale, options = {}) {
    const skin = options.skin || "#c58f6b";
    const hair = options.hair || "#3a261c";
    const shirt = options.shirt || "#5b6870";
    const pants = options.pants || "#252b31";
    const moving = !!options.moving;
    const animTime = options.animTime || 0;
    const facing = options.facing || 'down';

    // RESTORED AMPLITUDE
    const cycle = moving ? Math.sin(animTime) : 0;
    const bob = moving ? Math.abs(Math.sin(animTime)) * 2 * scale : 0;
    const legSwing = cycle * 0.6;
    const armSwing = cycle * 0.5;

    const ox = x;
    const oy = y - bob;

    ctx.save();

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,.32)";
    ctx.beginPath();
    ctx.ellipse(x, y + 12 * scale, 8 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(ox, oy);

    // Legs
    ctx.fillStyle = pants;
    const hipWidth = 3.5 * scale;

    if (facing === 'left' || facing === 'right') {
        // SIDE VIEW: Leg rotation is correct here
        const sideLegShift = facing === 'left' ? -1.5 * scale : 1.5 * scale;
        ctx.save();
        ctx.translate(sideLegShift, 4 * scale);
        ctx.rotate(legSwing);
        ctx.fillRect(-2 * scale, 0, 4 * scale, 9 * scale);
        ctx.restore();

        ctx.save();
        ctx.translate(sideLegShift, 4 * scale);
        ctx.rotate(-legSwing);
        ctx.fillRect(-2 * scale, 0, 4 * scale, 9 * scale);
        ctx.restore();
    } else {
        // FRONT/BACK VIEW: NO ROTATION (No Scissoring)
        // Instead, we shift them vertically to simulate steps
        const lift = Math.abs(cycle) * 3 * scale;

        // Left Leg
        ctx.save();
        ctx.translate(-hipWidth, 4 * scale + (cycle > 0 ? -lift : 0));
        ctx.fillRect(-2 * scale, 0, 4 * scale, 9 * scale);
        ctx.restore();

        // Right Leg
        ctx.save();
        ctx.translate(hipWidth, 4 * scale + (cycle < 0 ? -lift : 0));
        ctx.fillRect(-2 * scale, 0, 4 * scale, 9 * scale);
        ctx.restore();
    }

    // Body
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-7 * scale, -5 * scale, 14 * scale, 12 * scale, 3 * scale);
    ctx.fill();

    // Arms
    ctx.fillStyle = skin;
    if (facing === 'down' || facing === 'up') {
        // FRONT/BACK VIEW: Shift vertically or scale, no sideways swing
        const handLift = Math.abs(cycle) * 2 * scale;

        ctx.save();
        ctx.translate(-8.5 * scale, 0 + (cycle < 0 ? -handLift : 0));
        ctx.fillRect(-2 * scale, -3 * scale, 4 * scale, 9 * scale);
        ctx.beginPath();
        ctx.arc(0, 6 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(8.5 * scale, 0 + (cycle > 0 ? -handLift : 0));
        ctx.fillRect(-2 * scale, -3 * scale, 4 * scale, 9 * scale);
        ctx.beginPath();
        ctx.arc(0, 6 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else {
        // SIDE VIEW: Rotation is correct
        const armSide = facing === 'left' ? -7 * scale : 7 * scale;
        ctx.save();
        ctx.translate(armSide, 0);
        ctx.rotate(armSwing);
        ctx.fillRect(-2.5 * scale, -3 * scale, 5 * scale, 9 * scale);
        ctx.beginPath();
        ctx.arc(0, 6 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -12 * scale, 7.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = hair;
    if (facing === 'up') {
        ctx.beginPath();
        ctx.arc(0, -12 * scale, 7.7 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else if (facing === 'down') {
        ctx.beginPath();
        ctx.arc(0, -14 * scale, 7.7 * scale, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-7.5 * scale, -15 * scale, 2 * scale, 6 * scale);
        ctx.fillRect(5.5 * scale, -15 * scale, 2 * scale, 6 * scale);
    } else {
        const hairShift = facing === 'left' ? 2 * scale : -2 * scale;
        ctx.beginPath();
        ctx.arc(hairShift, -14 * scale, 7.7 * scale, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
    }

    // Face
    if (facing !== 'up') {
        ctx.fillStyle = "#171717";
        let eyeY = -12 * scale;
        if (facing === 'down') {
            ctx.beginPath();
            ctx.arc(-2.5 * scale, eyeY, scale, 0, Math.PI * 2);
            ctx.arc(2.5 * scale, eyeY, scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(80,30,25,.8)";
            ctx.lineWidth = Math.max(1, scale);
            ctx.beginPath();
            ctx.arc(0, -9 * scale, 2.5 * scale, 0.2, Math.PI - 0.2);
            ctx.stroke();
        } else if (facing === 'left') {
            ctx.beginPath();
            ctx.arc(-4.5 * scale, eyeY, scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(80,30,25,.8)";
            ctx.lineWidth = Math.max(1, scale);
            ctx.beginPath();
            ctx.arc(-4.5 * scale, -9 * scale, 2 * scale, 0.2, Math.PI * 0.6);
            ctx.stroke();
        } else if (facing === 'right') {
            ctx.beginPath();
            ctx.arc(4.5 * scale, eyeY, scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(80,30,25,.8)";
            ctx.lineWidth = Math.max(1, scale);
            ctx.beginPath();
            ctx.arc(4.5 * scale, -9 * scale, 2 * scale, Math.PI * 0.4, Math.PI - 0.2);
            ctx.stroke();
        }
    }

    ctx.restore();
    ctx.restore();
}
