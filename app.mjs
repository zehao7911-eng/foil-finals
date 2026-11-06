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
const responseWindow=()=>state.level===0?1.65:state.level===1?1.30:1.10;
function sync(){
  const done=phase==='done', result=winner(state.score);
  el('event').textContent=round().name.toUpperCase();
  el('rival').textContent='vs. '+round().rival;
  el('you').textContent=state.score[0];
  el('them').textContent=state.score[1];
  el('start').hidden=phase!=='ready';
  el('start').textContent=state.score.some(Boolean)?'Resume bout →':'En garde →';
  el('actions').hidden=phase==='ready'||done;
  el('result').hidden=!done;
  el('next').hidden=result!==1||state.level===bouts.length-1;
  el('verdict').textContent=result>0?(state.confetti?'✦ Bout won ✦':'Bout won'):'Opponent wins';
  buttons.forEach(button=>{button.disabled=phase!=='act';});
  el('phase').textContent={ready:'ON THE PISTE',read:'WATCH THE BLADE',act:'RESPOND NOW',touch:'REFEREE DECISION',done:'FINAL SCORE'}[phase];
  const calls={
    ready:'First to five touches',
    read:cues[tell()],
    act:cues[tell()],
    touch:outcome>0?moves[move]+' scores a touch':move===-1?'Too late · rival touch':'Rival scores a touch',
    done:result>0?'Victory on the piste':'Set for a rematch'
  };
  el('call').textContent=calls[phase];
  el('hint').textContent=state.level===0&&['read','act'].includes(phase)?'Open guard → Lunge · Incoming blade → Parry · Charge → Retreat':'Read the opponent’s stance. First to five touches wins.';
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
      }else if(phase==='touch'&&elapsed>=.78){
        phase=winner(state.score)?'done':'read';elapsed=0;
        if(phase==='done')active=false;
        sync();save();
      }
    }
    el('clock').style.width=phase==='act'?100*Math.max(0,1-elapsed/responseWindow())+'%':'0';
    hall.draw(round(),phase,tell(),elapsed,move,outcome,now/1000,state.gold,state.confetti&&winner(state.score)>0);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
