const T=globalThis.THREE;
T.ColorManagement.legacyMode=false;
export class Hall{
  constructor(canvas){
    this.canvas=canvas;
    this.renderer=new T.WebGLRenderer({canvas,antialias:true});
    this.renderer.outputEncoding=T.sRGBEncoding;
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    this.scene=new T.Scene();
    this.scene.background=new T.Color(0x243c51);
    this.scene.fog=new T.Fog(0x263e54,12,29);
    this.camera=new T.PerspectiveCamera(39,1,.1,45);
    this.camera.position.set(3.5,4,10.1);
    this.camera.lookAt(0,1.37,0);
    this.scene.add(new T.HemisphereLight(0xdff5ff,0x62577a,1.12));
    const key=new T.DirectionalLight(0xffe4bb,1.8);
    key.position.set(-4,7,4);this.scene.add(key);
    this.rim=new T.DirectionalLight(0x8de9df,1.1);
    this.rim.position.set(2,6,-6);this.scene.add(this.rim);
    this.geometry=new T.BoxGeometry();
    this.materials=new Map();
    this.venue();
    this.player=this.fencer(0x39a6a4,1);
    this.rival=this.fencer(0xcc6354,-1);
    this.resize();
    new ResizeObserver(()=>this.resize()).observe(canvas);
  }
  mat(color){
    if(!this.materials.has(color))this.materials.set(color,new T.MeshStandardMaterial({color,roughness:.7}));
    return this.materials.get(color);
  }
  box(w,h,d,color,x,y,z,parent=this.scene){
    const object=new T.Mesh(this.geometry,this.mat(color));
    object.scale.set(w,h,d);
    object.position.set(x,y,z);
    parent.add(object);
    return object;
  }
  group(parent,x=0,y=0,z=0){
    const group=new T.Group();group.position.set(x,y,z);parent.add(group);return group;
  }
  sign(text,w,h,x,y,z){
    const c=document.createElement('canvas');c.width=512;c.height=96;
    const ctx=c.getContext('2d');
    ctx.fillStyle='#112d44';ctx.fillRect(0,0,512,96);
    ctx.strokeStyle='#69c0b9';ctx.lineWidth=5;ctx.strokeRect(3,3,506,90);
    ctx.fillStyle='#d2f3e6';ctx.font='bold 40px Arial';ctx.textAlign='center';ctx.fillText(text,256,62,465);
    const texture=new T.CanvasTexture(c);texture.encoding=T.sRGBEncoding;
    const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));
    mesh.position.set(x,y,z);this.scene.add(mesh);
  }
  venue(){
    this.box(28,.22,25,0x476d85,0,-.14,0);
    for(let i=-8;i<=8;i++){
      this.box(.024,.008,20,0x597f92,i,.001,0);
      this.box(21,.008,.024,0x597f92,0,.001,i);
    }
    this.box(10,.14,2.58,0x182f48,0,.075,0);
    this.box(9.93,.045,2.19,0x8aa4b0,0,.166,0);
    for(let i=-19;i<=19;i++)this.box(.012,.008,2.13,0x718e9f,i*.25,.193,0);
    for(const z of [-1.19,1.19]){
      this.box(9.94,.045,.11,0x66b8ba,0,.152,z);
      this.box(9.9,.019,.04,0xd9e3db,0,.195,z*.89);
    }
    for(const x of [-4.15,-2,0,2,4.15])this.box(.046,.012,2.08,x===0?0xefcf89:0xe5ebde,x,.195,0);
    for(const x of [-4.72,4.72])this.box(.39,.012,2.08,0xb98465,x,.197,0);
    this.sign('PISTE  01   •   FOIL FINALS',3.2,.29,0,.076,1.316);
    this.box(26,9,.22,0x2a4964,0,4.5,-8.95);
    this.sign('INTERNATIONAL FENCING SERIES',8.9,1.24,-3.1,4.5,-8.81);
    this.box(25,.08,.12,0x5cbab6,0,5.29,-8.78);
    this.box(25,.20,.38,0x182e46,0,6.4,-7.3);
    for(let i=-9;i<=9;i++){
      this.box(.59,.085,.24,0xb7e5df,i*1.2,6.26,-7.22);
      const flag=this.box(.33,.44,.026,[0x64b7bb,0xe3a867,0xcd7270][(i+9)%3],i*.74,3.58,-4.3);
      flag.rotation.z=(i%2?.10:-.10);
    }
    this.box(14,.025,.035,0xbdd0b6,0,3.81,-4.3);
    const crowd=new T.InstancedMesh(this.geometry,this.mat(0xffffff),6*30*3);
    const proxy=new T.Object3D();
    const tops=[0x57adab,0xd4945c,0xc67671,0x868abd,0x81a886,0x5785a2];
    const skin=[0xf0c79c,0xa86f59,0xc68e6e,0x7e5648];
    let index=0;
    for(let row=0;row<6;row++){
      const y=.24+row*.39,z=-4.55-row*.63;
      this.box(23,.43,.66,0x365b73,0,y,z);
      this.box(23,.029,.055,0x78a0ae,0,y+.22,z+.31);
      for(let col=0;col<30;col++){
        const x=(col-14.5)*.68;
        for(const [w,h,d,offset,color] of [[.40,.37,.30,.39,tops[(col*5+row)%6]],[.265,.25,.257,.68,skin[(col+row*3)%4]],[.277,.071,.263,.82,0x343141]]){
          proxy.position.set(x,y+offset,z);proxy.scale.set(w,h,d);proxy.updateMatrix();
          crowd.setMatrixAt(index,proxy.matrix);crowd.setColorAt(index++,new T.Color(color));
        }
      }
    }
    this.scene.add(crowd);
    this.box(2.12,.72,.68,0x1a3a54,0,.4,-2.8);
    this.box(2.22,.085,.76,0x8bbab8,0,.79,-2.8);
    this.sign('REFEREE',1.28,.27,0,.46,-2.449);
    this.box(.49,.50,.31,0x22394f,0,.94,-3.04);
    this.box(.31,.31,.29,0xb77d61,0,1.34,-3.04);
    this.box(.325,.085,.31,0x322f3a,0,1.53,-3.05);
    for(const x of [-.071,.071])this.box(.039,.039,.025,0x253443,x,1.36,-2.879);
    this.box(.075,.16,.028,0xf1d5a3,0,.974,-2.875);
    this.lamps=[-1,1].map(side=>this.box(.45,.14,.12,0x37556b,side*.62,.86,-2.72));
    this.spark=this.group(this.scene,0,1.45,.21);
    for(let i=0;i<8;i++){
      const ray=this.box(.43,.035,.035,0xffd779,0,0,0,this.spark);
      ray.rotation.z=i*Math.PI/4;
    }
    this.spark.visible=false;
  }
  fencer(accent,side){
    const root=this.group(this.scene,side*-1.63,.21,side*.1);
    root.rotation.y=side*(Math.PI/2-.20);
    const torso=this.group(root,0,1.04,0);
    const white=0xe0e7dc, shadow=0xb6c4be, ink=0x283e53;
    const jacket=this.box(.60,.60,.39,white,0,.13,0,torso);
    this.box(.52,.072,.40,shadow,0,-.155,0,torso);
    this.box(.37,.12,.29,0x5f7c88,0,.435,0,torso);
    this.box(.048,.43,.025,0x839c9d,.043,.143,.204,torso);
    this.box(.088,.125,.034,accent,-.179,.239,.213,torso);
    this.box(.28,.08,.026,0xa6bab8,0,.158,-.205,torso);
    this.box(.20,.16,.029,accent,0,.283,-.208,torso);
    this.box(.093,.034,.035,0xf0e4c9,0,.285,-.225,torso);
    this.box(.056,.032,.037,0xe5c58e,-.178,.245,.231,torso);
    this.box(.41,.43,.39,0x637b86,0,.69,0,torso);
    this.box(.39,.35,.052,0x1f3749,0,.682,.201,torso);
    this.box(.46,.08,.42,0x728a91,0,.892,-.011,torso);
    this.box(.36,.113,.072,shadow,0,.476,.19,torso);
    for(let i=-4;i<=4;i++){
      this.box(.011,.33,.015,0x597385,i*.041,.682,.233,torso);
      this.box(.36,.009,.013,0x597385,0,.682+i*.036,.235,torso);
    }
    for(const x of [-.225,.225]){
      this.box(.038,.338,.31,accent,x,.684,-.017,torso);
      this.box(.042,.034,.22,0xe4d6b4,x,.809,-.018,torso);
      for(let i=0;i<3;i++)this.box(.046,.018,.052,0x375365,x,.586+i*.043,-.076,torso);
    }
    const swordArm=this.group(torso,-.373,.305,.018);
    this.box(.219,.36,.215,white,0,-.137,0,swordArm);
    this.box(.225,.063,.219,accent,0,-.09,0,swordArm);
    const elbow=this.group(swordArm,0,-.298,0);
    this.box(.187,.299,.185,shadow,0,-.115,0,elbow);
    this.box(.204,.124,.19,0x4b626d,0,-.261,0,elbow);
    const foil=this.group(elbow,0,-.325,0);
    this.box(.10,.145,.083,0x21384c,0,-.038,0,foil);
    const guard=new T.Mesh(new T.CylinderGeometry(.143,.10,.065,12),this.mat(0xa8bbc1));
    guard.position.y=-.104;foil.add(guard);
    this.box(.025,1.02,.024,0xa2c2cf,0,-.646,0,foil);
    this.box(.05,.055,.05,0xf3c478,0,-1.17,0,foil);
    const backArm=this.group(torso,.372,.30,0);
    this.box(.19,.48,.21,white,0,-.18,0,backArm);
    this.box(.16,.12,.18,shadow,0,-.43,0,backArm);
    const legs=[-1,1].map(d=>{
      const hip=this.group(root,d*.153,.9,d*.17);
      this.box(.256,.41,.26,white,0,-.16,0,hip);
      this.box(.027,.32,.07,accent,d*.126,-.143,.065,hip);
      const knee=this.group(hip,0,-.36,0);
      this.box(.207,.37,.225,shadow,0,-.14,0,knee);
      this.box(.225,.045,.233,accent,0,-.254,0,knee);
      this.box(.243,.132,.38,white,0,-.379,.059,knee);
      this.box(.247,.035,.385,ink,0,-.448,.058,knee);
      for(const z of [.064,.109,.15])this.box(.13,.014,.018,0x6b8793,0,-.305,z,knee);
      return {hip,knee,d};
    });
    const shade=new T.Mesh(new T.CircleGeometry(.48,20),new T.MeshBasicMaterial({color:0x18354a,transparent:true,opacity:.28,depthWrite:false}));
    shade.rotation.x=-Math.PI/2;shade.position.y=.205;this.scene.add(shade);
    return {root,torso,jacket,swordArm,elbow,backArm,legs,shade,side};
  }
  pose(fencer,x,reach,lean,t){
    const {root,torso,swordArm,elbow,backArm,legs,side,shade}=fencer;
    root.position.x=x;
    torso.position.y=1.01-.12*reach+Math.sin(t*3.5+side)*.017;
    torso.rotation.x=lean;
    swordArm.rotation.x=-.94-reach*.45;
    elbow.rotation.x=-.70+reach*.53;
    backArm.rotation.x=.52+reach*.35;
    backArm.rotation.z=.24;
    for(const {hip,knee,d} of legs){
      hip.rotation.x=d*(.23+reach*.36);
      knee.rotation.x=.16+reach*.18;
    }
    shade.position.x=x;shade.position.z=root.position.z;
  }
  resize(){
    const w=this.canvas.clientWidth,h=this.canvas.clientHeight;
    if(!w||!h)return;
    this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);
  }
  draw(round,phase,signal,elapsed,move,outcome,time,gold,finale){
    this.rim.color.set(round.color);
    const telegraph=phase==='read'||phase==='act';
    const response=phase==='touch'?Math.sin(Math.PI*Math.min(1,elapsed/.74)):0;
    const threat=telegraph?Math.min(1,elapsed*2.8):0;
    const front=move===0?.92:move===2?-.63:.20;
    this.pose(this.player,-1.63+front*response,move===0?response:.12,.05+response*(move===2?-.23:.16),time);
    this.pose(this.rival,1.63-threat*(signal===2?.35:.12)-response*(outcome<0?.84:.29),.13+threat*(signal===0?.10:.43)+response*.26,.04+threat*.13,time);
    if(telegraph&&signal===0)this.rival.swordArm.rotation.z=-.64*threat;
    else this.rival.swordArm.rotation.z=0;
    this.player.swordArm.rotation.z=move===1?response*.66:0;
    this.player.jacket.material=this.mat(gold?0xf0cb79:0xe0e7dc);
    this.lamps[0].material=this.mat(outcome>0&&phase==='touch'?0x8ff1ca:0x37556b);
    this.lamps[1].material=this.mat(outcome<0&&phase==='touch'?0xf28971:0x37556b);
    this.spark.visible=phase==='touch'&&move===1&&outcome>0&&elapsed<.36;
    this.spark.scale.setScalar(.65+elapsed*2);
    this.spark.rotation.z=elapsed*4;
    const cameraSway=phase==='ready'?Math.sin(time*.85)*.19:0;
    const close=phase==='done'&&finale?1:0;
    this.camera.position.set(3.5+cameraSway-close*.9,4-close*.36,10.1-close*1.1);
    this.camera.lookAt(-close*.44,1.37,0);
    this.renderer.render(this.scene,this.camera);
  }
}
