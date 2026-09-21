(function(){'use strict';
let ctx=null;
function ensure(){if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C()}if(ctx.state==='suspended')ctx.resume();return ctx}
function tone(freq,duration,type,volume,endFreq){const c=ensure();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type=type||'sine';o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume||.03,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.02)}
function shoot(){tone(720,.07,'square',.025,320)}
function hit(){tone(180,.09,'sawtooth',.035,80)}
function damage(){tone(110,.18,'sawtooth',.05,55)}
function boost(){tone(95,.16,'sawtooth',.025,180)}
function win(){tone(440,.12,'sine',.04,660);setTimeout(()=>tone(660,.18,'sine',.04,990),90)}
window.SpaceAdventureAudio={ensure,shoot,hit,damage,boost,win};
})();
