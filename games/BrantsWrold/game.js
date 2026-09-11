(function () {
  'use strict';

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var starsEl = document.getElementById('stars');
  var robotsEl = document.getElementById('robots');
  var energyEl = document.getElementById('energy');
  var energyText = document.getElementById('energyText');
  var joystick = document.getElementById('joystick');
  var stick = document.getElementById('stick');
  var message = document.getElementById('message');
  var messageTitle = document.getElementById('messageTitle');
  var messageText = document.getElementById('messageText');
  var playAgain = document.getElementById('playAgain');

  var W = 0;
  var H = 0;
  var dpr = 1;
  var world = { w: 5200, h: 3400 };
  var player = {
    x: 2600,
    y: 1700,
    r: 28,
    speed: 330,
    energy: 100,
    stars: 0
  };
  var camera = { x: 2600, y: 1700 };
  var crystals = [];
  var robots = [];
  var enemies = [];
  var particles = [];
  var burstCooldown = 0;
  var damageCooldown = 0;
  var paused = false;
  var won = false;
  var lost = false;
  var joyPointer = null;
  var input = { x: 0, y: 0, keys: {} };

  var planets = [
    { x: 700, y: 600, r: 210, color: '#304f9e', ring: '#86d9ff', alpha: 0.9 },
    { x: 4350, y: 720, r: 280, color: '#713d83', ring: '#f4a6ff', alpha: 0.78 },
    { x: 1150, y: 2900, r: 250, color: '#8b5b38', ring: '#ffd28a', alpha: 0.82 },
    { x: 4500, y: 2800, r: 180, color: '#2c8b72', ring: '#8fffe0', alpha: 0.88 }
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resetJoystick() {
    input.x = 0;
    input.y = 0;
    stick.style.transform = 'translate(0px, 0px)';
    joyPointer = null;
  }

  function updateHud() {
    var rescued = robots.filter(function (robot) {
      return robot.rescued;
    }).length;

    starsEl.textContent = player.stars;
    robotsEl.textContent = rescued + '/8';
    energyText.textContent = Math.round(player.energy);
    energyEl.style.width = Math.max(0, player.energy) + '%';
  }

  function spawn() {
    crystals = [];
    robots = [];
    enemies = [];
    particles = [];

    for (var i = 0; i < 48; i++) {
      crystals.push({
        x: rand(120, world.w - 120),
        y: rand(120, world.h - 120),
        phase: rand(0, Math.PI * 2)
      });
    }

    for (var j = 0; j < 8; j++) {
      robots.push({
        x: rand(250, world.w - 250),
        y: rand(250, world.h - 250),
        r: 24,
        rescued: false,
        vx: rand(-35, 35),
        vy: rand(-35, 35)
      });
    }

    for (var k = 0; k < 11; k++) {
      enemies.push({
        x: rand(180, world.w - 180),
        y: rand(180, world.h - 180),
        r: 25,
        speed: rand(75, 105),
        phase: rand(0, Math.PI * 2),
        stun: 0
      });
    }

    player.x = world.w / 2;
    player.y = world.h / 2;
    player.energy = 100;
    player.stars = 0;
    camera.x = player.x;
    camera.y = player.y;
    burstCooldown = 0;
    damageCooldown = 0;
    paused = false;
    won = false;
    lost = false;
    message.style.display = 'none';
    playAgain.textContent = 'PLAY AGAIN';
    resetJoystick();
    updateHud();
  }

  function joystickMove(event) {
    var rect = joystick.getBoundingClientRect();
    var dx = event.clientX - (rect.left + rect.width / 2);
    var dy = event.clientY - (rect.top + rect.height / 2);
    var max = rect.width * 0.31;
    var length = Math.hypot(dx, dy);

    if (length > max) {
      dx = dx / length * max;
      dy = dy / length * max;
    }

    input.x = dx / max;
    input.y = dy / max;
    stick.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
  }

  function moveInput() {
    var x = input.x;
    var y = input.y;

    if (input.keys.a || input.keys.arrowleft) x -= 1;
    if (input.keys.d || input.keys.arrowright) x += 1;
    if (input.keys.w || input.keys.arrowup) y -= 1;
    if (input.keys.s || input.keys.arrowdown) y += 1;

    var length = Math.hypot(x, y);

    if (length > 1) {
      x /= length;
      y /= length;
    }

    return { x: x, y: y };
  }

  function addParticles(x, y, count, kind, speed, life) {
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * rand(speed * 0.3, speed),
        vy: Math.sin(angle) * rand(speed * 0.3, speed),
        life: life,
        max: life,
        size: rand(3, 8),
        kind: kind
      });
    }
  }

  function starBurst() {
    BWAudio.start();

    if (paused || won || lost || burstCooldown > 0 || player.energy < 25) {
      return;
    }

    player.energy -= 25;
    burstCooldown = 0.65;
    BWAudio.play(BWAudio.sounds.burst);
    addParticles(player.x, player.y, 42, 'burst', 330, 0.7);

    robots.forEach(function (robot) {
      if (!robot.rescued && Math.hypot(robot.x - player.x, robot.y - player.y) < 190) {
        robot.rescued = true;
        player.stars += 25;
        BWAudio.play(BWAudio.sounds.robot);
      }
    });

    enemies.forEach(function (enemy) {
      if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < 220) {
        enemy.stun = 1.2;
        addParticles(enemy.x, enemy.y, 8, 'burst', 100, 0.5);
      }
    });

    if (robots.every(function (robot) { return robot.rescued; })) {
      finishWin();
    }

    updateHud();
  }

  function finishWin() {
    if (won || lost) return;

    won = true;
    lost = false;
    updateHud();
    BWAudio.pauseMusic();
    BWAudio.play(BWAudio.sounds.win);
    messageTitle.textContent = 'YOU WIN!';
    messageText.textContent = 'BRANT SAVED THE WORLD! All 8 friendly robots are safe. You earned ' + player.stars + ' stars!';
    playAgain.textContent = 'PLAY AGAIN';
    message.style.display = 'grid';
  }

  function finishLose() {
    if (won || lost) return;

    lost = true;
    won = false;
    player.energy = 0;
    updateHud();
    BWAudio.pauseMusic();
    BWAudio.play(BWAudio.sounds.crumble);
    messageTitle.textContent = 'GAME OVER!';
    messageText.textContent = 'Brant ran out of energy! The robots are still waiting to be rescued.';
    playAgain.textContent = 'TRY AGAIN';
    message.style.display = 'grid';
    resetJoystick();
  }

  function togglePause() {
    BWAudio.start();

    if (won || lost) return;

    paused = !paused;

    if (paused) {
      messageTitle.textContent = 'GAME PAUSED';
      messageText.textContent = 'Take a break, then keep rescuing the robots!';
      playAgain.textContent = 'KEEP PLAYING';
      message.style.display = 'grid';
      BWAudio.pauseMusic();
      return;
    }

    message.style.display = 'none';
    BWAudio.playMusic();
  }

  function update(dt) {
    if (paused || won || lost) return;

    var movement = moveInput();

    player.x = Math.max(
      player.r,
      Math.min(world.w - player.r, player.x + movement.x * player.speed * dt)
    );
    player.y = Math.max(
      player.r,
      Math.min(world.h - player.r, player.y + movement.y * player.speed * dt)
    );

    player.energy = Math.min(100, player.energy + 13 * dt);
    burstCooldown = Math.max(0, burstCooldown - dt);
    damageCooldown = Math.max(0, damageCooldown - dt);

    updateRobots(dt);
    updateEnemies(dt);
    updateCrystals();
    updateParticles(dt);

    camera.x += (player.x - camera.x) * Math.min(1, dt * 6);
    camera.y += (player.y - camera.y) * Math.min(1, dt * 6);
    updateHud();
  }

  function updateRobots(dt) {
    robots.forEach(function (robot) {
      if (robot.rescued) {
        var dx = player.x - robot.x;
        var dy = player.y - robot.y;
        var distance = Math.hypot(dx, dy) || 1;
        var follow = Math.min(distance, 180 * dt);
        robot.x += dx / distance * follow;
        robot.y += dy / distance * follow;
        return;
      }

      robot.x += robot.vx * dt;
      robot.y += robot.vy * dt;

      if (robot.x < 80 || robot.x > world.w - 80) robot.vx *= -1;
      if (robot.y < 80 || robot.y > world.h - 80) robot.vy *= -1;
    });
  }

  function updateEnemies(dt) {
    enemies.forEach(function (enemy) {
      if (enemy.stun > 0) {
        enemy.stun = Math.max(0, enemy.stun - dt);
      } else {
        var dx = player.x - enemy.x;
        var dy = player.y - enemy.y;
        var distance = Math.hypot(dx, dy) || 1;
        enemy.x += dx / distance * enemy.speed * dt;
        enemy.y += dy / distance * enemy.speed * dt;
      }

      enemy.x = Math.max(60, Math.min(world.w - 60, enemy.x));
      enemy.y = Math.max(60, Math.min(world.h - 60, enemy.y));

      if (
        enemy.stun <= 0 &&
        damageCooldown <= 0 &&
        Math.hypot(enemy.x - player.x, enemy.y - player.y) < enemy.r + player.r
      ) {
        damagePlayer();
      }
    });
  }

  function damagePlayer() {
    player.energy = Math.max(0, player.energy - 18);
    damageCooldown = 0.8;
    BWAudio.play(BWAudio.sounds.crumble);
    addParticles(player.x, player.y, 12, 'damage', 120, 0.35);
    updateHud();

    if (player.energy <= 0) {
      finishLose();
    }
  }

  function updateCrystals() {
    crystals.forEach(function (crystal) {
      if (Math.hypot(crystal.x - player.x, crystal.y - player.y) < 42) {
        player.stars += 5;
        BWAudio.play(BWAudio.sounds.crystal);

        var x = crystal.x;
        var y = crystal.y;
        crystal.x = rand(80, world.w - 80);
        crystal.y = rand(80, world.h - 80);
        addParticles(x, y, 8, 'crystal', 50, 0.4);
      }
    });
  }

  function updateParticles(dt) {
    particles.forEach(function (particle) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    });

    particles = particles.filter(function (particle) {
      return particle.life > 0;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    var screenX = W / 2 - camera.x;
    var screenY = H / 2 - camera.y;

    ctx.fillStyle = '#070b20';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(screenX, screenY);
    drawWorld();
    drawCrystals();
    drawRobots();
    drawEnemies();
    drawParticles();
    drawPlayer();
    ctx.restore();
  }

  function drawWorld() {
    var gradient = ctx.createRadialGradient(
      world.w * 0.5, world.h * 0.5, 100,
      world.w * 0.5, world.h * 0.5, world.w * 0.72
    );
    gradient.addColorStop(0, '#142b55');
    gradient.addColorStop(0.55, '#0b1838');
    gradient.addColorStop(1, '#05091d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, world.w, world.h);

    drawSpaceStars();
    drawPlanets();
    drawWorldBoundary();
  }

  function drawSpaceStars() {
    for (var i = 0; i < 180; i++) {
      var x = (i * 383 + 97) % world.w;
      var y = (i * 211 + 53) % world.h;
      var size = i % 13 === 0 ? 4 : i % 5 === 0 ? 3 : 2;
      var alpha = i % 7 === 0 ? 0.75 : 0.35;
      ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
      ctx.fillRect(x, y, size, size);
    }
  }

  function drawPlanets() {
    planets.forEach(function (planet) {
      ctx.save();
      ctx.globalAlpha = planet.alpha;

      ctx.strokeStyle = planet.ring;
      ctx.lineWidth = Math.max(10, planet.r * 0.055);
      ctx.beginPath();
      ctx.ellipse(planet.x, planet.y, planet.r * 1.55, planet.r * 0.34, -0.15, 0, Math.PI * 2);
      ctx.stroke();

      var glow = ctx.createRadialGradient(
        planet.x - planet.r * 0.35,
        planet.y - planet.r * 0.4,
        planet.r * 0.1,
        planet.x,
        planet.y,
        planet.r
      );
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.08, planet.color);
      glow.addColorStop(0.72, planet.color);
      glow.addColorStop(1, '#05091d');

      ctx.fillStyle = glow;
      ctx.shadowBlur = 45;
      ctx.shadowColor = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(planet.x - planet.r * 0.3, planet.y - planet.r * 0.32, planet.r * 0.18, 0, Math.PI * 2);
      ctx.arc(planet.x + planet.r * 0.25, planet.y + planet.r * 0.2, planet.r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawWorldBoundary() {
    ctx.strokeStyle = 'rgba(100,210,255,.25)';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, world.w, world.h);
  }

  function drawCrystals() {
    crystals.forEach(function (crystal) {
      var pulse = 1 + Math.sin(performance.now() / 300 + crystal.phase) * 0.12;

      ctx.save();
      ctx.translate(crystal.x, crystal.y);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = '#65f4ff';
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#65f4ff';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(13, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(-13, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  function drawRobots() {
    robots.forEach(function (robot) {
      ctx.save();
      ctx.translate(robot.x, robot.y);
      ctx.fillStyle = robot.rescued ? '#67f4bd' : '#ffcf62';
      ctx.shadowBlur = 18;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fillRect(-18, -15, 36, 30);
      ctx.fillStyle = '#17213f';
      ctx.fillRect(-11, -7, 7, 7);
      ctx.fillRect(4, -7, 7, 7);
      ctx.fillStyle = 'white';
      ctx.fillRect(-8, 8, 16, 4);
      ctx.restore();
    });
  }

  function drawEnemies() {
    enemies.forEach(function (enemy) {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      var pulse = 1 + Math.sin(performance.now() / 180 + enemy.phase) * 0.08;
      ctx.scale(pulse, pulse);
      ctx.shadowBlur = enemy.stun > 0 ? 30 : 18;
      ctx.shadowColor = enemy.stun > 0 ? '#ffe56b' : '#ff405d';
      ctx.fillStyle = enemy.stun > 0 ? '#ffe56b' : '#ff405d';
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(21, -9);
      ctx.lineTo(15, 18);
      ctx.lineTo(0, 25);
      ctx.lineTo(-15, 18);
      ctx.lineTo(-21, -9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#180d25';
      ctx.fillRect(-10, -5, 20, 10);
      ctx.fillStyle = '#ffedf2';
      ctx.fillRect(-7, -2, 4, 4);
      ctx.fillRect(3, -2, 4, 4);
      ctx.restore();
    });
  }

  function drawParticles() {
    particles.forEach(function (particle) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.max);
      ctx.fillStyle = particle.kind === 'damage'
        ? '#ff405d'
        : particle.kind === 'crystal'
          ? '#65f4ff'
          : '#ffe56b';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.shadowBlur = 35;
    ctx.shadowColor = '#4ce8ff';
    ctx.fillStyle = '#42dfff';
    ctx.beginPath();
    ctx.arc(0, 0, player.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-9, -5, 5, 0, Math.PI * 2);
    ctx.arc(9, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#162248';
    ctx.beginPath();
    ctx.arc(-9, -5, 2, 0, Math.PI * 2);
    ctx.arc(9, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 4, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
  }

  window.BWGame = {
    resize: resize,
    spawn: spawn,
    update: update,
    draw: draw,
    startAudio: function () { BWAudio.start(); },
    starBurst: starBurst,
    togglePause: togglePause,
    joystickMove: joystickMove,
    resetJoystick: resetJoystick,
    setJoyPointer: function (pointerId) { joyPointer = pointerId; },
    getJoyPointer: function () { return joyPointer; },
    setKey: function (key, value) { input.keys[key] = value; },
    getMessageElement: function () { return message; },
    getState: function () { return { won: won, lost: lost, paused: paused }; },
    restart: function () {
      BWAudio.start();
      BWAudio.resetMusic();
      spawn();
      BWAudio.playMusic();
    },
    closePausedMessage: function () {
      if (paused) togglePause();
    }
  };

  window.addEventListener('resize', resize);
  resize();
  spawn();

  var last = performance.now();

  function loop(now) {
    var dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
