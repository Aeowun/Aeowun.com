(function(){'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const physics=window.SpaceAdventurePhysics,levels=window.SpaceAdventureLevels,levelGen=window.SpaceAdventureLevelGenerator,entities=window.SpaceAdventureEntities,weapons=window.SpaceAdventureWeapons,audio=window.SpaceAdventureAudio,ui=window.SpaceAdventureUI.create(),renderer=window.SpaceAdventureRenderer.create(ctx);
let W=innerWidth,H=innerHeight,dpr=1;
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize);resize();
const input={up:false,down:false,brake:false,boost:false,fire:false},keys={};
window.addEventListener('keydown',e=>{
  if(document.activeElement.tagName==='INPUT') return;
  keys[e.code]=true;
  if(['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  updateInput()
});
window.addEventListener('keyup',e=>{keys[e.code]=false;updateInput()});
function updateInput(){
  input.up=!!keys.KeyW||!!keys.ArrowUp;
  input.down=!!keys.KeyS||!!keys.ArrowDown;
  input.brake=!!keys.KeyA||!!keys.ArrowLeft;
  input.boost=!!keys.KeyD||!!keys.ArrowRight;
  input.fire=!!keys.Space;
}
const TAU=Math.PI*2;
function hash(n){n=Math.sin(n*127.1+311.7)*43758.5453123;return n-Math.floor(n)}
let level=1,generator,random,player,enemies=[],bullets=[],enemyBullets=[],asteroids=[],particles=[],stars=[],playerInitials='',boss=null;
let cameraX=0,worldX=0,state='play',spawnTimer=0,fireTimer=0,last=performance.now(),transitionTimer=0,boostSoundTimer=0;
const setupOverlay=document.getElementById('setup-overlay'),
      initialsInput=document.getElementById('player-initials'),
      startBtn=document.getElementById('start-game-btn'),
      instrOverlay=document.getElementById('instructions-overlay'),
      dismissBtn=document.getElementById('dismiss-instructions');

initialsInput.onkeydown=(e)=>{
    if(e.key==='Enter') startBtn.onclick();
};

startBtn.onclick=()=>{
    const val = initialsInput.value.trim();
    if(!val || val.length < 1){
        initialsInput.style.borderColor='#ff5577';
        initialsInput.style.boxShadow='0 0 20px rgba(255, 85, 119, 0.6)';
        initialsInput.placeholder='REQUIRED';
        initialsInput.focus();
        return;
    }
    playerInitials=val.toUpperCase().substring(0,3);
    localStorage.setItem('aeowun_user_initials', playerInitials);
    setupOverlay.style.display='none';
    instrOverlay.style.display='flex';
};

// Auto-skip initials if already set
const savedInitials = localStorage.getItem('aeowun_user_initials');
if(savedInitials) {
    playerInitials = savedInitials;
    setupOverlay.style.display = 'none';
    instrOverlay.style.display = 'flex';
}

dismissBtn.onclick=()=>{
    instrOverlay.style.display='none';
    resetLevel();
    last=performance.now();
    requestAnimationFrame(loop);
};

function saveScore(){
    if(!playerInitials) return;
    const leaderboard=JSON.parse(localStorage.getItem('aeowun_space_adventure_leaderboard')||'[]');
    const existing = leaderboard.find(e => e.name === playerInitials);
    if(existing) {
        if(level > existing.level) {
            existing.level = level;
            existing.date = new Date().toLocaleDateString();
        }
    } else {
        leaderboard.push({name:playerInitials,level:level,date:new Date().toLocaleDateString()});
    }
    leaderboard.sort((a,b)=>b.level-a.level);
    localStorage.setItem('aeowun_space_adventure_leaderboard',JSON.stringify(leaderboard.slice(0,10)));
}

window.saveGameProgress = () => {
    if(playerInitials) saveScore();
};

function resetLevel(){generator=levels.createLevel(level);random=levelGen.create(generator.seed);worldX=0;cameraX=0;state='play';transitionTimer=0;spawnTimer=0;fireTimer=0;boostSoundTimer=0;boss=null;enemies=[];bullets=[];enemyBullets=[];asteroids=[];particles=[];player=entities.createPlayer(260,H*.5,generator.cruiseSpeed);stars=Array.from({length:170},(_,i)=>({x:hash(generator.seed+i)*generator.length,y:hash(generator.seed+i+500)*H,s:hash(generator.seed+i+900)*2+.4,a:hash(generator.seed+i+1300)*.7+.2}));ui.update({level,distance:generator.length,energy:player.energy,health:player.hp})}
// resetLevel(); // Don't call here, wait for overlay

function spawnEnemy(x){const e=entities.createEnemy(generator.seed+random.integer(0,0xffffff),x,H,generator.enemyHealth);e.y=H*(.12+random.range(0,.76));e.amp=random.range(18,78);e.shoot=random.chance(.7);enemies.push(e)}
function spawnAsteroid(x){const a=entities.createAsteroid(generator.seed+random.integer(0,0xffffff),x,H);a.y=H*(.08+random.range(0,.84));a.r=random.range(12,40);a.spin=random.range(-2,2);asteroids.push(a)}
function fire(){if(!weapons.canFire(fireTimer))return;fireTimer=weapons.nextFireDelay();bullets.push(weapons.playerShot(player.x+28+cameraX,player.y));audio.shoot()}

function damage(amount){player.hp-=amount;burst(player.x+cameraX,player.y,'#ff5577',10);audio.damage();if(player.hp<=0){state='dead';saveScore()}}
function burst(x,y,c,n){for(let i=0;i<n;i++){const a=random.range(0,TAU),s=random.range(40,220);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:random.range(.35,.85),c})}}
function update(dt){
 if(state==='won'){transitionTimer-=dt;if(transitionTimer<=0){level++;resetLevel()}return}
 if(state!=='play')return;
 const boost=input.boost&&player.energy>0;
 const target=generator.cruiseSpeed+(boost?430:0)-(input.brake?170:0);
 player.speed=physics.approach(player.speed,physics.clamp(target,180,generator.maxSpeed),4,dt);
 if(boost){player.energy=physics.clamp(player.energy-dt*generator.boostCost,0,100);boostSoundTimer-=dt;if(boostSoundTimer<=0){audio.boost();boostSoundTimer=.45}}else{boostSoundTimer=0;player.energy=physics.clamp(player.energy+dt*4,0,100)}
 const vertical=(input.up?-1:0)+(input.down?1:0);player.vy=physics.approach(player.vy,vertical*300,7,dt);player.y=physics.clamp(player.y+player.vy*dt,55,H-70);
 worldX+=player.speed*dt;cameraX=worldX-player.x;
 fireTimer=Math.max(0,fireTimer-dt);if(input.fire)fire();
 spawnTimer-=dt;if(spawnTimer<=0){const gap=physics.clamp(470-generator.enemyDensity*310,170,470);spawnTimer=gap/generator.cruiseSpeed;if(!boss){if(random.chance(generator.enemyDensity))spawnEnemy(worldX+W+100);if(random.chance(generator.asteroidDensity))spawnAsteroid(worldX+W+150)}}
 if(generator.boss && !boss && worldX > generator.length - 1200) boss = entities.createBoss(worldX + W + 200, H/2, generator.bossHealth);
 if(boss){
    boss.x = worldX + W - 300;
    boss.phase += dt * 1.5;
    boss.y = H/2 + Math.sin(boss.phase) * H * 0.3;
    for(const t of boss.turrets){
        t.fireTimer -= dt;
        if(t.fireTimer <= 0){
            t.fireTimer = 0.5 + random.range(0, 1.5) / (generator.projectileDifficulty * 2);
            enemyBullets.push(weapons.enemyShot({x: boss.x + t.relX, y: boss.y + t.relY, r: 10}, player.y, generator.projectileDifficulty));
        }
    }
 }
 for(const e of enemies){e.y+=Math.sin(worldX*.002+e.phase)*e.amp*dt;if(e.shoot&&random.chance(generator.projectileDifficulty*dt*.8))enemyBullets.push(weapons.enemyShot(e,player.y,generator.projectileDifficulty))}
 for(const b of bullets)b.x+=b.vx*dt;for(const b of enemyBullets){b.x+=b.vx*dt;b.y+=b.vy*dt}for(const a of asteroids)a.rot+=a.spin*dt;
 const playerWorld={x:player.x+cameraX,y:player.y,r:player.r};
 for(const e of enemies)if(physics.circlesOverlap({x:e.x,y:e.y,r:e.r},playerWorld)){damage(20);e.x=-999}
 for(const a of asteroids)if(physics.circlesOverlap({x:a.x,y:a.y,r:a.r},playerWorld)){damage(20);a.x=-999}
 for(const b of enemyBullets)if(physics.circlesOverlap({x:b.x,y:b.y,r:b.r},playerWorld)){damage(b.damage||20);b.x=-999}
 if(boss && physics.circlesOverlap({x:boss.x,y:boss.y,r:boss.r*0.8}, playerWorld)){damage(100);boss.hp = 0;}
 for(const b of bullets){
    for(const e of enemies)if(physics.circlesOverlap({x:b.x,y:b.y,r:b.r},{x:e.x,y:e.y,r:e.r})){e.hp-=b.damage||1;b.x=-999;audio.hit();burst(e.x,e.y,'#ffcc66',5);if(e.hp<=0){e.x=-999;burst(e.x,e.y,'#70eaff',12)}}
    if(boss && physics.circlesOverlap({x:b.x,y:b.y,r:b.r}, {x:boss.x,y:boss.y,r:boss.r})){
        boss.hp -= b.damage || 1;
        b.x = -999;
        audio.hit();
        burst(b.x + cameraX, b.y, '#ffcc66', 3);
        if(boss.hp <= 0){
            burst(boss.x, boss.y, '#ffaa00', 40);
            burst(boss.x, boss.y, '#ffffff', 20);
            audio.win();
            boss = null;
        }
    }
 }
 enemies=enemies.filter(e=>e.x>worldX-300&&e.x<worldX+W+900&&e.hp>0);asteroids=asteroids.filter(a=>a.x>worldX-300&&a.x<worldX+W+900);bullets=bullets.filter(b=>b.x<worldX+W+500&&b.x>worldX-300);enemyBullets=enemyBullets.filter(b=>b.x>worldX-400&&b.x<worldX+W+400&&b.y>-100&&b.y<H+100);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.vx*=.97;p.vy*=.97}particles=particles.filter(p=>p.life>0);
 if(worldX>=generator.length && !boss){state='won';transitionTimer=1.4;audio.win();saveScore()}
 ui.update({level,distance:Math.max(0,generator.length-worldX),energy:player.energy,health:player.hp, bossHp: boss ? (boss.hp/boss.maxHp) : null});
}
function draw(){renderer.background(W,H,stars,cameraX);renderer.planet(W,H,generator,cameraX);renderer.entities({asteroids,enemies,bullets,enemyBullets,particles,cameraX,W,boss,worldX});renderer.ship(player);renderer.overlay(W,H,state)}
window.addEventListener('keydown',e=>{if(e.code==='KeyR'&&state==='dead')resetLevel()});
function loop(now){if(!playerInitials)return;const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop)}
// requestAnimationFrame(loop); // Don't call here
window.SpaceAdventure={input,resetLevel,getState:()=>state};
})();
