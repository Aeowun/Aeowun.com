(function(){'use strict';
const TAU=Math.PI*2;
function create(ctx){
  function background(W,H,stars,cameraX){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#03071a');g.addColorStop(.5,'#07133a');g.addColorStop(1,'#020513');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(const s of stars){const sx=s.x-cameraX*.22;if(sx<-5||sx>W+5)continue;ctx.globalAlpha=s.a;ctx.fillStyle='#d8f7ff';ctx.fillRect(sx,s.y,s.s,s.s)}ctx.globalAlpha=1;const neb=ctx.createRadialGradient(W*.65,H*.35,10,W*.65,H*.35,W*.65);neb.addColorStop(0,'rgba(60,100,255,.12)');neb.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=neb;ctx.fillRect(0,0,W,H)}
  function ship(player){ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.vy*.001);ctx.shadowBlur=18;ctx.shadowColor='#55eaff';ctx.fillStyle='#dffaff';ctx.beginPath();ctx.moveTo(30,0);ctx.lineTo(-20,-15);ctx.lineTo(-12,0);ctx.lineTo(-20,15);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#56dfff';ctx.beginPath();ctx.moveTo(-13,-8);ctx.lineTo(-34,0);ctx.lineTo(-13,8);ctx.closePath();ctx.fill();ctx.fillStyle='#17345f';ctx.beginPath();ctx.arc(4,0,6,0,TAU);ctx.fill();ctx.restore()}
  function planet(W,H,generator,cameraX){const px=generator.length-cameraX+180,py=H*.5,r=Math.min(180,H*.36);if(px<-r*2||px>W+r*2)return;ctx.save();ctx.translate(px,py);ctx.shadowBlur=45;ctx.shadowColor='#7eeaff';const colors=['#3977b8','#7d4caa','#b55b52','#3c9d86','#8a7040','#4861b5','#a34d77','#3c8f9e'],base=colors[generator.planetType];const gr=ctx.createRadialGradient(-r*.35,-r*.35,r*.1,0,0,r);gr.addColorStop(0,'#fff');gr.addColorStop(.12,base);gr.addColorStop(1,'#081326');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(150,235,255,.65)';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(0,10,r*1.45,r*.35,-.15,0,TAU);ctx.stroke();ctx.globalAlpha=.18;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-r*.28,-r*.4,r*.42,r*.18,-.3,0,TAU);ctx.fill();ctx.restore()}
  function entities(data){
    const {asteroids,enemies,bullets,enemyBullets,particles,cameraX,W,boss,worldX}=data;
    if(boss){
        const bx=boss.x-cameraX;
        ctx.save();
        ctx.translate(bx,boss.y);
        // Main Dreadnought Body
        const g=ctx.createRadialGradient(-30,-30,10,0,0,boss.r);
        g.addColorStop(0,'#6b7386');
        g.addColorStop(1,'#1a1d26');
        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.arc(0,0,boss.r,0,TAU);
        ctx.fill();
        // Trench
        ctx.strokeStyle='#000';
        ctx.lineWidth=8;
        ctx.beginPath();
        ctx.moveTo(-boss.r,0);
        ctx.lineTo(boss.r,0);
        ctx.stroke();
        // Superlaser Dish
        ctx.fillStyle='#2a2e3a';
        ctx.beginPath();
        ctx.arc(-40,-40,35,0,TAU);
        ctx.fill();
        ctx.strokeStyle='#3e4452';
        ctx.lineWidth=2;
        ctx.stroke();
        // Turrets
        for(const t of boss.turrets){
            ctx.save();
            ctx.translate(t.relX,t.relY);
            ctx.fillStyle='#4a4e5a';
            ctx.fillRect(-15,-8,30,16);
            ctx.fillStyle='#222';
            ctx.fillRect(10,-4,12,8);
            if(t.fireTimer < 0.25){
                ctx.fillStyle='#ff5577';
                ctx.shadowBlur=15;
                ctx.shadowColor='#ff315b';
                ctx.fillRect(18,-3,8,6);
            }
            ctx.restore();
        }
        ctx.restore();
    }
    for(const a of asteroids){
        const x=a.x-cameraX;
        if(x<-60||x>W+60)continue;
        ctx.save();ctx.translate(x,a.y);ctx.rotate(a.rot);ctx.fillStyle='#6b7386';ctx.beginPath();
        for(let i=0;i<8;i++){
            const rr=a.r*(.78+Math.sin(i*91+a.r*3)*.14),ang=i*TAU/8;
            ctx.lineTo(Math.cos(ang)*rr,Math.sin(ang)*rr)
        }
        ctx.closePath();ctx.fill();ctx.restore()
    }
    for(const e of enemies){
        const x=e.x-cameraX;
        if(x<-60||x>W+60)continue;
        ctx.save();ctx.translate(x,e.y);ctx.fillStyle='#ff5c76';ctx.shadowBlur=15;ctx.shadowColor='#ff315b';ctx.beginPath();ctx.moveTo(-22,-13);ctx.lineTo(15,0);ctx.lineTo(-22,13);ctx.lineTo(-10,0);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#ffd3dc';ctx.fillRect(-2,-3,7,6);ctx.restore()
    }
    for(const b of bullets){
        const x=b.x-cameraX;
        if(x>-10&&x<W+10){ctx.fillStyle='#72f4ff';ctx.shadowBlur=12;ctx.shadowColor='#72f4ff';ctx.fillRect(x,b.y,14,4)}
    }
    for(const b of enemyBullets){
        const x=b.x-cameraX;
        if(x>-10&&x<W+10){ctx.fillStyle='#ff647e';ctx.shadowBlur=12;ctx.shadowColor='#ff647e';ctx.beginPath();ctx.arc(x,b.y,b.r,0,TAU);ctx.fill()}
    }
    ctx.shadowBlur=0;
    for(const p of particles){
        const x=p.x-cameraX;ctx.globalAlpha=Math.max(0,p.life*1.8);ctx.fillStyle=p.c;ctx.fillRect(x,p.y,3,3)
    }
    ctx.globalAlpha=1
  }
  function overlay(W,H,state){if(state==='play')return;ctx.fillStyle='rgba(0,0,15,.62)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='900 42px Arial';ctx.fillText(state==='won'?'PLANET REACHED':'SHIP LOST',W/2,H*.43);ctx.font='700 18px Arial';ctx.fillStyle='#9cefff';ctx.fillText(state==='won'?'Next galaxy loading...':'Press R to restart',W/2,H*.5);ctx.textAlign='left'}
  return{background,ship,planet,entities,overlay};
}
window.SpaceAdventureRenderer={create};
})();
