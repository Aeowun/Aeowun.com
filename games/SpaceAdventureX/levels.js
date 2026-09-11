(function(){'use strict';

function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function rng(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

function createLevel(number){
  const random=rng((number*2654435761)>>>0);
  const seed=Math.floor(random()*0xffffffff);
  const difficulty=clamp(number/50,0,1); // Increased difficulty scaling (was number/250)
  const boss=number%5===0; // Boss every 5 levels (was 25)

  return {
    number,
    seed,
    length:Math.floor(6000+number*200), // Adjusted length scaling
    cruiseSpeed:clamp(360+number*4,360,800), // Faster cruise speed scaling
    maxSpeed:clamp(790+number*2,790,1200),
    enemyDensity:clamp(.20+difficulty*.75,.20,.95), // Much higher density at higher levels
    asteroidDensity:clamp(.12+difficulty*.50,.12,.65),
    projectileDifficulty:clamp(.15+difficulty*.85,.15,1.0),
    enemyHealth:1+Math.floor(number/15), // Health scales faster (was number/45)
    bossHealth:15+Math.floor(number*8), // New property for boss health
    boostCost:22,
    planetType:number%8,
    boss,
    band:number<=5?'scouting':number<=15?'borderland':number<=30?'hostile':number<=50?'warzone':number<=75?'dangerous':number<=100?'extreme':number<=150?'catastrophic':number<=200?'galactic-threat':'oblivion'
  };
}

window.SpaceAdventureLevels={createLevel};
})();
