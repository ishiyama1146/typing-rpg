const express=require('express'),http=require('http'),path=require('path');
const {Server}=require('socket.io');
const app=express(),server=http.createServer(app),io=new Server(server);app.use(express.static(path.join(__dirname,'public')));
const rooms=new Map();
const DIFF={
 easy:{max:7600,attackMs:5200,attack1:8,attack2:11,breakGoal:62,breakFail:18,breakDamage:700},
 normal:{max:10500,attackMs:3900,attack1:10,attack2:14,breakGoal:70,breakFail:24,breakDamage:850},
 hard:{max:14500,attackMs:3000,attack1:13,attack2:18,breakGoal:80,breakFail:30,breakDamage:1000}
};
const cfg=r=>DIFF[r.difficulty]||DIFF.normal;
const pub=r=>{const c=cfg(r);return {code:r.code,difficulty:r.difficulty,bossHp:r.bossHp,bossMaxHp:c.max,started:r.started,phase:r.bossHp<=c.max*.5?2:1,breakEvent:r.breakEvent,players:[...r.players.values()].map(p=>({...p,maxHp:120}))}};
const emit=r=>io.to(r.code).emit('state',pub(r)); const alive=r=>[...r.players.values()].filter(p=>!p.dead);
function room(code,difficulty='normal'){difficulty=DIFF[difficulty]?difficulty:'normal';return {code,difficulty,bossHp:DIFF[difficulty].max,started:false,players:new Map(),link:null,breakEvent:null,attackTimer:null,breakTimer:null}}
function end(r){if(r.bossHp<=0){r.started=false;clearInterval(r.attackTimer);clearInterval(r.breakTimer);io.to(r.code).emit('result',{win:true,state:pub(r)})}else if(r.started&&!alive(r).length){r.started=false;clearInterval(r.attackTimer);clearInterval(r.breakTimer);io.to(r.code).emit('result',{win:false,state:pub(r)})}}
function breakStart(r){if(!r.started||r.breakEvent||r.bossHp<=0)return;const c=cfg(r);r.breakEvent={count:0,goal:c.breakGoal,endsAt:Date.now()+10000};io.to(r.code).emit('breakStart',r.breakEvent);emit(r);setTimeout(()=>{if(!r.breakEvent)return;let ok=r.breakEvent.count>=r.breakEvent.goal;if(ok){r.bossHp=Math.max(0,r.bossHp-c.breakDamage);io.to(r.code).emit('breakResult',{success:true,damage:c.breakDamage})}else{alive(r).forEach(p=>{p.hp=Math.max(0,p.hp-c.breakFail);p.dead=p.hp===0});io.to(r.code).emit('breakResult',{success:false,damage:c.breakFail})}r.breakEvent=null;emit(r);end(r)},10050)}
function timers(r){clearInterval(r.attackTimer);clearInterval(r.breakTimer);const c=cfg(r);r.attackTimer=setInterval(()=>{if(!r.started||r.breakEvent)return;const a=alive(r);if(!a.length)return end(r);const p=a[Math.floor(Math.random()*a.length)],d=r.bossHp<=c.max*.5?c.attack2:c.attack1;p.hp=Math.max(0,p.hp-d);p.dead=p.hp===0;io.to(r.code).emit('bossAttack',{target:p.id,damage:d});emit(r);end(r)},c.attackMs);r.breakTimer=setInterval(()=>breakStart(r),32000)}
function get(socket){return rooms.get(socket.data.room)}

function resetRoomForRematch(r){
 const c=cfg(r);
 clearInterval(r.attackTimer); clearInterval(r.breakTimer);
 r.bossHp=c.max; r.started=true; r.link=null; r.breakEvent=null;
 r.rematchReady=new Set();
 for(const p of r.players.values()){
   p.hp=120;p.damage=0;p.hits=0;p.misses=0;p.maxCombo=0;p.progress=0;p.dead=false;p.ult=0;p.ultBuffUntil=0;
 }
 emit(r);
 io.to(r.code).emit('gameStart',{state:pub(r),rematch:true});
 timers(r);
}
io.on('connection',s=>{
 s.on('createRoom',({name,difficulty='normal'})=>{let c;do c=String(Math.floor(1000+Math.random()*9000));while(rooms.has(c));const r=room(c,difficulty);rooms.set(c,r);r.players.set(s.id,{id:s.id,name:name||'PLAYER 1',hp:120,damage:0,hits:0,misses:0,maxCombo:0,progress:0,dead:false,ult:0,revive:0});s.join(c);s.data.room=c;s.emit('joined',{code:c,difficulty:r.difficulty});emit(r)});
 s.on('joinRoom',({code,name})=>{const r=rooms.get(String(code));if(!r)return s.emit('errorMsg','ROOMが見つかりません');if(r.players.size>=2)return s.emit('errorMsg','このROOMは満員です');r.players.set(s.id,{id:s.id,name:name||'PLAYER 2',hp:120,damage:0,hits:0,misses:0,maxCombo:0,progress:0,dead:false,ult:0,revive:0});s.join(r.code);s.data.room=r.code;s.emit('joined',{code:r.code,difficulty:r.difficulty});emit(r)});
 s.on('startGame',()=>{const r=get(s);if(!r||r.players.size<2)return s.emit('errorMsg','2人そろうまで待ってね');r.bossHp=cfg(r).max;r.started=true;r.link=null;r.breakEvent=null;for(const p of r.players.values())Object.assign(p,{hp:120,damage:0,hits:0,misses:0,maxCombo:0,progress:0,dead:false,ult:0,revive:0});emit(r);io.to(r.code).emit('gameStart',{state:pub(r)});timers(r)});
 s.on('progress',({progress})=>{const r=get(s),p=r?.players.get(s.id);if(!p)return;p.progress=Math.max(0,Math.min(1,+progress||0));s.to(r.code).emit('partnerProgress',{id:s.id,progress:p.progress})});
 s.on('hit',({combo=0,letter=''})=>{const r=get(s),p=r?.players.get(s.id);if(!r||!p||!r.started||p.dead)return;p.hits++;p.ult=Math.min(100,(p.ult||0)+2);p.maxCombo=Math.max(p.maxCombo,combo);const crit=combo>0&&combo%25===0,base=crit?35:10,d=(p.ultBuffUntil||0)>Date.now()?base*2:base;p.damage+=d;r.bossHp=Math.max(0,r.bossHp-d);if(r.breakEvent)r.breakEvent.count++;s.to(r.code).emit('partnerShot',{letter:String(letter).slice(0,1),critical:crit});emit(r);end(r)});
 s.on('miss',()=>{const r=get(s),p=r?.players.get(s.id);if(p){p.misses++;p.ult=Math.max(0,(p.ult||0)-4);emit(r)}});
 s.on('wordComplete',()=>{const r=get(s),p=r?.players.get(s.id);if(!r||!p||p.dead)return;p.progress=0;const now=Date.now();if(r.link&&r.link.owner!==s.id&&r.link.until>now){r.bossHp=Math.max(0,r.bossHp-400);[...r.players.values()].forEach(q=>q.damage+=200);io.to(r.code).emit('linkAttack',{damage:400});r.link=null;emit(r);end(r)}else{r.link={owner:s.id,until:now+5000};io.to(r.code).emit('linkChance',{owner:s.id,expires:r.link.until});setTimeout(()=>{if(r.link?.owner===s.id&&r.link.until<=Date.now()){r.link=null;emit(r)}},5100)}});
 s.on('reviveHit',()=>{const r=get(s),p=r?.players.get(s.id);if(!r||!p||p.dead)return;const d=[...r.players.values()].find(q=>q.dead);if(!d)return;d.revive++;io.to(r.code).emit('reviveProgress',{target:d.id,count:d.revive,goal:20});if(d.revive>=20){d.hp=60;d.dead=false;d.revive=0;io.to(r.code).emit('revived',{target:d.id});emit(r)}});
 s.on('heal',()=>{const r=get(s),p=r?.players.get(s.id);if(!r||!p||p.dead||p.hits<35)return;p.hits-=35;alive(r).forEach(q=>q.hp=Math.min(120,q.hp+30));io.to(r.code).emit('healed');emit(r)});
 
 s.on('rematchReady',({difficulty}={})=>{
   const r=get(s); if(!r||r.started||r.players.size<2)return;
   if(DIFF[difficulty])r.difficulty=difficulty;
   if(!r.rematchReady)r.rematchReady=new Set();
   r.rematchReady.add(s.id);
   io.to(r.code).emit('rematchStatus',{ready:r.rematchReady.size,total:r.players.size,difficulty:r.difficulty});
   if(r.rematchReady.size>=2) resetRoomForRematch(r);
 });

 s.on('castUlt',()=>{
   const r=get(s); if(!r||!r.started||r.bossHp<=0)return;
   const p=r.players.get(s.id);if(!p||p.dead||(p.ult||0)<100)return;
   const mate=[...r.players.values()].find(x=>x.id!==s.id);
   const dual=!!(mate&&!mate.dead&&(mate.ult||0)>=100),until=Date.now()+5000;
   p.ult=0;p.ultBuffUntil=until;
   if(dual){mate.ult=0;mate.ultBuffUntil=until;}
   io.to(r.code).emit('ultCast',{playerId:s.id,dual,duration:5000});emit(r);
 });
s.on('disconnect',()=>{const r=get(s);if(!r)return;r.players.delete(s.id);s.to(r.code).emit('errorMsg','相方が退出しました');emit(r);if(!r.players.size){clearInterval(r.attackTimer);clearInterval(r.breakTimer);rooms.delete(r.code)}})
});
const PORT=process.env.PORT||3000;server.listen(PORT,'0.0.0.0',()=>console.log(`TYPE RAID 2.18.1: http://localhost:${PORT}`));


// TYPE RAID 2.1 replay-ready compatibility layer
const replayReady = new Map();
io.on("connection",(socket)=>{
  socket.on("replayReady",()=>{
    const room=[...socket.rooms].find(r=>r!==socket.id);
    if(!room)return;
    if(!replayReady.has(room))replayReady.set(room,new Set());
    const ready=replayReady.get(room); ready.add(socket.id);
    const members=io.sockets.adapter.rooms.get(room);
    if(members && members.size>=2 && [...members].every(id=>ready.has(id))){
      replayReady.delete(room);
      io.to(room).emit("replayStarted");
      // Existing clients can restart through their normal room/start flow.
      io.to(room).emit("restartGame");
    }
  });
  socket.on("disconnect",()=>{for(const s of replayReady.values())s.delete(socket.id)});
});
