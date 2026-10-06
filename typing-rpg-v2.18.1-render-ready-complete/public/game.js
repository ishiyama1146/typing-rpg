const socket=io(),$=id=>document.getElementById(id);
let state=null,room='',playing=false,current=null,pos=0,combo=0,typed=0,misses=0,startAt=0,revive=false,linkUntil=0;
let soundOn=true,se=.8,bgm=.01,ctx=null;
const music=new Audio('sounds/battle.wav');music.loop=true;music.volume=bgm;
// Curated prompt set: natural Japanese only. No automatic adjective+noun mashups.
const shortWords=[
 ["プリンは別腹", "purinhabetubara"],
 ["猫が見ている", "nekogamiteiru"],
 ["おなかすいた", "onakasuita"],
 ["今日は休み", "kyouhayasumi"],
 ["あと五分だけ", "atogohundake"],
 ["コーヒー飲もう", "ko-hi-nomou"],
 ["ラーメン食べたい", "ra-mentabetai"],
 ["財布を忘れた", "saihuwowasureta"],
 ["雨が降ってきた", "amegahuttekita"],
 ["急いで帰ろう", "isoidekaerou"],
 ["ちょっと眠い", "tyottonemui"],
 ["いい天気だね", "iitenkidane"],
 ["猫はかわいい", "nekohakawaii"],
 ["犬もかわいい", "inumokawaii"],
 ["ごはんまだかな", "gohanmadakana"],
 ["明日は休みだ", "asitahayasumida"],
 ["充電がない", "zyuudenganai"],
 ["鍵どこだっけ", "kagidokodakke"],
 ["水を飲もう", "mizuwonomou"],
 ["もう一回だけ", "mouikkaidake"],
 ["アイス食べたい", "aisutabetai"],
 ["肉を焼こう", "nikuwoyakou"],
 ["電車が来た", "densyagakita"],
 ["写真を撮ろう", "syasinwotorou"],
 ["今日は暑い", "kyouhaatui"],
 ["風が気持ちいい", "kazegakimotiii"],
 ["ゲームしよう", "ge-musiyou"],
 ["まだいける", "madaikeru"],
 ["本気を出す", "honkiwodasu"],
 ["深呼吸しよう", "sinkokyuusiyou"],
 ["あと少しだ", "atosukosida"],
 ["唐揚げ最高", "karaagesaikou"],
 ["寿司が食べたい", "susigatabetai"],
 ["焼肉にしよう", "yakinikunisiyou"],
 ["ポテトが熱い", "potetogaatui"],
 ["カレーは正義", "kare-haseigi"],
 ["ピザが届いた", "pizagatodoita"],
 ["卵を買おう", "tamagowokaou"],
 ["お茶がうまい", "otyagaumai"],
 ["昼寝したい", "hirunesitai"],
 ["布団が恋しい", "hutongakoisii"],
 ["寝坊した", "nebousita"],
 ["傘を忘れた", "kasawowasureta"],
 ["靴下どこだ", "kutusitadokoda"],
 ["冷蔵庫が空だ", "reizoukogakarada"],
 ["目覚まし鳴った", "mezamasinatta"],
 ["信号が青だ", "singougaaoda"],
 ["今日は金曜日", "kyouhakinyoubi"],
 ["明日は土曜日", "asitahadoyoubi"],
 ["休憩しよう", "kyuukeisiyou"],
 ["腹が減った", "haragahetta"],
 ["のどが渇いた", "nodogakawaita"],
 ["チョコ食べたい", "tyokotabetai"],
 ["パンを焼こう", "panwoyakou"],
 ["うどんにしよう", "udonnisiyou"],
 ["そばもいいね", "sobamoiine"],
 ["眠気が強い", "nemukegatuyoi"],
 ["帰りたい", "kaeritai"],
 ["おかわりください", "okawarikudasai"],
 ["いただきます", "itadakimasu"]
];

const mediumWords=[
 ["冷蔵庫に何もない", "reizoukoninanimonai"],
 ["今日は早く帰りたい", "kyouhahayakukaeritai"],
 ["目覚ましを止めて二度寝した", "mezamasiwotometenidonesita"],
 ["コンビニでおやつを買おう", "konbinideoyatuwokaou"],
 ["帰ったらゲームをしよう", "kaettarage-muwosiyou"],
 ["焼きたてのパンはおいしい", "yakitatenopanhaoisii"],
 ["猫が箱の中に入っている", "nekogahakononakanihaitteiru"],
 ["雨の日は家でのんびりする", "amenohihaiiedenonbirisuru"],
 ["休日は時間が過ぎるのが早い", "kyuuzituhazikangasugirunogahayai"],
 ["財布の中身がちょっと寂しい", "saihunonakamigatyottosabisii"],
 ["スマホの充電を忘れていた", "sumahonozyuudenwowasureteita"],
 ["夜中にラーメンが食べたくなる", "yonakanira-mengatabetakunaru"],
 ["新しい靴で出かけよう", "atarasiikutudedekakeyou"],
 ["信号が全部青だとうれしい", "singougazennbuaodatouresii"],
 ["温かいコーヒーで一休み", "atatakaiko-hi-dehitoyasumi"],
 ["明日の予定を確認しよう", "asitanoyoteiwokakuninsiyou"],
 ["いい曲を見つけるとうれしい", "iikyokuwomitukerutouresii"],
 ["友達から急に電話がきた", "tomodatikarakyuunidenwagakita"],
 ["帰り道に寄り道をしよう", "kaerimitiniyorimitiwosiyou"],
 ["お風呂上がりのアイスは最高", "ohuroagarinoaisuhasaikou"],
 ["眠いけどあと少し頑張ろう", "nemuikedoatosukosiganbarou"],
 ["今日はいつもより調子がいい", "kyouhaitumoyorityousigaii"],
 ["焦らず正確にキーを打とう", "aserazuseikakuniki-woutou"],
 ["朝ごはんは卵焼きにしよう", "asagohanhatamagoyakinisiyou"],
 ["唐揚げにレモンをかけるか迷う", "karaageniremonwokakerukamayou"],
 ["ポテトを一本だけもらいたい", "potetowoippondakemoraitai"],
 ["焼肉のにおいでお腹がすいた", "yakinikunonioideonakagasuita"],
 ["冷たいジュースを一気に飲んだ", "tumetaizyu-suwoikkininonda"],
 ["買ったアイスをすぐに食べたい", "kattaaisuwosugunitabetai"],
 ["目の前で電車のドアが閉まった", "menomaededensyanodoagasimatta"],
 ["休みの日だけ早く目が覚める", "yasuminohidakehayakumegasameru"],
 ["あと一分だけ布団にいたい", "atoippundakehutonniitai"],
 ["電子レンジの残り三秒が長い", "densirenzinonokorisanbyouganagai"],
 ["財布を見たら小銭しかなかった", "saihuwomitarakozenisikanakatta"],
 ["注文した料理がまだ来ない", "tyuumonsitaryourigamadakonai"],
 ["写真を撮る前に料理を食べた", "syasinwotorumaeniryouriwotabeta"],
 ["自動販売機で当たりが出た", "zidouhanbaikideatarigadeta"],
 ["新しいゲームを買ってしまった", "atarasiige-muwokattesimatta"],
 ["休日の昼寝は気持ちがいい", "kyuuzitunohirunehakimotigaii"],
 ["夜になると急に元気が出る", "yoruninarutokyuunigenkigaderu"],
 ["カップ麺の三分が待ち遠しい", "kappumennosanpungamatidoosii"],
 ["焼き鳥は塩かタレかで迷う", "yakitorihasiokatarekademayou"],
 ["最後の一個は誰が食べる", "saigonoikkohadaregataberu"],
 ["冷蔵庫を開けても何も増えない", "reizoukowoaketemonanimohuenai"],
 ["目覚ましより先に猫に起こされた", "mezamasiyorisakininekoniokosareta"],
 ["コンビニに行くと予定より買う", "konbininiikutoyoteiyorikau"],
 ["熱いラーメンで舌をやけどした", "atuira-mendesitawoyakedosita"],
 ["今日は何を食べるかで悩む", "kyouhananiwotaberukadenayamu"],
 ["ゲームの更新がなかなか終わらない", "ge-munokousinnganakanakaowaranai"],
 ["充電器を探して部屋を歩き回る", "zyuudenkiwosagasiteheyawoarukimawaru"]
];

const longWords=[
 ["休みの日は目覚ましをかけずに寝たい", "yasuminohihamezamasiwokakezuninetai"],
 ["旅行に行ったらおいしいものを食べたい", "ryokouniittaraoisiimonowotabetai"],
 ["天気がいいから少し遠くまで出かけよう", "tenkigaiikarasukositookumadedekakeyou"],
 ["好きな音楽を聴きながらのんびり帰ろう", "sukinaongakuwokikinagaranonbirikaerou"],
 ["冷蔵庫を開けたけどやっぱり何もなかった", "reizoukowohiraitakedoyapparinanimonakatta"],
 ["あと一問だけと思ったら一時間たっていた", "atoitimondaketoomottaraitizikantatteita"],
 ["夜更かしした次の日はだいたい後悔する", "yohukasisitatuginohihadaitaikoukaisuru"],
 ["おいしいごはんを食べると元気が出る", "oisiigohanwotaberutogenkigaderu"],
 ["落ち着いて打てばまだまだ速くなれる", "otituiteutebamadamadahayakunareru"],
 ["コンボが続くとだんだん楽しくなってくる", "konbogatudukutodandantanosikunattekuru"],
 ["ミスしても焦らず次の文字に集中しよう", "misusitemoaserazutuginomozinisyuutyuusiyou"],
 ["お腹いっぱいなのにデザートは食べられる", "onakippainanonideza-tohataberareru"],
 ["スーパーに行くと予定にない物まで買ってしまう", "su-pa-niikutoyoteininaimonomadekattesimau"],
 ["休みの前の日はなぜか夜更かししたくなる", "yasuminomaenohihanazekayohukasisitakunaru"],
 ["温かい布団から出るまでに勇気が必要だ", "atatakaihutonkaraderumadeniyuukigahituyouda"],
 ["おいしい匂いにつられて予定外の店に入った", "oisiinioiniturareteyoteigainomisenihaitta"],
 ["スマホを探していたら手に持っていた", "sumahowosagasiteitaratenimotteita"],
 ["買い物に来たのに何を買うか忘れてしまった", "kaimononikitanoninaniwokaukawasuretesimatta"],
 ["目覚ましを三つかけても起きられない朝がある", "mezamasiwomittukaketemookirarenaiasagaaru"],
 ["焼きたてのパンの匂いには勝てる気がしない", "yakitatenopannonioinihakaterukigasinai"],
 ["友達と話していると時間があっという間に過ぎる", "tomodatitohanasiteirutozikangaattoiumanisugiru"],
 ["帰宅した瞬間に今日のやる気を全部使い切った", "kitakusitasyunkannikyounoyarukiwozenbutukaitta"],
 ["雨が降りそうだから傘を持つか最後まで迷った", "amegahurisoudakarakasawomotukasaigomademayotta"],
 ["新作のお菓子を見つけるとつい買ってしまう", "sinsakunookasiwomitukerutotuikattesimau"],
 ["注文した料理が届くまでメニューをずっと見ている", "tyuumonsitaryourigatodokumademenyu-wozuttomiteiru"],
 ["休日に何もしない時間がいちばん贅沢かもしれない", "kyuuzituninanimosinaizikangaitibanzeitakukamosirenai"],
 ["夜中に見る食べ物の動画はだいたい危険だ", "yonakanimirutabetomonodougahadaitaikikenda"],
 ["あと少しだけ遊ぶつもりが気づけば深夜になっていた", "atosukosidakeasobutumorigakizukebasinyoninatteita"],
 ["旅行の帰り道は楽しかった時間を思い出してしまう", "ryokounokaerimitihatanosikattazikanwoomoidsitesimau"],
 ["冷たい飲み物を一気に飲んだら頭が痛くなった", "tumetainomimonowoikkininondaraatamagaitakunatta"]
];
console.log(`TYPE RAID sushi-style curated prompts: ${shortWords.length+mediumWords.length+longWords.length}`);
const me=()=>state?.players.find(p=>p.id===socket.id),partner=()=>state?.players.find(p=>p.id!==socket.id);const bar=(id,v)=>{$(id).style.width=Math.max(0,Math.min(100,v))+'%'};
function tone(f,d=.05,v=.15,type='square'){if(!soundOn||!se)return;try{ctx||=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v*se,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+d);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch{}}
function keySound(){tone(620+Math.min(combo,30)*10,.035,.17)}function missSound(){tone(120,.12,.2,'sawtooth')}function linkSound(){tone(440,.1,.2,'sine');setTimeout(()=>tone(700,.12,.2,'sine'),80);setTimeout(()=>tone(1050,.2,.25,'sine'),160)}
function log(t){const l=$('battleLog'),d=document.createElement('div');d.textContent=t;l.prepend(d);while(l.children.length>6)l.lastChild.remove()}
function flash(t,c=''){const e=$('message');e.textContent=t;e.className=c;log(t);setTimeout(()=>{if(e.textContent===t)e.textContent=''},1300)}
let lastPrompt='',romaTyped='',romaCandidates=[],romaDisplay='';
function buildRomaCandidates(base){
 let set=new Set([base.toLowerCase()]);
 const pairs=[
  ['sya','sha'],['syu','shu'],['syo','sho'],
  ['tya','cha'],['tyu','chu'],['tyo','cho'],
  ['zya','ja'],['zyu','ju'],['zyo','jo'],
  ['si','shi'],['ti','chi'],['tu','tsu'],['hu','fu'],['zi','ji']
 ];
 for(const [a,b] of pairs){
   const now=[...set];
   for(const s of now){
     if(s.includes(a))set.add(s.split(a).join(b));
     if(s.includes(b))set.add(s.split(b).join(a));
     if(set.size>128)break;
   }
 }
 // ん: canonical "nn" can be typed as "n"; a syllabic n before a consonant/end may also be doubled.
 for(const s of [...set]){
   if(s.includes('nn'))set.add(s.replaceAll('nn','n'));
   set.add(s.replace(/n(?=[bcdfghjklmpqrstvwxyz]|$)/g,'nn'));
   if(set.size>192)break;
 }
 return [...set].slice(0,192);
}
function resetRomaInput(){
 romaTyped='';romaCandidates=buildRomaCandidates(current?.[1]||'');romaDisplay=current?.[1]||'';
}
function romaKey(key){
 const next=romaTyped+key.toLowerCase();
 const viable=romaCandidates.filter(s=>s.startsWith(next));
 if(!viable.length)return {ok:false};
 romaTyped=next;romaCandidates=viable;
 const exact=viable.find(s=>s===romaTyped);
 romaDisplay=exact||viable.slice().sort((a,b)=>a.length-b.length)[0];
 return {ok:true,done:!!exact};
}
function pick(){
 const r=Math.random(),d=window.__soloDifficulty||"normal";
 const rawPool=window.__soloMode
   ?(d==="easy"?(r<.68?shortWords:mediumWords):d==="hard"?(r<.35?mediumWords:longWords):(r<.30?shortWords:r<.82?mediumWords:longWords))
   :(r<.30?shortWords:r<.82?mediumWords:longWords);
 const pool=rawPool.filter(x=>x[1].length<=38);
 let next=pool[Math.floor(Math.random()*pool.length)];
 for(let i=0;i<6&&next[0]===lastPrompt;i++)next=pool[Math.floor(Math.random()*pool.length)];
 current=next;lastPrompt=current[0];pos=0;resetRomaInput();drawWord();
 if(!window.__soloMode)socket.emit('progress',{progress:0});
}
function drawWord(){
 if(!current)return;$('jpWord').textContent=current[0];
 const s=romaDisplay||current[1],p=romaTyped.length;
 $('romaWord').innerHTML=`<span class="done">${s.slice(0,p)}</span><span class="cursor">${s[p]||''}</span>${s.slice(p+1)}`;
 bar('typingBar',100*p/Math.max(1,s.length));
}
function render(){if(!state)return;bar('bossBar',100*state.bossHp/state.bossMaxHp);$('bossHp').textContent=`${state.bossHp} / ${state.bossMaxHp}`;$('phase').textContent=`PHASE ${state.phase}`;$('arena').classList.toggle('phase2',state.phase===2);$('bossSprite').classList.toggle('rage',state.phase===2&&state.bossHp>0);if(state.bossHp<=0)$('bossSprite').classList.add('dead');const m=me(),p=partner();if(m){$('myName').textContent=m.name+(m.dead?' ☠':'');$('myHp').textContent=`${m.hp}/120`;bar('myBar',100*m.hp/120);$('myStats').textContent=`DMG ${m.damage}  HIT ${m.hits}  MISS ${m.misses}`}if(p){$('partnerName').textContent=p.name+(p.dead?' ☠':'');$('partnerHp').textContent=`${p.hp}/120`;bar('partnerBar',100*p.hp/120);$('partnerStats').textContent=`DMG ${p.damage}  HIT ${p.hits}  MISS ${p.misses}`;bar('partnerTyping',p.progress*100);bar('partnerTyping2',p.progress*100)}$('roomCode').textContent=state.code||room;if(state.breakEvent){$('breakText').textContent=`${state.breakEvent.count} / ${state.breakEvent.goal}　残り${Math.max(0,Math.ceil((state.breakEvent.endsAt-Date.now())/1000))}秒`;bar('breakBar',100*state.breakEvent.count/state.breakEvent.goal)}else{$('breakText').textContent='32秒ごとに発生';bar('breakBar',0)}revive=!!m&&!m.dead&&!!p&&p.dead;$('reviveHint').classList.toggle('hidden',!revive)}
function projectile(letter,side='me',critical=false){
 const a=$('arena'),boss=$('bossSprite'),layer=$('projectiles'),ar=a.getBoundingClientRect(),br=boss.getBoundingClientRect();
 const e=document.createElement('div');e.className=`projectile ${side} ${critical?'crit':''}`;e.textContent=(letter||'•').toUpperCase();
 const sx=side==='me'?ar.width*.15:ar.width*.85,sy=ar.height*.68,tx=br.left-ar.left+br.width/2,ty=br.top-ar.top+br.height*.52;
 e.style.left=sx+'px';e.style.top=sy+'px';layer.appendChild(e);
 typingMuzzle(sx,sy,side,critical);
 requestAnimationFrame(()=>e.style.transform=`translate(${tx-sx}px,${ty-sy}px) scale(${critical?1.65:.72}) rotate(${critical?360:180}deg)`);
 setTimeout(()=>{bossHit(critical);typingImpact(tx,ty,critical);damage(critical?35:10,tx,ty,critical);e.remove()},235)
}
function typingMuzzle(x,y,side,crit){
 const l=$('projectiles'),e=document.createElement('i');e.className=`typeMuzzle ${side} ${crit?'crit':''}`;e.style.left=x+'px';e.style.top=y+'px';l.appendChild(e);setTimeout(()=>e.remove(),260)
}
function typingImpact(x,y,crit=false){
 const l=$('damageLayer'),ring=document.createElement('i');ring.className=`typeImpact ${crit?'crit':''}`;ring.style.left=x+'px';ring.style.top=y+'px';l.appendChild(ring);
 for(let i=0;i<(crit?12:6);i++){const s=document.createElement('i');s.className='typeSpark';s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--a',(i/(crit?12:6))*Math.PI*2+'rad');s.style.setProperty('--d',(crit?75:42)+Math.random()*28+'px');l.appendChild(s);setTimeout(()=>s.remove(),420)}
 if(crit){const a=$('arena');a.classList.remove('typeShake');void a.offsetWidth;a.classList.add('typeShake');setTimeout(()=>a.classList.remove('typeShake'),220)}
 setTimeout(()=>ring.remove(),420)
}
function wordFinishBurst(){
 const boss=$('bossSprite'),a=$('arena'),l=$('damageLayer'),ar=a.getBoundingClientRect(),br=boss.getBoundingClientRect();
 const x=br.left-ar.left+br.width/2,y=br.top-ar.top+br.height*.52,e=document.createElement('b');
 e.className='wordBurst';e.textContent='WORD BREAK';e.style.left=x+'px';e.style.top=y+'px';l.appendChild(e);
 boss.classList.remove('wordHit');void boss.offsetWidth;boss.classList.add('wordHit');setTimeout(()=>boss.classList.remove('wordHit'),360);setTimeout(()=>e.remove(),650)
}
function damage(n,x,y,crit){const e=document.createElement('b');e.className='damage '+(crit?'crit':'');e.textContent=crit?`${n} CRITICAL!`:n;e.style.left=x+'px';e.style.top=y+'px';$('damageLayer').appendChild(e);setTimeout(()=>e.remove(),700)}
const __renderUltBase=render;
render=function(){__renderUltBase();updateUltHud()};
function bossHit(crit=false){const b=$('bossSprite');b.classList.remove('hit','critHit');void b.offsetWidth;b.classList.add(crit?'critHit':'hit');setTimeout(()=>b.classList.remove('hit','critHit'),340)}
function bossAttack(){const b=$('bossSprite');b.classList.remove('attack');void b.offsetWidth;b.classList.add('attack');setTimeout(()=>b.classList.remove('attack'),480)}
function bossBreak(){const b=$('bossSprite');b.classList.remove('breakStun');void b.offsetWidth;b.classList.add('breakStun');setTimeout(()=>b.classList.remove('breakStun'),850)}
function showGame(){['home','waiting','result'].forEach(x=>$(x).classList.add('hidden'));$('game').classList.remove('hidden')}
let coopDifficulty='normal';
const coopInfo={
 easy:{label:'EASY',name:'翠晶獣 リム',icon:'◉',css:'boss-easy',desc:'翠晶獣 リム / 気軽な2人RAID'},
 normal:{label:'NORMAL',name:'深淵の魔王 アビス',icon:'☠',css:'boss-normal',desc:'深淵の魔王 アビス / 標準2人RAID'},
 hard:{label:'HARD',name:'機装竜 ヴァルガ',icon:'◆',css:'boss-hard',desc:'機装竜 ヴァルガ / 高難度2人RAID'}
};
document.querySelectorAll('.coopDiff').forEach(btn=>btn.onclick=()=>{
 coopDifficulty=btn.dataset.diff;
 document.querySelectorAll('.coopDiff').forEach(x=>x.classList.toggle('active',x===btn));
 $('coopDiffDesc').textContent=coopInfo[coopDifficulty].desc;
});
function applyCoopDifficulty(diff){
 if(!coopInfo[diff])diff='normal';
 coopDifficulty=diff;
 const c=coopInfo[diff];
 $('bossName').textContent=`${c.icon} BOSS　${c.name}`;
 $('bossSprite').classList.remove('boss-easy','boss-normal','boss-hard','dead','rage');
 $('bossSprite').classList.add(c.css);
 $('arena').classList.remove('ind-stage-easy','ind-stage-normal','ind-stage-hard');
 $('arena').classList.add(`ind-stage-${diff}`);
 $('v21ModeBadge').textContent=`CO-OP / ${c.label}`;
 if($('waitDifficulty'))$('waitDifficulty').textContent=`${c.label} RAID / ${c.name}`;
}
$('createBtn').onclick=()=>socket.emit('createRoom',{name:$('name').value||'PLAYER 1',difficulty:coopDifficulty});
$('joinBtn').onclick=()=>socket.emit('joinRoom',{code:$('joinCode').value,name:$('name').value||'PLAYER 2'});
$('startBtn').onclick=()=>socket.emit('startGame');
$('healBtn').onclick=()=>socket.emit('heal');
$('soundBtn').onclick=()=>{soundOn=!soundOn;$('soundBtn').textContent=soundOn?'🔊 ON':'🔇 OFF';if(soundOn&&playing)music.play().catch(()=>{});else music.pause()};$('bgmVol').oninput=e=>{bgm=+e.target.value;music.volume=bgm};$('seVol').oninput=e=>se=+e.target.value;
socket.on('joined',d=>{
 room=d.code;
 window.__soloMode=false; __soloPaused=false; document.body.classList.remove('solo-mode','solo-paused'); document.querySelector('.rightCaster')?.classList.remove('hidden');
 $('home').classList.add('hidden');$('waiting').classList.remove('hidden');$('waitCode').textContent=d.code;
 applyCoopDifficulty(d.difficulty||'normal');
});
socket.on('state',s=>{
 state=s;
 if(!window.__soloMode&&s.difficulty)applyCoopDifficulty(s.difficulty);
 render();
 $('startBtn').disabled=!!s.started||s.players.length<2;
});
socket.on('gameStart',d=>{
 playing=true;window.__soloMode=false;__soloPaused=false;document.body.classList.remove('solo-mode','solo-paused');
 typed=misses=combo=0;window.__trComboReset?.();startAt=Date.now();
 if(d?.state)state=d.state;
 if(state?.difficulty)applyCoopDifficulty(state.difficulty);
 showGame();pick();
 if(soundOn){music.volume=bgm;music.play().catch(()=>{})}
 flash(`${coopInfo[state?.difficulty||'normal'].label} RAID START!`,'good');
});socket.on('partnerProgress',d=>{if(d.id!==socket.id){bar('partnerTyping',d.progress*100);bar('partnerTyping2',d.progress*100)}});socket.on('partnerShot',d=>{if(!playing)return;projectile(d.letter||'✦','partner',!!d.critical)});socket.on('linkChance',d=>{linkUntil=d.expires;if(d.owner!==socket.id){$('linkText').textContent='相方に続け！ 5秒以内に打ち切れ';flash('⚡ LINK CHANCE','good')}});socket.on('linkAttack',d=>{linkSound();flash(`⚡ LINK ATTACK ${d.damage} DAMAGE!`,'linkAttack');bossHit(true);$('linkText').textContent='2人で続けて打ち切ると400 DAMAGE'});socket.on('bossAttack',d=>{bossAttack();if(d.target===socket.id)flash(`💥 BOSS ATTACK -${d.damage}`,'bad')});socket.on('breakStart',()=>flash('🔥 10秒で2人合計70文字！','bad'));socket.on('breakResult',d=>{if(d.success){bossBreak();linkSound();flash(`🔥 BREAK SUCCESS +${d.damage}`,'linkAttack')}else flash(`BREAK失敗… -${d.damage}`,'bad')});socket.on('reviveProgress',d=>flash(`REVIVE ${d.count}/${d.goal}`,'good'));socket.on('revived',()=>{linkSound();flash('✨ REVIVE!','linkAttack')});socket.on('healed',()=>flash('♥ TEAM HEAL','good'));socket.on('errorMsg',m=>alert(m));
/* v2.18.1 — boss defeat cinematic */

window.__raidClearSound=()=>{
 try{
   // Original bright victory fanfare: rising notes + final sparkling chord.
   tone(523,.10,.22,'triangle');
   setTimeout(()=>tone(659,.10,.22,'triangle'),105);
   setTimeout(()=>tone(784,.12,.24,'triangle'),210);
   setTimeout(()=>tone(1047,.20,.27,'sine'),330);
   setTimeout(()=>{tone(784,.28,.16,'sine');tone(988,.28,.14,'sine');tone(1319,.32,.12,'sine')},455);
 }catch(e){}
};

window.__bossDefeatFX=(()=>{
 let lock=false;
 return ()=>{
  if(lock)return;lock=true;setTimeout(()=>lock=false,2600);
  window.__raidClearSound?.();
  const ov=document.createElement('div');ov.className='defeatCinematic';
  ov.innerHTML='<div class="defeatFlash"></div><div class="defeatLines"></div><div class="defeatTitle"><small>BOSS DEFEATED</small><b>RAID CLEAR</b></div>';
  document.body.appendChild(ov);
  const boss=document.getElementById('bossSprite');
  if(boss){boss.classList.add('defeatBoss');}
  try{tone(180,.20,.24,'sawtooth');setTimeout(()=>tone(360,.18,.22,'square'),180);setTimeout(()=>tone(720,.32,.24,'sine'),430)}catch(e){}
  setTimeout(()=>boss?.classList.add('defeatBurst'),380);
  setTimeout(()=>{boss?.classList.remove('defeatBoss','defeatBurst');ov.classList.add('out')},1750);
  setTimeout(()=>ov.remove(),2300);
 };
})();

socket.on('result',d=>{playing=false;if(d?.win)window.__bossDefeatFX?.();
 const ps=state?.players||[];
 const p1=ps[0]||{},p2=ps[1]||{};
 const calcAcc=p=>{const h=Number(p.hits||0),m=Number(p.misses||0);return h+m?Math.round(h/(h+m)*100):0};
 const calcWpm=p=>Math.round((Number(p.hits||0)/5)/Math.max(1,(Date.now()-startAt)/60000));
 const teamDmg=Number(p1.damage||0)+Number(p2.damage||0);
 const teamHits=Number(p1.hits||0)+Number(p2.hits||0),teamMiss=Number(p1.misses||0)+Number(p2.misses||0);
 const teamAcc=teamHits+teamMiss?Math.round(teamHits/(teamHits+teamMiss)*100):0;
 const maxCombo=Math.max(Number(p1.maxCombo||0),Number(p2.maxCombo||0));
 const win=!!d.win;
 let rank='C';
 if(win&&teamAcc>=97&&maxCombo>=80)rank='S';
 else if(win&&teamAcc>=92)rank='A';
 else if(win)rank='B';
 document.getElementById('teamRank').textContent=rank;
 document.getElementById('teamRank').dataset.rank=rank;
 document.getElementById('resultP1Name').textContent=p1.name||'P1';
 document.getElementById('resultP2Name').textContent=p2.name||'P2';
 document.getElementById('resultP1Stats').innerHTML=`WPM <b>${calcWpm(p1)}</b><br>ACC <b>${calcAcc(p1)}%</b><br>DMG <b>${Number(p1.damage||0)}</b><br>MAX COMBO <b>${Number(p1.maxCombo||0)}</b><br>MISS <b>${Number(p1.misses||0)}</b>`;
 document.getElementById('resultP2Stats').innerHTML=`WPM <b>${calcWpm(p2)}</b><br>ACC <b>${calcAcc(p2)}%</b><br>DMG <b>${Number(p2.damage||0)}</b><br>MAX COMBO <b>${Number(p2.maxCombo||0)}</b><br>MISS <b>${Number(p2.misses||0)}</b>`;
 document.getElementById('resultTeamDamage').textContent=`${teamDmg} DMG`;
 document.getElementById('resultTeamStats').innerHTML=`TEAM ACC <b>${teamAcc}%</b><br>MAX COMBO <b>${maxCombo}</b><br>TOTAL MISS <b>${teamMiss}</b>`;

 const ca=document.getElementById('coopResultActions');
 const tb=document.getElementById('legacyTitleBtn');
 if(ca)ca.hidden=false;
 if(tb)tb.style.display='none';
 setLegacyRematchDiff(state?.difficulty||coopDifficulty||'normal');music.pause();$('game').classList.add('hidden');$('result').classList.remove('hidden');$('resultTitle').textContent=d.win?'BOSS DEFEATED!':'GAME OVER';const sec=Math.max(1,(Date.now()-startAt)/1000),wpm=Math.round((typed/5)/(sec/60)),acc=Math.round(100*typed/Math.max(1,typed+misses));$('resultStats').textContent=`WPM ${wpm} / ACC ${acc}% / ${Math.round(sec)} sec`});
setInterval(()=>{if(linkUntil>Date.now())$('linkTimer').textContent=((linkUntil-Date.now())/1000).toFixed(1);else $('linkTimer').textContent='READY';if(state?.breakEvent)render()},100);

/* TYPE RAID 2.18.1 — SOLO pause */
let __soloPaused=false,__pauseStartedAt=0;
function __setSoloPause(paused){
 if(!document.body.classList.contains("solo-mode"))return;
 if(paused&&!__soloPaused)__pauseStartedAt=Date.now();
 if(!paused&&__soloPaused&&__pauseStartedAt){
   try{ if(typeof startTime!=="undefined") startTime+=Date.now()-__pauseStartedAt; }catch(e){}
   const pausedFor=Date.now()-__pauseStartedAt;
   window.dispatchEvent(new CustomEvent("trSoloResume",{detail:{pausedFor}}));
   __pauseStartedAt=0;
 }
 __soloPaused=paused;
 const ov=document.getElementById("pauseOverlay");
 if(ov)ov.classList.toggle("hidden",!paused);
 document.body.classList.toggle("solo-paused",paused);
 try{
   if(paused){ if(music&&!music.paused) music.pause(); }
   else if(soundOn&&music){ music.play().catch(()=>{}); }
 }catch(e){}
}
document.addEventListener("keydown",(e)=>{
 if(__soloPaused){
   e.preventDefault();e.stopImmediatePropagation();
 }
},true);


let __abyssCurse=null,__abyssCurseTimer=null,__abyssCurseLoop=null;
const __curseWords=[["闇を払え","yamiwoharae"],["光をつかめ","hikariwotukame"],["前を向け","maewomuke"],["呪いを砕け","noroiwokudake"]];
function __clearAbyssCurse(){
 if(__abyssCurseTimer){clearTimeout(__abyssCurseTimer);__abyssCurseTimer=null}
 __abyssCurse=null;
 const o=document.getElementById("v262Curse");if(o)o.hidden=true;
}
function __startAbyssCurse(){
 if(__abyssCurse||__soloPaused||!playing||!window.__soloMode||window.__soloDifficulty!=="normal"||!state||state.phase<2)return;
 const w=__curseWords[Math.floor(Math.random()*__curseWords.length)];
 __abyssCurse={jp:w[0],roma:w[1],pos:0};
 const o=document.getElementById("v262Curse");
 if(o){o.hidden=false;document.getElementById("v262CurseJp").textContent=w[0];document.getElementById("v262CurseRoma").textContent=w[1];document.getElementById("v262CurseBar").style.animation="none";void document.getElementById("v262CurseBar").offsetWidth;document.getElementById("v262CurseBar").style.animation="curseCountdown 6s linear forwards"}
 flash("⚠ 深淵の呪い！ 6秒以内に解除せよ","bad");
 __abyssCurseTimer=setTimeout(()=>{
   if(!__abyssCurse)return;
   const m=me();if(m&&!m.dead){m.hp=Math.max(0,m.hp-28);bossAttack();render();flash("🌑 CURSE HIT -28","bad");if(m.hp<=0){m.dead=true;render();setTimeout(()=>window.__finishSolo?.(false),300)}}
   __clearAbyssCurse();
 },6000);
}
document.addEventListener("keydown",e=>{
 if(!__abyssCurse||e.ctrlKey||e.altKey||e.metaKey||e.key.length!==1)return;
 e.preventDefault();e.stopImmediatePropagation();
 const c=__abyssCurse, expected=c.roma[c.pos];
 if(e.key.toLowerCase()===expected){
   c.pos++;keySound();
   const done=c.roma.slice(0,c.pos),rest=c.roma.slice(c.pos);
   const el=document.getElementById("v262CurseRoma");if(el)el.innerHTML=`<span>${done}</span>${rest}`;
   if(c.pos>=c.roma.length){__clearAbyssCurse();flash("✨ CURSE BREAK!","good")}
 }else{missSound();flash("MISS","bad")}
},true);


let __valgaOD=null,__valgaODTimer=null,__valgaODLoop=null;
const __odWords=[["限界を超えろ","genkaiwokoero"],["一気に決めろ","ikkinnikimero"],["最後まで走れ","saigomadehasire"],["ここで負けるな","kokodemakeruna"]];
function __clearValgaOD(){
 if(__valgaODTimer){clearTimeout(__valgaODTimer);__valgaODTimer=null}
 __valgaOD=null;
 const o=document.getElementById("v263OD");if(o)o.hidden=true;
}
function __startValgaOD(){
 if(__valgaOD||__soloPaused||!playing||!window.__soloMode||window.__soloDifficulty!=="hard"||!state||state.phase<2)return;
 const phase=state.phase||2, limit=phase>=3?4000:5500, damage=phase>=3?42:32;
 const w=__odWords[Math.floor(Math.random()*__odWords.length)];
 __valgaOD={jp:w[0],roma:w[1],pos:0,damage};
 const o=document.getElementById("v263OD");
 if(o){
  o.hidden=false;o.classList.toggle("final",phase>=3);
  document.getElementById("v263ODPhase").textContent=phase>=3?"FINAL OVERDRIVE":"OVERDRIVE";
  document.getElementById("v263ODJp").textContent=w[0];
  document.getElementById("v263ODRoma").textContent=w[1];
  document.getElementById("v263ODLimit").textContent=(limit/1000).toFixed(1);
  const b=document.getElementById("v263ODBar");b.style.animation="none";void b.offsetWidth;b.style.animation=`odCountdown ${limit}ms linear forwards`;
 }
 flash(`🚨 OVERDRIVE！ ${(limit/1000).toFixed(1)}秒以内に迎撃せよ`,"bad");
 __valgaODTimer=setTimeout(()=>{
  if(!__valgaOD)return;
  const m=me();if(m&&!m.dead){m.hp=Math.max(0,m.hp-damage);bossAttack();render();flash(`💥 OVERDRIVE HIT -${damage}`,"bad");if(m.hp<=0){m.dead=true;render();setTimeout(()=>window.__finishSolo?.(false),300)}}
  __clearValgaOD();
 },limit);
}
document.addEventListener("keydown",e=>{
 if(!__valgaOD||e.ctrlKey||e.altKey||e.metaKey||e.key.length!==1)return;
 e.preventDefault();e.stopImmediatePropagation();
 const c=__valgaOD, expected=c.roma[c.pos];
 if(e.key.toLowerCase()===expected){
  c.pos++;keySound();
  const el=document.getElementById("v263ODRoma");if(el)el.innerHTML=`<span>${c.roma.slice(0,c.pos)}</span>${c.roma.slice(c.pos)}`;
  if(c.pos>=c.roma.length){__clearValgaOD();flash("⚡ OVERDRIVE BREAK!","good")}
 }else{missSound();flash("MISS","bad")}
},true);


/* v2.18.1 ULT / DUAL CAST */
let soloUlt=0,ultBuffUntil=0,coopUltBuffUntil=0,ultRushLast=false,autoUltLock=false;
function ultPlayers(){
 const ps=state?.players||[], mine=me(), other=partner();
 return {mine,other,p1:ps[0],p2:ps[1]};
}
function updateUltHud(){
 const {mine,p1,p2}=ultPlayers();
 const a=window.__soloMode?(soloUlt||0):(p1?.ult||0);
 const b=window.__soloMode?0:(p2?.ult||0);
 const set=(id,val)=>{const e=document.getElementById(id);if(e)e.style.width=Math.max(0,Math.min(100,val))+'%'};
 set('p1UltBar',a);set('p2UltBar',b);
 const t1=document.getElementById('p1UltText'),t2=document.getElementById('p2UltText');
 if(t1)t1.textContent=Math.round(a)+'%';if(t2)t2.textContent=Math.round(b)+'%';
 const my=window.__soloMode?a:(mine?.ult||0), dual=!window.__soloMode&&a>=100&&b>=100;
 const ready=my>=100&&playing;
 if(my<100)autoUltLock=false;
 if(ready&&!autoUltLock){autoUltLock=true;setTimeout(()=>{if(playing)castUlt()},20)}
 const btn=document.getElementById('ultButton');if(btn){
   btn.disabled=true;
   btn.innerHTML=ready
    ?`<span class="ultKey">AUTO</span><span class="ultAction">${dual?'⚡ DUAL CAST!':'⚡ ULT!'}</span>`
    :'<span class="ultKey">AUTO</span><span class="ultAction">ULT</span>';
   btn.classList.toggle('ready',ready);
 }
 document.body.classList.toggle('my-ult-ready',my>=100&&playing);
 const buffEnd=window.__soloMode?ultBuffUntil:coopUltBuffUntil;
 const buffActive=Date.now()<buffEnd;
 document.body.classList.toggle('ult-double-active',buffActive);
 const rt=document.getElementById('ultRushTime');if(rt)rt.textContent=buffActive?Math.max(0,(buffEnd-Date.now())/1000).toFixed(1):'';
 if(buffActive&&!ultRushLast){
   const fx=document.getElementById('ultRushFx');if(fx){fx.classList.remove('start');void fx.offsetWidth;fx.classList.add('start')}
 }
 ultRushLast=buffActive;
 const dc=document.getElementById('dualCastReady');if(dc){dc.classList.toggle('ready',dual);dc.textContent=dual?'⚡ DUAL CAST READY!':'DUAL CAST';}
}
function ultVisual(dual=false){
 const ov=document.createElement('div');ov.className='ultCinematic ultFeverStart '+(dual?'dual':'single');
 ov.innerHTML=`<div class="ultTitle"><b>${dual?'DUAL FEVER':'FEVER MODE'}</b><small>5 SEC · POINT ×2</small></div>`;
 document.body.appendChild(ov);
 try{tone(620,.08,.12,'sine');setTimeout(()=>tone(880,.09,.12,'sine'),80);setTimeout(()=>tone(1240,.12,.13,'sine'),160)}catch(e){}
 setTimeout(()=>ov.classList.add('out'),620);setTimeout(()=>ov.remove(),900);
}
function castUlt(){
 if(!playing)return;
 if(window.__soloMode){
   if(soloUlt<100)return;soloUlt=0;ultBuffUntil=Date.now()+5000;
   if(!me())return;ultVisual(false);updateUltHud();
   flash('⚡ ULTIMATE! 5秒間 POINT ×2','linkAttack');
 }else socket.emit('castUlt');
}
setInterval(()=>{if(playing)updateUltHud()},120);
socket.on('ultCast',d=>{if(d?.playerId===socket.id||d?.dual)coopUltBuffUntil=Date.now()+5000;ultVisual(!!d.dual);flash(d.dual?'⚡ DUAL CAST! 5秒間 POINT ×2':'⚡ ULTIMATE! 5秒間 POINT ×2','linkAttack')});

document.addEventListener('keydown',e=>{
 if(!playing||e.ctrlKey||e.altKey||e.metaKey||e.key.length!==1)return;
 const m=me();if(!m||m.dead)return;
 if(revive&&!window.__soloMode){socket.emit('reviveHit');keySound();return}
 if(!current)return;
 const rk=romaKey(e.key);
 if(rk.ok){
   const fired=e.key.toLowerCase();pos=romaTyped.length;typed++;combo++;keySound();
   const crit=combo%25===0;projectile(fired,'me',crit);window.__trComboFX?.(combo);
   const fcn=document.getElementById('focusComboNum');if(fcn)fcn.textContent=combo;
   const fch=document.getElementById('focusCombo');if(fch){fch.classList.remove('tick');void fch.offsetWidth;fch.classList.add('tick')}
   if((window.__soloMode?Date.now()<ultBuffUntil:Date.now()<coopUltBuffUntil))window.__ultRushHit?.(combo,crit);
   if(window.__soloMode){
     let dmg=crit?30:10;
     if(Date.now()<ultBuffUntil)dmg*=2;
     soloUlt=Math.min(100,soloUlt+2);updateUltHud();
     m.hits++;m.damage+=dmg;m.combo=combo;m.maxCombo=Math.max(m.maxCombo||0,combo);
     state.bossHp=Math.max(0,state.bossHp-dmg);
     state.phase=state.bossHp<=state.bossMaxHp/2?2:1;
     render();
     if(state.bossHp<=0){window.__bossDefeatFX?.();setTimeout(()=>window.__finishSolo?.(true),1450);return}
   }else{
     socket.emit('hit',{combo,letter:fired});
     socket.emit('progress',{progress:romaTyped.length/Math.max(1,romaDisplay.length)});
   }
   drawWord();
   if(rk.done){
     tone(900,.12,.2,'sine');
     if(!window.__soloMode)socket.emit('wordComplete');
     wordFinishBurst();flash('PERFECT!','good');pick()
   }
 }else{
   misses++;combo=0;window.__trComboReset?.();missSound();
   if(window.__soloMode){m.misses++;m.combo=0;soloUlt=Math.max(0,soloUlt-4);updateUltHud();render()}else socket.emit('miss');
   flash('MISS','bad')
 }
});



/* TYPE RAID 2.3 — combo rush / FEVER feedback */
(()=>{
 let lastTier=0;
 function tier(c){return c>=100?4:c>=50?3:c>=25?2:c>=10?1:0}
 window.__trComboFX=(c)=>{
   const t=tier(c),body=document.body;
   body.classList.toggle('combo-hot',c>=25);
   body.classList.toggle('combo-fever',c>=100);
   if(t>lastTier){
     const labels={1:'10 COMBO!',2:'25 COMBO — POWER UP!',3:'50 COMBO — RUSH!',4:'🔥 FEVER! 100 COMBO 🔥'};
     flash(labels[t],'good');
     const a=document.getElementById('arena');
     if(a){a.classList.remove('comboBurst');void a.offsetWidth;a.classList.add('comboBurst');setTimeout(()=>a.classList.remove('comboBurst'),500)}
     if(t>=2)bossHit(true);
     try{tone(t===4?1320:t===3?1100:t===2?920:760,.10+t*.025,.12+t*.02,'square')}catch(e){}
   }
   lastTier=t;
 };
 window.__trComboReset=()=>{lastTier=0;document.body.classList.remove('combo-hot','combo-fever');const n=document.getElementById('focusComboNum');if(n)n.textContent='0';const mt=document.getElementById('missFlashText');if(mt){mt.classList.remove('show');void mt.offsetWidth;mt.classList.add('show')}document.body.classList.remove('miss-red-flash');void document.body.offsetWidth;document.body.classList.add('miss-red-flash');setTimeout(()=>document.body.classList.remove('miss-red-flash'),180)};
})();

/* TYPE RAID 2.1.1 — fixed menu / real SOLO / replay */
(()=>{
 const q=id=>document.getElementById(id);
 let mode="menu", soloAttackTimer=null, soloStart=0, resultLocked=false;
 const soloBosses={
   easy:{label:"EASY",name:"翠晶獣 リム",icon:"◉",hp:4200,attackMs:6500,attack:7,css:"boss-easy"},
   normal:{label:"NORMAL",name:"深淵の魔王 アビス",icon:"☠",hp:6500,attackMs:5200,attack:9,css:"boss-normal"},
   hard:{label:"HARD",name:"機装竜 ヴァルガ",icon:"◆",hp:9000,attackMs:3900,attack:12,css:"boss-hard"}
 };
 let soloDifficulty="normal";
 window.__soloDifficulty=soloDifficulty;
 window.addEventListener("trSoloResume",(e)=>{
   if(mode==="solo"&&e.detail?.pausedFor) soloStart+=e.detail.pausedFor;
 });

 function stopSolo(){
   if(soloAttackTimer){clearInterval(soloAttackTimer);soloAttackTimer=null}
   window.__soloMode=false;
 }
 function showMenu(){
   const __arena=document.getElementById("arena");
   if(__arena)__arena.classList.remove("ind-stage-easy","ind-stage-normal","ind-stage-hard");
   stopSolo();__clearAbyssCurse();if(__abyssCurseLoop){clearInterval(__abyssCurseLoop);__abyssCurseLoop=null}__clearValgaOD();if(__valgaODLoop){clearInterval(__valgaODLoop);__valgaODLoop=null} playing=false; music.pause();
   q("game").classList.add("hidden");
   q("home").classList.add("hidden");
   q("waiting").classList.add("hidden");
   q("result").classList.add("hidden");
   q("v21Result").hidden=true;
   q("bossSelect").hidden=true;
   q("v21Menu").hidden=false;
   mode="menu"; document.body.classList.remove("solo-mode","rim-accelerated");
 }
 function showPanel(kind){
   const p=q("v21MenuPanel");p.hidden=false;
   p.innerHTML=kind==="how"
    ?"<b>HOW TO PLAY</b><p>日本語をローマ字で入力！ 正解するたび文字弾がボスへ飛びます。25コンボごとにCRITICAL。CO-OPではLINK・BREAK・TEAM HEALで共闘できます。</p>"
    :"<b>SETTINGS</b><p>戦闘中、画面上部からBGMとSEの音量を調整できます。</p>";
 }
 function startSolo(){
   soloUlt=0;ultBuffUntil=0;setTimeout(updateUltHud,0);
   const boss=soloBosses[soloDifficulty]||soloBosses.normal;
   window.__soloDifficulty=soloDifficulty;
   __lastSoloPhase=1;__phaseFxLock=false;document.body.classList.remove("rim-accelerated");
   __clearAbyssCurse();if(__abyssCurseLoop){clearInterval(__abyssCurseLoop);__abyssCurseLoop=null}
   __clearValgaOD();if(__valgaODLoop){clearInterval(__valgaODLoop);__valgaODLoop=null}
   mode="solo"; resultLocked=false; window.__soloMode=true; document.body.classList.add("solo-mode");__soloPaused=false;document.body.classList.remove("solo-paused");
   q("v21Menu").hidden=true;
   q("bossSelect").hidden=true;
   q("v21Result").hidden=true;
   room="SOLO";
   typed=0;misses=0;combo=0;window.__trComboReset?.();startAt=Date.now();soloStart=startAt;playing=true;revive=false;linkUntil=0;
   state={
     code:"SOLO",started:true,over:false,bossHp:boss.hp,bossMaxHp:boss.hp,phase:1,breakEvent:null,
     players:[{id:socket.id,name:"PLAYER 1",hp:120,damage:0,hits:0,misses:0,combo:0,maxCombo:0,progress:0,dead:false}]
   };
   q("bossName").textContent=`${boss.icon} BOSS　${boss.name}`;
   q("bossSprite").classList.remove("boss-easy","boss-normal","boss-hard","dead","rage");
   q("bossSprite").classList.add(boss.css);
   q("arena").classList.remove("ind-stage-easy","ind-stage-normal","ind-stage-hard");
   q("arena").classList.add(`ind-stage-${soloDifficulty}`);
   showGame();
   q("v21ModeBadge").textContent=`SOLO / ${boss.label}`;
   q("partnerName").textContent="SOLO MODE";
   q("partnerHp").textContent="—";
   q("partnerStats").textContent="LINK/BREAKはCO-OP専用";
   bar("partnerBar",0);bar("partnerTyping",0);bar("partnerTyping2",0);
   q("linkText").textContent="25 COMBOごとにCRITICAL";
   q("breakText").textContent=`${boss.label} RAID`; 
   bar("breakBar",0);
   render();pick();
   if(soundOn){music.volume=bgm;music.play().catch(()=>{})}
   flash(`${boss.label} RAID START!`,"good");
   const soloBossAttack=()=>{
     if(__soloPaused||!playing||!window.__soloMode||!state)return;
     const m=me();if(!m||m.dead)return;
     const dmg=boss.attack;m.hp=Math.max(0,m.hp-dmg);bossAttack();render();flash(`💥 BOSS ATTACK -${dmg}`,"bad");
     if(m.hp<=0){m.dead=true;render();setTimeout(()=>finishSolo(false),300)}
   };
   window.__restartSoloBossAttack=(ms)=>{
     if(soloAttackTimer)clearInterval(soloAttackTimer);
     soloAttackTimer=setInterval(soloBossAttack,ms);
   };
   window.__restartSoloBossAttack(boss.attackMs);
 }
 function finishSolo(win){
   if(resultLocked)return;resultLocked=true;playing=false;
   __clearAbyssCurse();if(__abyssCurseLoop){clearInterval(__abyssCurseLoop);__abyssCurseLoop=null}
   __clearValgaOD();if(__valgaODLoop){clearInterval(__valgaODLoop);__valgaODLoop=null}
   if(soloAttackTimer){clearInterval(soloAttackTimer);soloAttackTimer=null}
   music.pause();
   const m=me()||{},sec=Math.max(1,(Date.now()-soloStart)/1000);
   const wpm=Math.round((typed/5)/(sec/60)),acc=Math.round(100*typed/Math.max(1,typed+misses));
   const boss=soloBosses[soloDifficulty]||soloBosses.normal;
   let rank="C";
   if(win){
     const score=wpm+(acc*1.4)+(m.maxCombo||0)*.18-Math.min(30,misses*2);
     rank=score>=330&&acc>=96?"S":score>=255&&acc>=92?"A":score>=190&&acc>=85?"B":"C";
   }else rank="D";
   const key=`typeRaidBest_v251_${soloDifficulty}`;
   let best={};
   try{best=JSON.parse(localStorage.getItem(key)||"{}")||{}}catch(e){}
   let isRecord=false;
   if(win){
     if(!best.time||sec<best.time){best.time=sec;isRecord=true}
     if(!best.wpm||wpm>best.wpm){best.wpm=wpm;isRecord=true}
     if(best.acc==null||acc>best.acc){best.acc=acc;isRecord=true}
     if(!best.combo||(m.maxCombo||0)>best.combo){best.combo=m.maxCombo||0;isRecord=true}
     best.rank=rank;best.updated=Date.now();
     try{localStorage.setItem(key,JSON.stringify(best))}catch(e){}
   }
   q("v21ResultDifficulty").textContent=`${boss.label} RAID`;
   q("v251Boss").textContent=boss.name;
   q("v251Rank").textContent=rank;
   q("v251Rank").className=`v251Rank rank-${rank.toLowerCase()}`;
   q("v251Record").hidden=!isRecord;
   q("v21ResultTitle").textContent=win?"RAID CLEAR":"RAID FAILED";
   q("v21ResultTitle").className="v21ResultTitle "+(win?"win":"lose");
   q("v21ResultStats").innerHTML=
    `<div><b>${m.damage||0}</b><small>DAMAGE</small></div>
     <div><b>${wpm}</b><small>WPM</small>${best.wpm?`<em>BEST ${best.wpm}</em>`:""}</div>
     <div><b>${acc}%</b><small>ACCURACY</small>${best.acc!=null?`<em>BEST ${best.acc}%</em>`:""}</div>
     <div><b>${m.maxCombo||0}</b><small>MAX COMBO</small>${best.combo!=null?`<em>BEST ${best.combo}</em>`:""}</div>
     <div><b>${misses}</b><small>MISS</small></div>
     <div><b>${sec.toFixed(1)}s</b><small>TIME</small>${best.time?`<em>BEST ${best.time.toFixed(1)}s</em>`:""}</div>`;
   q("v21ReplayNote").textContent=win?`${boss.label} / ${rank} RANK`:"再挑戦してボスを撃破しよう";
   const rd=document.getElementById('rematchDifficulty');
 if(rd){
   rd.hidden=(mode==="solo");
   if(mode==="coop")setRematchDifficulty(state?.difficulty||coopDifficulty||"normal");
 }
 q("v21Result").hidden=false;
 }
 
 /* TYPE RAID 2.18.1 — SOLO phase foundation (visual only; battle logic stays stable) */
 let __lastSoloPhase=1,__phaseFxLock=false;
 function __phaseFromHp(){
   if(!state||!state.bossMaxHp)return 1;
   const ratio=state.bossHp/state.bossMaxHp;
   if(soloDifficulty==="hard") return ratio<=.30?3:ratio<=.70?2:1;
   return ratio<=.50?2:1;
 }
 function __applySoloPhase(){
   if(mode!=="solo"||!state||state.over)return;
   const p=__phaseFromHp();
   state.phase=p;
   const phaseEl=document.getElementById("phase");
   if(phaseEl)phaseEl.textContent=`PHASE ${p}`;
   const sprite=document.getElementById("bossSprite");
   if(sprite){
     sprite.classList.toggle("phase-2",p>=2);
     sprite.classList.toggle("phase-3",p>=3);
   }
   if(p>__lastSoloPhase&&!__phaseFxLock){
     const prevPhase=__lastSoloPhase;
     __lastSoloPhase=p;__phaseFxLock=true;
     const fx=document.getElementById("v260PhaseFx");
     if(fx){
       fx.querySelector("b").textContent=`PHASE ${p}`;
       fx.querySelector("span").textContent=p>=3?"FINAL PHASE":"BOSS AWAKENING";
       fx.hidden=false;
       requestAnimationFrame(()=>fx.classList.add("show"));
       setTimeout(()=>fx.classList.remove("show"),1250);
       setTimeout(()=>{fx.hidden=true;__phaseFxLock=false},1550);
     }else __phaseFxLock=false;
     flash(`⚠ PHASE ${p}`,"bad");
     if(soloDifficulty==="easy" && prevPhase<2 && p>=2){
       window.__restartSoloBossAttack?.(Math.round(soloBosses.easy.attackMs*.68));
       document.body.classList.add("rim-accelerated");
       setTimeout(()=>flash("⚡ リム固有技：アクセルパルス！ 攻撃速度UP","bad"),500);
     }
     if(soloDifficulty==="normal" && prevPhase<2 && p>=2){
       if(__abyssCurseLoop)clearInterval(__abyssCurseLoop);
       setTimeout(__startAbyssCurse,1800);
       __abyssCurseLoop=setInterval(__startAbyssCurse,15000);
     }
     if(soloDifficulty==="hard" && prevPhase<2 && p>=2){
       if(__valgaODLoop)clearInterval(__valgaODLoop);
       setTimeout(__startValgaOD,1600);
       __valgaODLoop=setInterval(__startValgaOD,13000);
     }
     if(soloDifficulty==="hard" && prevPhase<3 && p>=3){
       if(__valgaODLoop)clearInterval(__valgaODLoop);
       setTimeout(__startValgaOD,1400);
       __valgaODLoop=setInterval(__startValgaOD,10000);
       setTimeout(()=>flash("🔥 FINAL OVERDRIVE：制限時間短縮！","bad"),650);
     }
   }
 }
 const __renderBeforePhase=render;
 render=function(){__renderBeforePhase();__applySoloPhase()};

window.__finishSolo=finishSolo;

 /* DEV TEST: F8 sets SOLO boss HP to 100 for quick result testing. */
 document.addEventListener("keydown",(e)=>{
   if(e.key!=="F8" || mode!=="solo" || !playing || !state)return;
   e.preventDefault();
   state.bossHp=Math.min(state.bossHp,100);
   render();
   flash("🧪 TEST MODE：BOSS HP → 100","good");
 });


 function startCoop(){
   stopSolo();mode="coop";window.__soloMode=false;resultLocked=false; __soloPaused=false; document.body.classList.remove("solo-mode","solo-paused");
   q("bossName").textContent="☠ BOSS　深淵の魔王 アビス";
   q("bossSprite").classList.remove("boss-easy","boss-hard","dead","rage");
   q("bossSprite").classList.add("boss-normal");
   q("v21Menu").hidden=true;
   q("v21Result").hidden=true;
   q("game").classList.add("hidden");
   q("waiting").classList.add("hidden");
   q("result").classList.add("hidden");
   q("home").classList.remove("hidden");
   q("v21ModeBadge").textContent="CO-OP";
   q("name").focus();
 }
 q("v21Solo").addEventListener("click",()=>{
   q("v21Menu").hidden=true;
   q("bossSelect").hidden=false;
 });
 q("bossSelectBack").addEventListener("click",showMenu);
 document.querySelectorAll(".bossChoice").forEach(btn=>btn.addEventListener("click",()=>{
   soloDifficulty=btn.dataset.difficulty||"normal";
   window.__soloDifficulty=soloDifficulty;
   startSolo();
 }));
 q("v21Coop").addEventListener("click",startCoop);
 q("v21How").addEventListener("click",()=>showPanel("how"));
 q("v21Settings").addEventListener("click",()=>showPanel("settings"));
 q("v21MenuBtn").addEventListener("click",showMenu);
 q("v21BackMenu").addEventListener("click",showMenu);
 
q("soloPauseBtn")?.addEventListener("click",()=>__setSoloPause(true));
q("resumeBtn")?.addEventListener("click",()=>__setSoloPause(false));
q("pauseMenuBtn")?.addEventListener("click",()=>{
 __setSoloPause(false);
 try{socket.emit("leaveRoom")}catch(e){}
 showMenu();
});
q("battleExitBtn").addEventListener("click",()=>{
   if(!window.confirm("戦闘を中断してメニューに戻りますか？")) return;
   try{ socket.emit("leaveRoom"); }catch(e){}
   showMenu();
 });
 q("coopBackBtn")?.addEventListener("click",showMenu);
 q("roomBackBtn")?.addEventListener("click",()=>{
   try{socket.emit("leaveRoom")}catch(e){}
   showMenu();
 });
 q("v21Replay").addEventListener("click",()=>{
   q("v21Result").hidden=true;resultLocked=false;
   if(mode==="solo")startSolo();
   else{
     q("v21ReplayNote").textContent="相方の再戦READYを待っています…";
     socket.emit("replayReady");
   }
 });
 socket.on("replayStarted",()=>{
   if(mode!=="coop")return;
   q("v21Result").hidden=true;resultLocked=false;
   socket.emit("startGame");
 });
})();



/* TYPE RAID 2.1.4 AUDIO — calm generated BGM + typing SE */
(()=>{
 let ctx=null, master=null, bgGain=null, seGain=null, bgTimer=null, bgStep=0;
 const AC=window.AudioContext||window.webkitAudioContext;
 function init(){
   if(ctx||!AC)return;
   ctx=new AC();
   master=ctx.createGain(); master.gain.value=.9; master.connect(ctx.destination);
   bgGain=ctx.createGain(); bgGain.gain.value=.08; bgGain.connect(master);
   seGain=ctx.createGain(); seGain.gain.value=.72; seGain.connect(master);
 }
 function resume(){init(); if(ctx?.state==="suspended")ctx.resume()}
 function osc(freq,dur,vol=.08,type="sine",dest=bgGain,delay=0,attack=.03){
   if(!ctx)return;
   const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+delay;
   o.type=type;o.frequency.setValueAtTime(freq,t);
   const a=Math.min(attack,Math.max(.001,dur*.35));
   g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+a);
   g.gain.exponentialRampToValueAtTime(.0001,t+dur);
   o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.05);
 }
 function chord(root){
   // soft minor/add9 pad
   [1,1.1892,1.4983,2.2449].forEach((r,i)=>osc(root*r,2.8,.025,"sine",bgGain,i*.025));
   osc(root/2,2.4,.018,"triangle",bgGain,0);
 }
 function startBgm(){
   resume(); if(bgTimer)return;
   const roots=[110,98,130.81,87.31]; // A, G, C, F — calm loop
   chord(roots[0]);
   bgTimer=setInterval(()=>{bgStep=(bgStep+1)%roots.length;chord(roots[bgStep])},2600);
 }
 function stopBgm(){if(bgTimer){clearInterval(bgTimer);bgTimer=null}}
 window.__v214KeySound=()=>{
   resume();
   // Light, crisp arcade typing click: less metallic than the previous blue-switch version.
   // Newly generated sound; aims for the same kind of quick, pleasant feedback.
   osc(680,.026,.085,"triangle",seGain,0,.001);
   osc(1180,.018,.070,"square",seGain,.001,.001);
   osc(1780,.012,.030,"sine",seGain,.003,.001);
 };
 window.__v214MissSound=()=>{resume();osc(170,.11,.10,"sawtooth",seGain,0)};
 window.__v214StartBgm=startBgm;
 window.__v214StopBgm=stopBgm;
 window.__v214SetBgm=v=>{resume();if(bgGain)bgGain.gain.value=Math.max(0,Math.min(1,Number(v)))*.7};
 window.__v214SetSe=v=>{resume();if(seGain)seGain.gain.value=Math.max(0,Math.min(1,Number(v)))};
 document.addEventListener("pointerdown",()=>{resume();startBgm()},{once:true});
 document.addEventListener("keydown",resume,{once:true});
})();

/* v2.1.4 compatibility hooks */
try{
 const __oldKeySound=keySound;
 keySound=function(){ try{window.__v214KeySound?.()}catch(e){} };
}catch(e){}
try{
 const __oldMissSound=missSound;
 missSound=function(){ /* v2.18.1: MISS is visual-only */ };
}catch(e){}

/* Keep generated BGM alive when battle/menu audio is expected. */
document.addEventListener("click",()=>window.__v214StartBgm?.());


/* TYPE RAID 2.1.9 — safe menu BGM add-on. Existing v2.1.8 battle audio is untouched. */
(()=>{
 let menuCtx=null, menuGain=null, menuTimer=null, step=0;
 const AC=window.AudioContext||window.webkitAudioContext;

 function ensure(){
   if(menuCtx||!AC)return;
   menuCtx=new AC();
   menuGain=menuCtx.createGain();
   menuGain.gain.value=.045; // deliberately very quiet
   menuGain.connect(menuCtx.destination);
 }
 function tone(f,d=.9,v=.05,delay=0){
   ensure(); if(!menuCtx)return;
   const o=menuCtx.createOscillator(),g=menuCtx.createGain(),t=menuCtx.currentTime+delay;
   o.type="sine";o.frequency.value=f;
   g.gain.setValueAtTime(.0001,t);
   g.gain.exponentialRampToValueAtTime(v,t+.12);
   g.gain.exponentialRampToValueAtTime(.0001,t+d);
   o.connect(g);g.connect(menuGain);o.start(t);o.stop(t+d+.03);
 }
 function phrase(){
   const roots=[130.81,110,146.83,98];
   const r=roots[step++%roots.length];
   tone(r,2.7,.035,0);
   tone(r*1.4983,2.3,.018,.12);
   tone(r*2,1.8,.010,.28);
 }
 function start(){
   ensure();
   if(menuCtx?.state==="suspended")menuCtx.resume();
   if(menuTimer)return;
   phrase(); menuTimer=setInterval(phrase,3200);
 }
 function stop(){
   if(menuTimer){clearInterval(menuTimer);menuTimer=null}
 }
 window.__v219MenuBgmStart=start;
 window.__v219MenuBgmStop=stop;

 // Browsers require a user gesture before audio starts.
 document.addEventListener("pointerdown",()=>{
   if(!playing) start();
 },{once:true});

 // Stop menu ambience when entering either game mode.
 document.getElementById("v21Solo")?.addEventListener("click",stop);
 document.getElementById("v21Coop")?.addEventListener("click",stop);

 // Resume it when returning to the main menu.
 ["v21MenuBtn","v21BackMenu"].forEach(id=>{
   document.getElementById(id)?.addEventListener("click",()=>setTimeout(start,30));
 });
})();


/* v2.18.1 same-room CO-OP rematch */
let rematchDifficulty=null;
function setRematchDifficulty(d){
 if(!['easy','normal','hard'].includes(d))return;
 rematchDifficulty=d;
 document.querySelectorAll('.rematchDiff').forEach(b=>b.classList.toggle('active',b.dataset.diff===d));
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('.rematchDiff');
 if(!b)return;
 e.preventDefault();e.stopPropagation();
 setRematchDifficulty(b.dataset.diff);
},true);
function coopRematch(){
 if(mode==="solo")return;
 const d=rematchDifficulty||state?.difficulty||'normal';
 const b=document.getElementById('v21Replay');
 if(b){b.disabled=true;b.textContent='相方を待っています... 1/2'}
 socket.emit('rematchReady',{difficulty:d});
}
socket.on('rematchStatus',d=>{
 if(d.difficulty)setRematchDifficulty(d.difficulty);
 const b=document.getElementById('v21Replay');
 if(b){
   b.disabled=d.ready>=d.total;
   b.textContent=d.ready>=d.total?'再戦開始！':`同じROOMで再挑戦 (${d.ready}/${d.total})`;
 }
});

document.addEventListener('click',e=>{
 const b=e.target.closest?.('#v21Replay');
 if(!b||mode==="solo")return;
 e.preventDefault();e.stopImmediatePropagation();
 coopRematch();
},true);

socket.on('result',()=>setTimeout(()=>setRematchDifficulty(state?.difficulty||'normal'),0));

socket.on('result',()=>{
 const rd=document.getElementById('rematchDifficulty');
 if(rd){rd.style.display=mode==="solo"?"none":"block";if(mode==="coop")setRematchDifficulty(state?.difficulty||'normal');}
});

/* v2.18.1 — actual CO-OP GAME OVER/CLEAR rematch controls */
let legacyRematchDiff='normal';
function setLegacyRematchDiff(d){
 if(!['easy','normal','hard'].includes(d))return;
 legacyRematchDiff=d;
 document.querySelectorAll('[data-rematch-diff]').forEach(b=>b.classList.toggle('active',b.dataset.rematchDiff===d));
}
document.addEventListener('click',e=>{
 const d=e.target.closest?.('[data-rematch-diff]');
 if(d){e.preventDefault();setLegacyRematchDiff(d.dataset.rematchDiff);return}
 const b=e.target.closest?.('#coopRematchBtn');
 if(!b)return;
 e.preventDefault();
 b.disabled=true;b.textContent='相方を待っています…';
 socket.emit('rematchReady',{difficulty:legacyRematchDiff});
});
socket.on('rematchStatus',d=>{
 if(d?.difficulty)setLegacyRematchDiff(d.difficulty);
 const s=document.getElementById('coopRematchStatus');
 const b=document.getElementById('coopRematchBtn');
 if(s)s.textContent=`READY ${d.ready}/${d.total}`;
 if(b&&d.ready<d.total)b.textContent=`相方を待っています… (${d.ready}/${d.total})`;
});
socket.on('gameStart',d=>{
 if(!d?.rematch)return;
 const r=document.getElementById('result'); if(r)r.classList.add('hidden');
 const g=document.getElementById('game'); if(g)g.classList.remove('hidden');
 const b=document.getElementById('coopRematchBtn');if(b){b.disabled=false;b.textContent='同じROOMで再挑戦'}
 const s=document.getElementById('coopRematchStatus');if(s)s.textContent='';
 playing=true;startAt=Date.now();typed=0;misses=0;
});
/* v2.18.1 — ULT RUSH active feedback */
window.__ultRushHit=(combo,crit)=>{
 const a=document.getElementById('arena');if(!a)return;
 a.classList.remove('ultRushHit');void a.offsetWidth;a.classList.add('ultRushHit');
 setTimeout(()=>a.classList.remove('ultRushHit'),95);
 const layer=document.getElementById('damageLayer');
 if(layer&&combo%5===0){
   const t=document.createElement('b');t.className='ultRushPop';
   t.textContent=crit?'×2 CRITICAL!':`×2 RUSH ${combo}`;
   t.style.left=(46+Math.random()*8)+'%';t.style.top=(30+Math.random()*14)+'%';
   layer.appendChild(t);setTimeout(()=>t.remove(),430);
 }
 try{
   if(combo%5===0)tone(980+Math.min(combo,100)*3,.045,.055,'square');
   if(crit)setTimeout(()=>tone(1480,.07,.07,'sine'),25);
 }catch(e){}
};


