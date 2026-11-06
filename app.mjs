import {bouts,cues,moves,cue,judge,winner} from './core.mjs';
import {Hall} from './view.mjs';
import {BeaconHost} from './sdk.mjs';

const game='foil-finals', key=game+'-v1';
const el=id=>document.getElementById(id);
const buttons=[...document.querySelectorAll('[data-move]')];
function clean(data){
  const wins=bouts.map((_,i)=>data?.wins?.[i]===true);
  const requested=data?.level;
  const level=Number.isInteger(requested)&&bouts[requested]&&wins.slice(0,requested).every(Boolean)?requested:0;
  const score=[0,1].map(i=>{
    const n=data?.score?.[i];
    return Number.isInteger(n)?Math.max(0,Math.min(5,n)):0;
  });
  if(score[0]===5&&score[1]===5)score[1]=4;
  if(winner(score)>0)wins[level]=true;
  return {game,v:1,wins,level,score,gold:data?.gold===true,confetti:data?.confetti===true};
}
let local;
try{local=JSON.parse(localStorage.getItem(key));}catch{}
let state=clean(local), phase=winner(state.score)?'done':'ready';
let elapsed=0, move=-1, outcome=0, hall, active=false, audio, sound=true, support={};
const host=new BeaconHost(window,{
  status(value){support=value;rewards();},
  reward(name){
    if(state[name])return;
    state[name]=true;
    save();sync();
  },
  load(data){
    const remote=clean(data);
    if(!local&&!active&&state.score.every(n=>n===0)){
      state=remote;
      phase=winner(state.score)?'done':'ready';
    }else{
      state.wins=state.wins.map((won,i)=>won||remote.wins[i]);
      state.gold ||= remote.gold;
      state.confetti ||= remote.confetti;
    }
    sync();save();
  }
});
function save(){
  try{localStorage.setItem(key,JSON.stringify(state));}catch{}
  host.save(state);
}
function rewards(){
  const items=[];
  if(support.gold)items.push(state.gold?'Gold jacket earned':'Like in GameWave for a gold jacket');
  if(support.confetti)items.push(state.confetti?'Victory lights earned':'Comment in GameWave for victory lights');
  el('rewards').hidden=items.length===0;
  el('rewards').textContent=items.join(' · ')+(items.length?' · Once per saved profile.':'');
}
function playTone(f){
  if(!sound)return;
  try{
    audio ||= new AudioContext();
    audio.resume().catch(()=>{});
    const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
    oscillator.frequency.setValueAtTime(f,now);
    oscillator.frequency.exponentialRampToValueAtTime(f*.78,now+.17);
    gain.gain.setValueAtTime(.085,now);gain.gain.exponentialRampToValueAtTime(.001,now+.22);
    oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(now+.23);
  }catch{}
}
const round=()=>bouts[state.level];
const exchange=()=>state.score[0]+state.score[1]-(phase==='touch'?1:0);
const tell=()=>cue(state.level,Math.max(0,exchange()));
const responseWindow=()=>state.level===0?Infinity:state.level===1?2.8:2.2;
function sync(){
  const done=phase==='done', result=winner(state.score);
  el('event').textContent=round().name.toUpperCase();
  el('rival').textContent='vs. '+round().rival;
  el('you').textContent=state.score[0];
  el('them').textContent=state.score[1];
  el('start').hidden=phase!=='ready';
  el('start').textContent=state.score.some(Boolean)?'Resume · 继续 →':'Start bout · 开始 →';
  el('actions').hidden=phase==='ready'||done;
  el('result').hidden=!done;
  el('next').hidden=result!==1||state.level===bouts.length-1;
  el('verdict').textContent=result>0?(state.confetti?'✦ Bout won ✦':'Bout won'):'Opponent wins';
  const suggested=tell(), tutorial=state.level===0;
  const zh=['突刺','格挡','后撤'];
  const tellText=['对手露出空当','对手挥剑','对手冲上来'];
  buttons.forEach((button,i)=>{
    button.disabled=phase!=='act';
    button.classList.toggle('suggested',tutorial&&phase==='act'&&i===suggested);
  });
  el('phase').textContent={ready:'FIRST TO 5',read:'WATCH · 观察',act:tutorial?'TAKE YOUR TIME · 不限时':'RESPOND NOW · 现在出招',touch:outcome>0?'YOU SCORE · 你得分':'RIVAL SCORES · 对手得分',done:'FINAL SCORE'}[phase];
  el('call').textContent={
    ready:tutorial?'Training bout · 新手练习':'First to five touches',
    read:cues[suggested],
    act:tutorial?'Tap '+moves[suggested]+' · 点'+zh[suggested]:cues[suggested]+' · '+tellText[suggested],
    touch:outcome>0?moves[move]+' worked · +1':(move===-1?'Too late':'Try '+moves[suggested])+' · 应'+zh[suggested],
    done:result>0?'Victory on the piste':'Set for a rematch'
  }[phase];
  el('hint').textContent=phase==='ready'&&tutorial?'先到 5 分获胜。第一场跟着高亮按钮出招，不限时。':phase==='act'&&tutorial?tellText[suggested]:'空当 → 突刺　挥剑 → 格挡　冲锋 → 后撤';
  el('levels').replaceChildren(...bouts.map((bout,i)=>{
    const button=document.createElement('button');
    button.textContent=bout.name+(state.wins[i]?' ✓':'');
    button.classList.toggle('current',i===state.level);
    button.disabled=active||!state.wins.slice(0,i).every(Boolean);
    button.onclick=()=>select(i);
    return button;
  }));
  rewards();
}
function select(level){
  if(active||!bouts[level]||!state.wins.slice(0,level).every(Boolean))return;
  state.level=level;state.score=[0,0];
  phase='ready';elapsed=0;outcome=0;move=-1;
  sync();save();
}
function start(){
  if(phase!=='ready')return;
  active=true;host.start();
  phase='read';elapsed=0;
  playTone(460);sync();save();
}
function respond(action){
  if(phase!=='act')return;
  move=action;
  outcome=judge(state.level,exchange(),action);
  state.score[outcome>0?0:1]++;
  if(winner(state.score)>0)state.wins[state.level]=true;
  if(winner(state.score))host.end();
  phase='touch';elapsed=0;
  playTone(outcome>0?690:207);
  sync();save();
}
try{hall=new Hall(document.querySelector('canvas'));}catch{
  el('call').textContent='A WebGL browser is required.';
  el('start').disabled=true;
}
if(hall){
  el('start').onclick=start;
  el('next').onclick=()=>select(state.level+1);
  el('replay').onclick=()=>select(state.level);
  buttons.forEach(button=>{button.onclick=()=>respond(Number(button.dataset.move));});
  el('sound').onclick=()=>{
    sound=!sound;el('sound').textContent=sound?'♪ Sound':'Sound off';
    el('sound').setAttribute('aria-pressed',String(sound));
  };
  addEventListener('keydown',event=>{
    if(!event.repeat&&['1','2','3'].includes(event.key))respond(Number(event.key)-1);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
  addEventListener('pagehide',()=>{save();host.stop();});
  addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
  sync();host.poll();
  let last=performance.now();
  function frame(now){
    const dt=Math.min(.08,(now-last)/1000);last=now;
    if(active&&!document.hidden){
      elapsed+=dt;
      if(phase==='read'&&elapsed>=round().tempo){
        phase='act';elapsed=0;sync();
      }else if(phase==='act'&&elapsed>=responseWindow()){
        respond(-1);
      }else if(phase==='touch'&&elapsed>=1.15){
        phase=winner(state.score)?'done':'read';elapsed=0;
        if(phase==='done')active=false;
        sync();save();
      }
    }
    el('clock').style.width=phase==='act'&&Number.isFinite(responseWindow())?100*Math.max(0,1-elapsed/responseWindow())+'%':'0';
    hall.draw(round(),phase,tell(),elapsed,move,outcome,now/1000,state.gold,state.confetti&&winner(state.score)>0);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

