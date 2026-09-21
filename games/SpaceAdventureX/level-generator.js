(function(){'use strict';
function create(seed){
  let state=(seed>>>0)||1;
  function next(){state=(state*1664525+1013904223)>>>0;return state/4294967296}
  function chance(p){return next()<p}
  function range(min,max){return min+(max-min)*next()}
  function integer(min,max){return Math.floor(range(min,max+1))}
  return{next,chance,range,integer};
}
window.SpaceAdventureLevelGenerator={create};
})();
