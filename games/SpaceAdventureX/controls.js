(function(){'use strict';
const input=window.SpaceAdventure.input;
function bindHold(id,key){const el=document.getElementById(id);if(!el)return;const set=v=>{input[key]=v};['pointerdown','touchstart'].forEach(e=>el.addEventListener(e,ev=>{ev.preventDefault();set(true)},{passive:false}));['pointerup','pointercancel','pointerleave','touchend','touchcancel'].forEach(e=>el.addEventListener(e,ev=>{ev.preventDefault();set(false)},{passive:false}))}
bindHold('brake','brake');bindHold('boost','boost');bindHold('fire','fire');
const pad=document.getElementById('verticalPad'),stick=document.getElementById('verticalStick');
let active=false;
function move(ev){if(!active)return;const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;const p=ev.touches?ev.touches[0]:ev;let dx=p.clientX-cx,dy=p.clientY-cy;const max=r.width*.36;const len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max}stick.style.transform=`translate(${dx}px,${dy}px)`;input.up=dy<-12;input.down=dy>12}
function end(){active=false;input.up=false;input.down=false;stick.style.transform='translate(0,0)'}
pad.addEventListener('pointerdown',e=>{active=true;pad.setPointerCapture?.(e.pointerId);move(e);e.preventDefault()},{passive:false});pad.addEventListener('pointermove',move,{passive:false});pad.addEventListener('pointerup',end);pad.addEventListener('pointercancel',end);
window.addEventListener('blur',()=>{input.up=input.down=input.brake=input.boost=input.fire=false;end()});
})();
