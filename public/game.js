const socket = io();
const $ = id => document.getElementById(id);

const words = [
  ["焼肉を食べたい","yakinikuwotabetai"],
  ["今日はいい天気ですね","kyouhaiitenkidesune"],
  ["明日は休みです","asitahayasumidesu"],
  ["ゲームを始めよう","ge-muwohajimeyou"],
  ["友達と一緒に戦おう","tomodatitoissyonitatakaou"],
  ["タイピングで世界を救え","taipingudesekaiwosukue"],
  ["最後まであきらめない","saigomadeakiramenai"],
  ["ラーメンが食べたい","ra-mengatabetai"],
  ["二人ならきっと勝てる","hutarin arakittokateru".replaceAll(" ","")],
  ["必殺技をぶちかませ","hissatuwazawobutikamase"]
];

let room="", state=null, word=null, pos=0, localCombo=0, playing=false;
let startTime=0, typed=0;

function name(){ return $("name").value.trim() || "PLAYER"; }

$("create").onclick = () => socket.emit("createRoom",{name:name()},r=>r.ok&&enter(r.code));
$("join").onclick = () => socket.emit("joinRoom",{code:$("roomInput").value,name:name()},r=>{
  if(r.ok) enter(r.code); else $("error").textContent=r.message;
});
function enter(code){
  room=code; $("lobby").classList.add("hidden"); $("game").classList.remove("hidden");
  $("roomCode").textContent=code; $("shareCode").textContent=code;
}
$("start").onclick=()=>socket.emit("startGame");
$("heal").onclick=()=>socket.emit("heal",r=>{if(!r?.ok) $("message").textContent=r?.message||"まだ回復できない！";});

socket.on("state", s=>{
  state=s; renderState();
  if(s.started && !playing && !s.ended){ playing=true; startTime=Date.now(); $("waiting").classList.add("hidden"); $("battle").classList.remove("hidden"); nextWord(); }
});
socket.on("damage", d=>{
  $("floatDamage").textContent=(d.crit?"CRITICAL! ":"-")+d.damage;
  $("floatDamage").classList.remove("pop"); void $("floatDamage").offsetWidth; $("floatDamage").classList.add("pop");
});
socket.on("bossAttack", d=>{
  if(d.target===socket.id) $("message").textContent=`💥 ボスの攻撃！ ${d.damage}ダメージ！`;
});
socket.on("healEffect",()=> $("message").textContent="💚 2人のHPが25回復！");
socket.on("notice",m=>$("message").textContent=m);
socket.on("gameOver", ({win})=>{
  playing=false; $("battle").classList.add("hidden"); $("result").classList.remove("hidden");
  $("resultTitle").textContent=win?"🏆 BOSS DEFEATED!":"💀 GAME OVER";
  setTimeout(showResult,100);
});

function renderState(){
  if(!state)return;
  const pct=100*state.bossHp/state.bossMaxHp;
  $("bossBar").style.width=pct+"%"; $("bossHp").textContent=`${state.bossHp} / ${state.bossMaxHp}`;
  $("start").disabled=state.players.length<2;
  $("start").textContent=state.players.length<2?"2人揃ったらスタート":"⚔️ BATTLE START";
  state.players.slice(0,2).forEach((p,i)=>{
    const n=i+1; $( `p${n}name`).textContent=(p.id===socket.id?"★ ":"")+p.name;
    $(`p${n}hp`).textContent=`HP ${p.hp}/${p.maxHp}`; $(`p${n}bar`).style.width=(100*p.hp/p.maxHp)+"%";
  });
  const me=state.players.find(p=>p.id===socket.id);
  if(me){$("combo").textContent=localCombo;$("myDamage").textContent=me.damage;}
}

function nextWord(){
  let nw;
  do nw=words[Math.floor(Math.random()*words.length)]; while(word===nw);
  word=nw; pos=0; $("jp").textContent=word[0]; drawWord();
}
function drawWord(){
  const r=word[1], done=r.slice(0,pos), next=r[pos]||"", rest=r.slice(pos+1);
  $("romaji").innerHTML=`<span class="done">${done}</span><span class="next">${next}</span>${rest}`;
}
document.addEventListener("keydown",e=>{
  if(!playing || e.ctrlKey || e.altKey || e.metaKey || e.key.length!==1)return;
  const me=state?.players.find(p=>p.id===socket.id); if(!me || me.hp<=0)return;
  if(e.key.toLowerCase()===word[1][pos]){
    pos++; typed++; localCombo++; socket.emit("hit",{combo:localCombo}); $("message").textContent="⚔️ HIT!";
    if(pos>=word[1].length){$("message").textContent="✨ PERFECT!";nextWord();}else drawWord();
  }else{
    localCombo=0; socket.emit("miss"); $("message").textContent="❌ MISS!";
  }
  $("combo").textContent=localCombo;
});

function showResult(){
  if(!state)return;
  const secs=Math.max(1,(Date.now()-startTime)/1000);
  const me=state.players.find(p=>p.id===socket.id);
  const acc=me?Math.round(100*me.hits/Math.max(1,me.hits+me.misses)):0;
  const wpm=Math.round((typed/5)/(secs/60));
  $("resultStats").innerHTML=state.players.map(p=>`<p><b>${p.name}</b>　与ダメ ${p.damage} / 最大COMBO ${p.maxCombo} / MISS ${p.misses}</p>`).join("")+
  `<hr><p>あなた：WPM <b>${wpm}</b>　正確率 <b>${acc}%</b></p>`;
}
