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
    this.scene.background=new T.Color(0xa9cbd5);
    this.scene.fog=new T.Fog(0xd3ddcf,15,33);
    this.camera=new T.PerspectiveCamera(39,1,.1,45);
    this.camera.position.set(3.5,4,10.1);
    this.camera.lookAt(0,1.37,0);
    this.scene.add(new T.HemisphereLight(0xdff5ff,0x827156,1.12));
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
    this.box(28,.22,25,0xb88768,0,-.14,0);
    for(let row=-6;row<=4;row++){
      for(let col=-7;col<=7;col++){
        this.box(1.29,.044,.91,[0xc59270,0xd8a881,0xba8162][Math.abs(row*13+col*7)%3],
          col*1.32+(row%2)*.66,-.017,row*.95);
      }
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
    this.sign('THE FOUNTAIN COURT',3.2,.29,0,.076,1.316);
    // Open stone arcade with individual voussoirs and a garden beyond.
    for(let bay=-2;bay<=2;bay++){
      const x=bay*3.35;
      for(let i=0;i<=14;i++){
        const angle=i*Math.PI/14;
        const stone=this.box(.32,.42,.65,i%2?0xe0c59e:0xd4b18b,
          x+Math.cos(angle)*1.48,2.72+Math.sin(angle)*1.48,-5.5);
        stone.rotation.z=angle-Math.PI/2;
      }
      if(bay%2===0){
        this.box(.12,2.7,.12,0x84684d,x,1.35,-7.5);
        for(let i=0;i<5;i++){
          const canopy=new T.Mesh(new T.IcosahedronGeometry(.84,1),this.mat([0x58774d,0x78915a,0x426444][i%3]));
          canopy.scale.set(1-i*.08,1,.85);
          canopy.position.set(x+Math.sin(i*3)*.47,2.15+i*.32,-7.5+Math.cos(i)*.4);
          this.scene.add(canopy);
        }
      }
    }
    for(let i=0;i<6;i++){
      const x=(i-2.5)*3.35;
      for(let row=0;row<8;row++)this.box(.44,.32,.65,row%2?0xe2c6a3:0xc6a783,x,.25+row*.32,-5.5);
      this.box(.65,.18,.78,0xf0d6ae,x,2.72,-5.5);
      this.box(.69,.17,.78,0xc5a17c,x,.12,-5.5);
    }
    this.box(24,.95,.55,0xc9a17e,0,.47,-9);
    this.box(24,.14,.68,0xe6c7a1,0,1,-9);
    this.box(19,.45,.9,0xd8b491,0,4.46,-5.5);
    this.box(19,.13,1.03,0xf0d6ad,0,4.73,-5.5);
    this.box(1.82,.47,1.29,0xd8ba99,0,.26,-4.24);
    this.box(1.63,.04,1.10,0x539692,0,.51,-4.24);
    this.box(.24,.65,.24,0xe9d6b7,0,.59,-4.24);
    this.box(.74,.12,.53,0xe9d6b7,0,.94,-4.24);
    this.drops=[];
    for(let i=0;i<12;i++){
      const bead=this.box(.035,.09,.035,0xc8ffff,0,1,-4.24);
      this.drops.push(bead);
    }
    for(const x of [-5.6,5.6]){
      this.box(.67,.61,.67,0xb36547,x,.33,-2.55);
      this.box(.79,.10,.79,0xe29b6c,x,.67,-2.55);
      for(let i=0;i<11;i++){
        const leaf=this.box(.12,.47,.13, i%2?0x55794a:0x799151,x+Math.sin(i*2.4)*.31,.85+i%3*.09,-2.55+Math.cos(i*2.4)*.25);
        leaf.rotation.z=Math.sin(i*2.4)*.58;
      }
    }
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
    this.drops.forEach((drop,i)=>{
      const progress=(time*1.2+i/12)%1, angle=i*2.4;
      drop.position.set(Math.cos(angle)*progress*.68,1.02+.55*progress-1.03*progress*progress,-4.24+Math.sin(angle)*progress*.44);
    });
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
    this.camera.position.set(2.0+cameraSway-close*.8,3.5-close*.30,10.2-close*1.1);
    this.camera.lookAt(-close*.44,1.37,0);
    this.renderer.render(this.scene,this.camera);
  }
}
