export const bouts=[
  {name:'Club Qualifier',rival:'Luca',tempo:1.12,color:0x70d7d0},
  {name:'Grand Prix',rival:'Mira',tempo:.93,color:0xf2b66e},
  {name:'World Final',rival:'Ren',tempo:.78,color:0xaaadff}
];
const patterns=[[0,1,0,1,2],[1,2,0,2,1,0],[2,1,0,2,0,1,2]];
export const moves=['Lunge','Parry','Retreat'];
export const cues=['Guard open','Blade incoming','Charging forward'];
export function cue(level,exchange){const pattern=patterns[level];return pattern[exchange%pattern.length];}
export function judge(level,exchange,action){
  return action===cue(level,exchange)?1:-1;
}
export function winner(score){return score[0]>=5?1:score[1]>=5?-1:0;}
