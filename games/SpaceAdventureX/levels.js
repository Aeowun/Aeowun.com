(function(){'use strict';

function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function rng(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

function createLevel(number){
  const random=rng((number*2654435761)>>>0);
  const seed=Math.floor(random()*0xffffffff);
  const difficulty=clamp(number/250,0,1);
  const boss=number%25===0;

  return {
    number,
    seed,
    length:Math.floor(9000+number*55),
    cruiseSpeed:clamp(360+number*1.5,360,650),
    maxSpeed:clamp(790+number*.25,790,900),
    enemyDensity:clamp(.16+difficulty*.62,.16,.78),
    asteroidDensity:clamp(.08+difficulty*.44,.08,.52),
    projectileDifficulty:clamp(.12+difficulty*.70,.12,.82),
    enemyHealth:1+Math.floor(number/45),
    boostCost:22,
    planetType:number%8,
    boss,
    band:number<=10?'learning':number<=25?'introduction':number<=50?'pressure':number<=75?'advanced':number<=100?'dangerous':number<=150?'insane':number<=200?'expert':number<=249?'nightmare':'endgame'
  };
}

window.SpaceAdventureLevels={createLevel};
})();
