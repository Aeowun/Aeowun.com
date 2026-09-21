(function(){'use strict';
const TAU=Math.PI*2;
function rng(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function createEnemy(seed,x,height,health){const r=rng(seed+Math.floor(x*13));return{x,y:height*(.16+r()*.68),r:18+Math.floor(r()*8),hp:health,phase:r()*TAU,amp:20+r()*55,shoot:r()>.3}}
function createAsteroid(seed,x,height){const r=rng(seed+Math.floor(x*7));return{x,y:height*(.08+r()*.84),r:12+r()*28,rot:r()*TAU,spin:(r()-.5)*2}}
function createPlayer(x,y,speed){return{x,y,vy:0,speed,energy:100,hp:100,r:22}}
function createPlayerBullet(x,y){return{x,y,vx:900,vy:0,r:4}}
function createEnemyBullet(enemy,playerY,difficulty){return{x:enemy.x,y:enemy.y,vx:-260-difficulty*220,vy:(playerY-enemy.y)*.12,r:5,damage:10+difficulty*10}}
function createBoss(x,y,health){
  return {
    x, y, r:110, hp:health, maxHp:health,
    phase:0,
    turrets:[
        {relX:0, relY:-60, fireTimer:0},
        {relX:30, relY:0, fireTimer:0},
        {relX:0, relY:60, fireTimer:0}
    ]
  };
}
window.SpaceAdventureEntities={createEnemy,createAsteroid,createPlayer,createPlayerBullet,createEnemyBullet,createBoss};
})();
