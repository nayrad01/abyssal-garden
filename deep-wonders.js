/* Deep Wonders: world objects. Original Abyssal Garden by Maksymilian Dendura, MIT license. */
(function(){
"use strict";
function buildMeshes(Et){
 const box=(m,x,y,z,w,h,d,a=1)=>{
  const X=x-w/2,Y=y-h/2,Z=z-d/2,Q=x+w/2,R=y+h/2,S=z+d/2;
  const v=[[X,Y,Z],[Q,Y,Z],[Q,R,Z],[X,R,Z],[X,Y,S],[Q,Y,S],[Q,R,S],[X,R,S]].map(p=>m.v(...p,a));
  for(const f of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]])m.quad(...f.map(k=>v[k]));
 };
 function temple(){
  const m=new Et;box(m,0,.25,0,15,.65,12);box(m,0,.8,0,12,.48,9);
  for(let i=0;i<4;i++)box(m,0,.1+i*.34,-7.8+i*.8,7,.45,1.8);
  for(const x of [-5.3,5.3])for(const z of [-3.8,.2,3.8]){
   const height=5.8+(Math.abs(Math.floor(x+z*2))%3)*.72;
   box(m,x,1.25,z,1.65,.28,1.65);
   m.tube([[x,1.35,z],[x,2.2,z],[x,height-.5,z]],i=>i===0?.67:i===1?.57:.48,10,true);
   if(z<3)box(m,x,height,z,1.8,.42,1.8);
  }
  box(m,0,7.15,-3.8,12.5,.8,1.65);
  box(m,-2.5,6.5,3.8,5.2,.6,1.5);box(m,4.4,6.1,3.8,3.2,.58,1.3);
  box(m,0,1.52,1.3,3.3,1.2,3.2);
  for(const [x,z] of [[-7.3,5.4],[-8,2.1],[7.8,-2.6],[6.9,6.2]])box(m,x,.45,z,2.4,.8,1.55);
  return m;
 }
 function arch(){
  const m=new Et;
  for(const x of [-3.5,3.5]){
   box(m,x,3.6,0,1.55,7.2,1.8);box(m,x,.42,0,2.25,.85,2.3);
   box(m,x,7.45,0,2.15,.62,2.1);
  }
  box(m,0,7.9,0,8.7,1.1,2.05);box(m,0,8.8,0,9.5,.55,2.3);
  for(let i=0;i<5;i++)box(m,-2.95+i*1.5,9.18,.02,1.05,.26,2.2);
  return m;
 }
 function coral(){
  const m=new Et;
  m.tube([[0,0,0],[0,1.4,0],[.3,3.5,0],[.4,6,0]],i=>.65*(1-i/4)+.05,9,true);
  for(let a=0;a<9;a++){
   const t=a*Math.PI*2/9,r=2.4+(a%3)*.64,h=3.6+(a%4)*.74,dx=Math.cos(t),dz=Math.sin(t);
   m.tube([[.2,1.1,0],[dx*.9,2.9,dz*.9],[dx*r,h,dz*r],[dx*(r+.45),h+.8,dz*(r+.45)]],
    i=>.3*(1-i/4)+.03,6,true);
   m.tube([[dx*r,h,dz*r],[dx*(r+.75),h+.55,dz*(r+.75)]],.13,5,true);
  }
  for(let a=0;a<6;a++){
   const t=a*Math.PI/3;
   m.tube([[Math.cos(t)*1.4,0,Math.sin(t)*1.4],[Math.cos(t)*2.1,1.7,Math.sin(t)*2.1],
    [Math.cos(t)*2.8,3.1,Math.sin(t)*2.8]],i=>.23*(1-i/3)+.04,6,true);
  }
  return m;
 }
 function crystals(){
  const m=new Et;
  for(let k=0;k<5;k++){
   const cx=Math.sin(k*2.4)*1.5,cz=Math.cos(k*2.4)*1.2,H=3+(k%3)*2.1,r=.6+(k%3)*.18;
   let bottom=[],middle=[];
   for(let j=0;j<6;j++){
    const a=j*Math.PI/3;
    bottom.push(m.v(cx+Math.cos(a)*r,0,cz+Math.sin(a)*r));
    middle.push(m.v(cx+Math.cos(a)*r*.82,H*.72,cz+Math.sin(a)*r*.82));
   }
   const top=m.v(cx+.2,H,cz-.15),base=m.v(cx,0,cz);
   for(let j=0;j<6;j++){
    const q=(j+1)%6;m.quad(bottom[j],bottom[q],middle[q],middle[j]);
    m.tri(middle[j],middle[q],top);m.tri(base,bottom[q],bottom[j]);
   }
  }
  return m;
 }
 function treasure(){
  const m=new Et;box(m,0,.75,0,3.4,1.5,2);box(m,0,1.62,0,3.65,.42,2.25);
  for(const x of [-1.25,1.25])box(m,x,1,0,.18,2.1,2.3);
  box(m,0,1.75,-1.16,1.8,.18,.12);
  for(let j=0;j<7;j++)box(m,(j%4-1.5)*.64,.4+(j%3)*.24,-1.35-Math.floor(j/4)*.46,.55,.24,.5);
  return m;
 }
 function debris(){
  const m=new Et;box(m,0,.45,0,10,.85,3);
  for(let i=0;i<7;i++)box(m,-5+i*1.7,1.55,i%2?2.9:-2.9,.37,2.5,.42);
  m.tube([[-2,0,0],[-1.5,4.8,0],[0,9,.5]],i=>.45-i*.08,7,true);
  box(m,1.5,2,-2,3.1,3,2.8);
  for(const [x,z] of [[-5,5],[5,-4],[3,5]])box(m,x,.7,z,2.4,1.25,1.4);
  return m;
 }
 function sentinel(){
  const m=new Et;
  box(m,0,.65,0,4.4,1.3,3.2);box(m,0,3.35,0,2.6,4.4,2);
  box(m,0,6.1,0,3.6,1.8,2.4);box(m,0,8,0,2.1,2.3,2.2);
  for(const x of [-1.85,1.85])box(m,x,4.25,0,.75,4.7,.9);
  for(const x of [-.9,.9])box(m,x,1.25,0,.65,2.2,1.2);
  return m;
 }
 return [temple(),arch(),coral(),crystals(),treasure(),debris(),sentinel()].map(m=>m.build());
}
function place(L,r0,ot){
 const PI=Math.PI,TWO=PI*2,put=(kind,x,z,scale,mat,turn=0,lift=0)=>
  L(kind,x,r0(x,z)+lift,z,scale,ot(0,1,0,turn),mat,.35,1,0);
 put(12,29,45,1,2,.17,.3);
 for(const [x,z,a] of [[16,45,.1],[41,42,-.38],[26,58,1.2]])put(13,x,z,.7,2,a,.3);
 for(const [x,z] of [[33,40],[24,53]])put(15,x,z,.7,7,.2,.2);
 L(11,-44,r0(-44,-62)+6.2,-62,1.05,ot(0,1,0,.6),3,.6,1,0);
 for(const [x,z,sc] of [[-32,-57,1],[-51,-73,.75],[-39,-78,.8]])put(17,x,z,sc,3,.3,.1);
 for(const [x,z] of [[-34,-69],[-54,-54],[-46,-81]])put(15,x,z,.55,7,.1,.1);
 put(13,6,84,1.45,2,.2,0);
 for(let i=0;i<11;i++){
  const a=i*TWO/11,rad=7+(i%3)*2.9;
  put(14,6+Math.cos(a)*rad,84+Math.sin(a)*rad,.85+(i%4)*.18,7,a,0);
 }
 for(const [x,z] of [[8,85],[2,93],[16,78],[0,73]])put(15,x,z,1.15,7,.4,.1);
 put(13,-15,-99,2.25,2,PI/2,.4);
 for(const [x,z,sc] of [[-22,-105,1.55],[-6,-105,1.4],[-24,-92,1.15],[-8,-91,1.2]])
  put(15,x,z,sc,7,.2,.1);
 for(const [x,z] of [[-28,-98],[-1,-98]])put(18,x,z,1.2,2,.3,.3);
 put(13,47,28,1.2,2,.65,.2);put(16,48,27,1.6,6,.3,.55);
 for(const [x,z] of [[44,24],[52,24],[41,31],[54,33]])put(15,x,z,.8,7,.4,.3);
 for(const [x,z] of [[45,35],[52,36]])put(14,x,z,.7,7,.3,.1);
 for(let i=0;i<6;i++){
  const a=i*TWO/6,rad=9;
  put(18,-65+Math.cos(a)*rad,19+Math.sin(a)*rad,1.15,2,a,.3);
 }
 put(16,-65,19,1.1,6,.4,.4);
 for(const [x,z] of [[-62,17],[-70,23],[-60,27]])put(15,x,z,.9,7,.2,.1);
}

/* Rounded, smooth-shaded fish with sculpted fins and readable eyes.
   One shared GPU mesh, instanced thousands of times — no per-fish CPU animation. */
function buildFish(Et){
 const m=new Et;
 const rings=[
  [-.58,.025,.03],[-.49,.105,.079],[-.33,.17,.133],
  [-.13,.228,.176],[.08,.238,.188],[.27,.203,.158],
  [.44,.145,.114],[.58,.075,.059],[.675,.008,.009]
 ];
 const sides=10,loops=[];
 for(const [x,h,w] of rings){
  const ring=[];
  for(let j=0;j<sides;j++){
   const a=j*Math.PI*2/sides;
   ring.push(m.v(x,Math.cos(a)*h,Math.sin(a)*w,1));
  }
  loops.push(ring);
 }
 for(let i=0;i<loops.length-1;i++)
  for(let j=0;j<sides;j++){
   const k=(j+1)%sides;
   m.quad(loops[i][j],loops[i][k],loops[i+1][k],loops[i+1][j]);
  }
 const fin=(points,mat=.65)=>{
  const vertices=points.map(p=>m.v(...p,mat));
  for(let j=1;j<vertices.length-1;j++)m.tri(vertices[0],vertices[j],vertices[j+1]);
 };
 // Dorsal crest, caudal fan, anal fin and paired swept pectoral fins.
 fin([[-.24,.19,0],[-.18,.34,0],[-.05,.41,0],[.19,.22,0]]);
 fin([[-.55,.02,0],[-.88,.35,0],[-.79,.12,0],[-.81,-.12,0],[-.89,-.31,0],[-.58,-.02,0]]);
 fin([[-.34,-.12,0],[-.22,-.27,0],[.03,-.22,0]]);
 for(const side of [-1,1])
  fin([[.21,-.01,side*.16],[.02,-.105,side*.33],[-.20,-.08,side*.42],[-.06,.06,side*.21]]);
 // Two glossy eyes, dark iris and a small reflective highlight.
 for(const side of [-1,1]){
  const circle=(x,y,z,r,mat)=>{
   const c=m.v(x,y,z,mat);
   const rim=[];
   for(let i=0;i<9;i++){
    const a=i*Math.PI*2/9;
    rim.push(m.v(x+Math.cos(a)*r,y+Math.sin(a)*r,z,mat));
   }
   for(let i=0;i<9;i++)m.tri(c,rim[i],rim[(i+1)%9]);
  };
  circle(.435,.047,side*.121,.039,-1);
  circle(.443,.061,side*.124,.012,-.3);
 }
 return m.build();
}

function addFauna(fish,mantas){
 const hash=n=>{const v=Math.sin(n*127.17+78.23)*43758.5453;return v-Math.floor(v)};
 // Keep wildlife around the fixed landmarks, but make the fish large enough to notice.
 for(const [x,y,z,radius,count] of [[8,-30,82,12,46],[-43,-29,-62,15,38],[29,-28,44,15,48],[-65,-30,19,14,35],[48,-27,27,11,32]]){
  for(let i=0;i<count;i++){
   const seed=hash(i+x*9+z*5);
   const sign=hash(seed*13.2)>.5?1:-1;
   fish.push(x,y,z,radius,seed,sign*1.6/radius,.72+hash(i*3+x)*.45,hash(i*1.7+z));
  }
 }
 // Repeating *world-anchored* schools. The fish vertex shader tiles their
 // positions around the camera, so every location has nearby wildlife.
 // 121 independently swimming schools, about 1,900 visible-size fish total.
 const spacing=11.5;
 for(let gx=-5;gx<=5;gx++)for(let gz=-5;gz<=5;gz++){
  const id=(gx+5)*11+gz+5;
  const x=gx*spacing+(hash(id*7.3)-.5)*3.5;
  const z=gz*spacing+(hash(id*13.7)-.5)*3.5;
  const heightOffset=(hash(id*23.1)-.5)*15;
  const orbit=3.3+hash(id*5.6)*6.7;
  const count=12+Math.floor(hash(id*11.91)*12);
  const direction=hash(id*2.75)>.5?1:-1;
  for(let j=0;j<count;j++){
   const seed=hash(id*19.73+j*1.71+.37);
   const phase=hash(j*6.21+id*.17);
   const size=(id%8===0?1.95:1.16)+seed*(id%8===0?.96:.8);
   const omega=direction*(.9+hash(id*2.3+j*.83)*.8)/orbit;
   fish.push(x,heightOffset,z,-orbit,seed,omega,size,phase);
  }
 }
 // Big sculpted rays drift through the same nearby-space tiling system.
 // Unlike a screen overlay, these are lit, depth-tested 3D meshes in the water.
 for(let gx=-2;gx<=2;gx++)for(let gz=-2;gz<=2;gz++){
  const id=(gx+2)*5+gz+2;
  const x=gx*23.3+(hash(id*8.21)-.5)*11;
  const z=gz*23.3+(hash(id*2.17)-.5)*11;
  const heightOffset=(hash(id*12.11)-.5)*20;
  const orbit=7.5+hash(id*3.17)*12;
  const sign=hash(id*17.5)>.5?1:-1;
  const wingSize=2.3+hash(id*7.41)*3.4;
  mantas.push(x,heightOffset,z,-orbit,hash(id*7.3)*6.28,sign*(.025+hash(id*2.1)*.045),wingSize,hash(id*11.3));
 }
 // Existing larger animals at the six major discoveries.
 for(const a of [
  [7,-18,84,24,1.7,.06,5.7,.72],
  [-42,-25,-62,25,3.2,.04,5.2,.3],
  [-16,-21,-101,34,2.1,-.05,6.4,.85],
  [29,-18,45,18,4.1,.045,5.3,.21],
  [-65,-22,19,22,2.7,-.04,4.8,.6],
  [47,-20,28,24,3.8,.037,5.5,.43]
 ])mantas.push(...a);
}
function scenes(ground){
 const list=[
  ["Luminous Grotto",6,84,17,96,"A garden of glowing coral"],
  ["Lost Temple",29,45,40,57,"Ancient ruins in the kelp"],
  ["Sunken Wreck",-44,-62,-27,-50,"A broken ship and scattered timber"],
  ["Trench Gate",-15,-99,-2,-88,"An eerie stone threshold"],
  ["Treasure Vault",48,27,60,39,"A secret cache beneath the waves"],
  ["The Watchers",-65,19,-52,32,"Silent stone sentinels"]
 ];
 return list.map(([name,x,z,cx,cz,desc])=>{
  const fy=ground(x,z),cy=ground(cx,cz);
  return {name,desc,eye:[cx,Math.min(-3,Math.max(cy+5,fy+3)),cz],
   look:[x,Math.min(-2,fy+4),z]};
 });
}
window.DeepWonders={buildMeshes,buildFish,place,addFauna,scenes};
})();