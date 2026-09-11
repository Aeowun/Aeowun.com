(function(){'use strict';
function playerShot(x,y){return{x,y,vx:900,vy:0,r:4,damage:1}}
function enemyShot(enemy,playerY,difficulty){return{x:enemy.x,y:enemy.y,vx:-260-difficulty*220,vy:(playerY-enemy.y)*.12,r:5,damage:20}}
function canFire(timer){return timer<=0}
function nextFireDelay(){return .16}
window.SpaceAdventureWeapons={playerShot,enemyShot,canFire,nextFireDelay};
})();
