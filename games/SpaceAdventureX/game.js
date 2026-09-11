(function(){'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const physics=window.SpaceAdventurePhysics,levels=window.SpaceAdventureLevels,levelGen=window.SpaceAdventureLevelGenerator,entities=window.SpaceAdventureEntities,weapons=window.SpaceAdventureWeapons,audio=window.SpaceAdventureAudio,ui=window.SpaceAdventureUI.create(),renderer=window.SpaceAdventureRenderer.create(ctx);
let W=innerWidth,H=innerHeight,dpr=1;
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize);resize();
const input={up:false,down:false,brake:false,boost:false,fire:false},keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(['KeyW','KeyS','KeyA','KeyD','Space'].includes(e.code))e.preventDefault();updateInput()});
addEventListener('keyup',e=>{keys[e.code]=false;updateInput()});
function updateInput(){input.up=!!keys.KeyW;input.down=!!keys.KeyS;input.brake=!!keys.KeyA;input.boost=!!keys.KeyD;input.fire=!!keys.Space}
const TAU=Math.PI*2;
function hash(n){n=Math.sin(n*127.1+311.7)*43758.5453123;return n-Math.floor(n)}
let level=1,generator,random,player,enemies=[],bullets=[],enemyBullets=[],asteroids=[],particles=[],stars=[];
let cameraX=0,worldX=0,state='play',spawnTimer=0,fireTimer=0,last=performance.now(),transitionTimer=0,boostSoundTimer=0;
function resetLevel(){generator=levels.createLevel(level);random=levelGen.create(generator.seed);worldX=0;cameraX=0;state='play';transitionTimer=0;spawnTimer=0;fireTimer=0;boostSoundTimer=0;enemies=[];bullets=[];enemyBullets=[];asteroids=[];particles=[];player=entities.createPlayer(260,H*.5,generator.cruiseSpeed);stars=Array.from({length:170},(_,i)=>({x:hash(generator.seed+i)*generator.length,y:hash(generator.seed+i+500)*H,s:hash(generator.seed+i+900)*2+.4,a:hash(generator.seed+i+1300)*.7+.2}));ui.update({level,distance:generator.length,energy:player.energy})}
resetLevel();
function spawnEnemy(x){const e=entities.createEnemy(generator.seed+random.integer(0,0xffffff),x,H,generator.enemyHealth);e.y=H*(.12+random.range(0,.76));e.amp=random.range(18,78);e.shoot=random.chance(.7);enemies.push(e)}
function spawnAsteroid(x){const a=entities.createAsteroid(generator.seed+random.integer(0,0xffffff),x,H);a.y=H*(.08+random.range(0,.84));a.r=random.range(12,40);a.spin=random.range(-2,2);asteroids.push(a)}
function fire(){if(!weapons.canFire(fireTimer))return;fireTimer=weapons.nextFireDelay();bullets.push(weapons.playerShot(player.x+28+cameraX,player.y));audio.shoot()}
function damage(amount){player.hp-=amount;burst(player.x+cameraX,player.y,'#ff5577',10);audio.damage();if(player.hp<=0)state='dead'}
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
 spawnTimer-=dt;if(spawnTimer<=0){const gap=physics.clamp(470-generator.enemyDensity*310,170,470);spawnTimer=gap/generator.cruiseSpeed;if(random.chance(generator.enemyDensity))spawnEnemy(worldX+W+100);if(random.chance(generator.asteroidDensity))spawnAsteroid(worldX+W+150)}
 for(const e of enemies){e.y+=Math.sin(worldX*.002+e.phase)*e.amp*dt;if(e.shoot&&random.chance(generator.projectileDifficulty*dt*.8))enemyBullets.push(weapons.enemyShot(e,player.y,generator.projectileDifficulty))}
 for(const b of bullets)b.x+=b.vx*dt;for(const b of enemyBullets){b.x+=b.vx*dt;b.y+=b.vy*dt}for(const a of asteroids)a.rot+=a.spin*dt;
 const playerWorld={x:player.x+cameraX,y:player.y,r:player.r};
 for(const e of enemies)if(physics.circlesOverlap({x:e.x,y:e.y,r:e.r},playerWorld)){damage(20);e.x=-999}
 for(const a of asteroids)if(physics.circlesOverlap({x:a.x,y:a.y,r:a.r},playerWorld)){damage(20);a.x=-999}
 for(const b of enemyBullets)if(physics.circlesOverlap({x:b.x,y:b.y,r:b.r},playerWorld)){damage(b.damage||20);b.x=-999}
 for(const b of bullets)for(const e of enemies)if(physics.circlesOverlap({x:b.x,y:b.y,r:b.r},{x:e.x,y:e.y,r:e.r})){e.hp-=b.damage||1;b.x=-999;audio.hit();burst(e.x,e.y,'#ffcc66',5);if(e.hp<=0){e.x=-999;burst(e.x,e.y,'#70eaff',12)}}
 enemies=enemies.filter(e=>e.x>worldX-300&&e.x<worldX+W+900&&e.hp>0);asteroids=asteroids.filter(a=>a.x>worldX-300&&a.x<worldX+W+900);bullets=bullets.filter(b=>b.x<worldX+W+500&&b.x>worldX-300);enemyBullets=enemyBullets.filter(b=>b.x>worldX-400&&b.x<worldX+W+400&&b.y>-100&&b.y<H+100);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.vx*=.97;p.vy*=.97}particles=particles.filter(p=>p.life>0);
 if(worldX>=generator.length){state='won';transitionTimer=1.4;audio.win()}
 ui.update({level,distance:generator.length-worldX,energy:player.energy});
}
function draw(){renderer.background(W,H,stars,cameraX);renderer.planet(W,H,generator,cameraX);renderer.entities({asteroids,enemies,bullets,enemyBullets,particles,cameraX,W});renderer.ship(player);renderer.overlay(W,H,state)}
addEventListener('keydown',e=>{if(e.code==='KeyR'&&state==='dead')resetLevel()});
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
window.SpaceAdventure={input,resetLevel,getState:()=>state};
})();
