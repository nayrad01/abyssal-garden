/* Deep Wonders V16 — two-thumb sideways strafing, depth, boost, reverse and edge-turning.
 * Right hold swims forward, right double-tap-and-hold swims backward.
 * Drag to screen edge and hold for continuous turning, crossing halves freely.
 * Left vertical drag adjusts depth, horizontal drag strafes continuously.
 * Drag from left to either edge and hold to keep strafing; double tap-hold boosts.
 * Stationary left double tap dashes once without sustained movement.
 * Original Abyssal Garden by Maksymilian Dendura — MIT license.
 */
(function(){
"use strict";
function mount({move,look,verticalDrag,boost,dash}){
 const css=document.createElement("style");
 css.id="dw-gesture-style";
 css.textContent=[
  "html,body{overscroll-behavior:none}",
  "body.g{touch-action:none;-webkit-user-select:none;user-select:none}",
  "#dw-swim-pad{position:fixed;z-index:500;right:0;top:0;bottom:0;width:50%;touch-action:none!important;overscroll-behavior:contain;pointer-events:auto!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;background:transparent}",
  "#dw-swim-hint{position:absolute;right:15px;bottom:max(22px,env(safe-area-inset-bottom));color:#d9ffffb8;font:600 11px/1.3 system-ui;text-shadow:0 1px 5px #001722;pointer-events:none;letter-spacing:.02em;transition:opacity 1s}",
  "#dw-swim-hint.fade{opacity:0}",
  "#dw-left-hint{position:fixed;z-index:300;left:max(14px,env(safe-area-inset-left));bottom:max(22px,env(safe-area-inset-bottom));color:#d9ffffb8;font:600 10px/1.35 system-ui;text-shadow:0 1px 5px #001722;pointer-events:none;transition:opacity 1s}",
  "#dw-left-hint.fade{opacity:0}",
  "#dw-boost-light{position:fixed;z-index:300;left:max(14px,env(safe-area-inset-left));bottom:max(40px,calc(env(safe-area-inset-bottom) + 30px));color:#a5f6ff;font:800 12px/1.3 system-ui;letter-spacing:.05em;text-shadow:0 2px 8px #001d27;opacity:0;pointer-events:none;transition:opacity .12s}",
  "#dw-boost-light.active{opacity:1}",
  "body:not(.g) #dw-swim-pad,body:not(.g) #dw-left-hint,body:not(.g) #dw-boost-light{display:none!important}",
  "#o{z-index:760!important}",
  "#iosdiag:not([open]){display:none}"
 ].join("\n");
 document.head.appendChild(css);
 const swim=document.createElement("div");
 swim.id="dw-swim-pad";
 swim.setAttribute("aria-label","Hold to swim forward, double tap and hold to reverse, drag to steer; hold at the edge for continuous turning");
 swim.innerHTML='<span id="dw-swim-hint">RIGHT: HOLD / DRAG · DOUBLE HOLD = REVERSE</span>';
 const leftHint=document.createElement("div");
 leftHint.id="dw-left-hint";
 leftHint.textContent="LEFT: DRAG TO STRAFE / DIVE";
 const indicator=document.createElement("div");
 indicator.id="dw-boost-light";
 indicator.textContent="⚡ BOOST";
 const stage=document.getElementById("dw-stage");
 (stage||document.body).append(swim,leftHint,indicator);
 const rightHint=swim.querySelector("#dw-swim-hint");
 window.setTimeout(()=>{rightHint?.classList.add("fade");leftHint.classList.add("fade")},6500);
 const playing=()=>document.body.classList.contains("g");
 const sideways=()=>window.matchMedia("(pointer:coarse) and (orientation:portrait)").matches;
 const gameWidth=()=>stage?stage.clientWidth:window.innerWidth;
 const gameHeight=()=>stage?stage.clientHeight:window.innerHeight;
 // Rotated stage: local (x,y) maps to screen (screenWidth-y,x).
 // Inverse-transform every touch, preserving finger identity across the screen.
 const gamePoint=t=>sideways()?{x:t.clientY,y:window.innerWidth-t.clientX}:{x:t.clientX,y:t.clientY};
 const analog={forward:0,side:0,eventCount:0,source:"gesture"};
 window.__dwAnalog=analog;window.__dwGhost=false;
 let right=null,left=null,lastTap=null,lastRightTap=null,boosting=false,edgeLoopActive=false,edgeLastTime=0;
 const tapMs=300,tapDistance=70;
 function setMove(value){
  analog.forward=value;analog.eventCount++;
  analog.source=value<0?"reverse":value>0?"forward":analog.side?"strafe":"idle";
  move(analog.forward,analog.side);
  syncBoost();
 }
 function setStrafe(value){
  const next=Math.max(-1,Math.min(1,value));
  if(Math.abs(next-analog.side)<.005)return;
  analog.side=next;analog.eventCount++;
  analog.source=analog.forward<0?"reverse":analog.forward>0?"forward":next?"strafe":"idle";
  move(analog.forward,analog.side);
 }
 function syncBoost(){
  const active=right!==null&&left!==null&&left.mode==="boost";
  if(active===boosting)return;
  boosting=active;boost(active);
  indicator.classList.toggle("active",active);
 }
 function reset(){
  right=null;left=null;lastTap=null;lastRightTap=null;edgeLastTime=0;
  setMove(0);setStrafe(0);syncBoost();
  window.__dwDashTime=0;window.__dwVerticalScroll=0;
 }
 const stopNative=e=>{if(e.cancelable)e.preventDefault()};
 /* Turning must run every rendered frame: touchmove stops firing when the
    finger stops at the edge. Arm only after a genuine horizontal drag, so
    a stationary tap near the edge does not unexpectedly rotate the camera. */
 function tickEdge(time){
  if(right===null||!playing()){
   edgeLoopActive=false;edgeLastTime=0;
   return;
  }
  const dt=edgeLastTime?Math.max(0,Math.min(.05,(time-edgeLastTime)/1000)):0;
  edgeLastTime=time;
  if(dt&&right.edgeArmed){
   const width=gameWidth();
   const margin=Math.max(30,Math.min(72,width*.14));
   const x=Math.max(0,Math.min(width,right.x));
   const penetration=x<margin?(margin-x)/margin:
    x>width-margin?(x-(width-margin))/margin:0;
   if(penetration>0){
    const direction=x<width*.5?-1:1;
    const radiansPerSecond=2.25*Math.pow(Math.min(1,penetration),1.4);
    look(direction*radiansPerSecond*dt/.0022,0);
   }
  }
  window.requestAnimationFrame(tickEdge);
 }
 function startEdgeLoop(){
  if(edgeLoopActive)return;
  edgeLoopActive=true;edgeLastTime=0;
  window.requestAnimationFrame(tickEdge);
 }
 function beginRight(e){
  if(!playing()||right!==null)return;
  for(const t of e.changedTouches){
   const p=gamePoint(t);
   if(p.x<gameWidth()*.5)continue;
   const now=Date.now();
   const reverse=lastRightTap!==null&&now-lastRightTap.time<=310&&
    Math.hypot(p.x-lastRightTap.x,p.y-lastRightTap.y)<=74;
   lastRightTap=null;
   right={id:t.identifier,x:p.x,y:p.y,
    startX:p.x,startY:p.y,startTime:now,
    dir:reverse?-1:1,travelX:0,maximumTravel:0,edgeArmed:false};
   stopNative(e);e.stopPropagation();
   setMove(right.dir);
   startEdgeLoop();
   return;
  }
 }
 swim.addEventListener("touchstart",beginRight,{passive:false});
 /* Left-side gestures are observed on the document itself, not a floating left
    overlay: this avoids the iPhone lower-left hit-testing bug. */
 function beginLeft(e){
  if(!playing())return;
  for(const t of e.changedTouches){
   if(right!==null&&t.identifier===right.id)continue;
   const p=gamePoint(t);
   if(left!==null||p.x>=gameWidth()*.5)continue;
   const now=Date.now();
   const isDouble=lastTap!==null&&now-lastTap.time<=tapMs&&
     Math.hypot(p.x-lastTap.x,p.y-lastTap.y)<=tapDistance;
   left={
    id:t.identifier,startX:p.x,startY:p.y,lastY:p.y,
    startTime:now,maximumTravel:0,mode:"drag",strafe:0
   };
   if(isDouble){
    lastTap=null;
    if(right!==null){
     left.mode="boost";
     syncBoost();
    }else{
     left.mode="dash";
     dash();
     indicator.textContent="↝ DASH";
     indicator.classList.add("active");
     window.setTimeout(()=>{if(!boosting)indicator.classList.remove("active");indicator.textContent="⚡ BOOST"},430);
    }
   }else if(lastTap&&now-lastTap.time>tapMs){
    lastTap=null;
   }
   stopNative(e);
   break;
  }
 }
 function moveTouches(e){
  if(!playing()||(!right&&!left))return;
  let handled=false;
  for(const t of e.touches){
   const p=gamePoint(t);
   if(right!==null&&t.identifier===right.id){
    const dx=p.x-right.x,dy=p.y-right.y;
    right.travelX+=Math.abs(dx);
    right.maximumTravel=Math.max(right.maximumTravel,
     Math.hypot(p.x-right.startX,p.y-right.startY));
    if(right.travelX>=20)right.edgeArmed=true;
    right.x=p.x;right.y=p.y;
    if(Math.abs(dx)+Math.abs(dy)>.01){
     const sensitivity=520/Math.max(240,Math.min(gameWidth(),gameHeight()));
     look(dx*sensitivity,dy*sensitivity);
    }
    handled=true;
   }
   if(left!==null&&t.identifier===left.id){
    const dy=p.y-left.lastY;left.lastY=p.y;
    left.maximumTravel=Math.max(left.maximumTravel,
      Math.hypot(p.x-left.startX,p.y-left.startY));
    // Thumb displacement acts like a hidden analog stick on the horizontal
    // axis; unlike a swipe impulse, holding it at the edge keeps moving.
    const dx=p.x-left.startX,dead=16,reach=96;
    const amount=Math.abs(dx)<=dead?0:Math.sign(dx)*Math.min(1,(Math.abs(dx)-dead)/(reach-dead));
    left.strafe=amount;
    setStrafe(amount);
    if(Math.abs(dy)>.01)verticalDrag(-dy*.078);
    handled=true;
   }
  }
  if(handled)stopNative(e);
 }
 function endTouches(e){
  if(!right&&!left)return;
  let handled=false;
  for(const t of e.changedTouches){
   const p=gamePoint(t);
   if(right!==null&&t.identifier===right.id){
    const ended=right;
    if(e.type==="touchend"&&ended.dir===1&&
     Date.now()-ended.startTime<=245&&ended.maximumTravel<=24&&
     ended.travelX<20){
     lastRightTap={time:Date.now(),x:p.x,y:p.y};
    }else lastRightTap=null;
    right=null;setMove(0);handled=true;
   }
   if(left!==null&&t.identifier===left.id){
    if(e.type==="touchend"&&left.mode==="drag"&&
       Date.now()-left.startTime<=250&&left.maximumTravel<=24){
     lastTap={time:Date.now(),x:p.x,y:p.y};
    }else lastTap=null;
    left=null;setStrafe(0);syncBoost();handled=true;
   }
  }
  if(handled)stopNative(e);
 }
 for(const type of ["touchstart","touchmove","touchend","touchcancel"]){
  document.addEventListener(type,e=>{
   if(type==="touchstart")beginLeft(e);
   else if(type==="touchmove")moveTouches(e);
   else endTouches(e);
  },{capture:true,passive:false});
 }
 /* Pointer fallback for browsers emulating touch with a mouse or pen. */
 if(!("ontouchstart" in window)){
  swim.addEventListener("pointerdown",e=>{
   if(right||!playing())return;
   const p=gamePoint(e);right={id:e.pointerId,x:p.x,y:p.y,startX:p.x,startY:p.y,travelX:0,edgeArmed:false};e.preventDefault();
   try{swim.setPointerCapture(e.pointerId)}catch{}
   setMove(1);startEdgeLoop();
  });
  swim.addEventListener("pointermove",e=>{
   if(!right||right.id!==e.pointerId)return;
   const p=gamePoint(e);const dx=p.x-right.x,dy=p.y-right.y;
   right.travelX+=Math.abs(dx);if(right.travelX>=20)right.edgeArmed=true;
   right.x=p.x;right.y=p.y;
   look(dx*1.2,dy*1.2);
  });
  for(const type of ["pointerup","pointercancel","lostpointercapture"])
   swim.addEventListener(type,e=>{
    if(right&&e.pointerId===right.id){right=null;setMove(0)}
   });
 }
 window.addEventListener("blur",reset);
 document.addEventListener("visibilitychange",()=>{if(document.hidden)reset()});
 window.__iosLog?.("V16: horizontal strafe + depth drag on left; right swim and steer");
 return {reset};
}
window.DeepWondersControls={mount};
})();