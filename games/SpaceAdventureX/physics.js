(function(){'use strict';
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function lerp(a,b,t){return a+(b-a)*t}
function distanceSquared(ax,ay,bx,by){const dx=ax-bx,dy=ay-by;return dx*dx+dy*dy}
function circlesOverlap(a,b){const r=a.r+b.r;return distanceSquared(a.x,a.y,b.x,b.y)<=r*r}
function approach(current,target,rate,dt){return lerp(current,target,Math.min(1,rate*dt))}
window.SpaceAdventurePhysics={clamp,lerp,distanceSquared,circlesOverlap,approach};
})();
