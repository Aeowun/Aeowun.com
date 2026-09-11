(function(){'use strict';
function create(){
  const level=document.getElementById('level');
  const distance=document.getElementById('distance');
  const energy=document.getElementById('energyBar');
  const health=document.getElementById('healthBar');
  function update(data){
    if(level)level.textContent=data.level;
    if(distance)distance.textContent=Math.max(0,Math.floor(data.distance));
    if(energy)energy.style.width=Math.max(0,Math.min(100,data.energy))+'%';
    if(health)health.style.width=Math.max(0,Math.min(100,data.health))+'%';
  }
  return{update};
}
window.SpaceAdventureUI={create};
})();
