/* Deep Wonders V10 — gesture-only iPhone controls.
 * Right touch begins forward swim and can steer across either half.
 * Left swipe adjusts depth; double tap-hold boosts while swimming.
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
  "#dw-swim-pad{position:fixed;z-index:500;right:0;top:0;bottom:0;width:50vw;width:50dvw;touch-action:none!important;overscroll-behavior:contain;pointer-events:auto!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;background:transparent}",
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
 swim.setAttribute("aria-label","Hold to swim forward and drag to steer, even across the screen");
 swim.innerHTML='<span id="dw-swim-hint">RIGHT: HOLD + STEER</span>';
 const leftHint=document.createElement("div");
 leftHint.id="dw-left-hint";
 leftHint.textContent="LEFT: DRAG DEPTH · DOUBLE TAP";
 const indicator=document.createElement("div");
 indicator.id="dw-boost-light";
 indicator.textContent="⚡ BOOST";
 document.body.append(swim,leftHint,indicator);
 const rightHint=swim.querySelector("#dw-swim-hint");
 window.setTimeout(()=>{rightHint?.classList.add("fade");leftHint.classList.add("fade")},6500);
 const playing=()=>document.body.classList.contains("g");
 const analog={forward:0,side:0,eventCount:0,source:"gesture"};
 window.__dwAnalog=analog;window.__dwGhost=false;
 let right=null,left=null,lastTap=null,boosting=false;
 const tapMs=300,tapDistance=70;
 function setMove(value){
  analog.forward=value?1:0;analog.side=0;analog.eventCount++;
  analog.source=value?"right-hold":"idle";
  move(analog.forward,0);
  syncBoost();
 }
 function syncBoost(){
  const active=right!==null&&left!==null&&left.mode==="boost";
  if(active===boosting)return;
  boosting=active;boost(active);
  indicator.classList.toggle("active",active);
 }
 function reset(){
  right=null;left=null;lastTap=null;
  setMove(false);syncBoost();
  window.__dwDashTime=0;window.__dwVerticalScroll=0;
 }
 const stopNative=e=>{if(e.cancelable)e.preventDefault()};
 function beginRight(e){
  if(!playing()||right!==null)return;
  for(const t of e.changedTouches){
   if(t.clientX<window.innerWidth*.5)continue;
   right={id:t.identifier,x:t.clientX,y:t.clientY};
   stopNative(e);e.stopPropagation();
   setMove(true);
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
   if(left!==null||t.clientX>=window.innerWidth*.5)continue;
   const now=Date.now();
   const isDouble=lastTap!==null&&now-lastTap.time<=tapMs&&
     Math.hypot(t.clientX-lastTap.x,t.clientY-lastTap.y)<=tapDistance;
   left={
    id:t.identifier,startX:t.clientX,startY:t.clientY,lastY:t.clientY,
    startTime:now,maximumTravel:0,mode:"drag"
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
   if(right!==null&&t.identifier===right.id){
    const dx=t.clientX-right.x,dy=t.clientY-right.y;
    right.x=t.clientX;right.y=t.clientY;
    if(Math.abs(dx)+Math.abs(dy)>.01){
     const sensitivity=520/Math.max(240,Math.min(window.innerWidth,window.innerHeight));
     look(dx*sensitivity,dy*sensitivity);
    }
    handled=true;
   }
   if(left!==null&&t.identifier===left.id){
    const dy=t.clientY-left.lastY;left.lastY=t.clientY;
    left.maximumTravel=Math.max(left.maximumTravel,
      Math.hypot(t.clientX-left.startX,t.clientY-left.startY));
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
   if(right!==null&&t.identifier===right.id){
    right=null;setMove(false);handled=true;
   }
   if(left!==null&&t.identifier===left.id){
    if(e.type==="touchend"&&left.mode==="drag"&&
       Date.now()-left.startTime<=250&&left.maximumTravel<=24){
     lastTap={time:Date.now(),x:t.clientX,y:t.clientY};
    }else lastTap=null;
    left=null;syncBoost();handled=true;
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
   right={id:e.pointerId,x:e.clientX,y:e.clientY};e.preventDefault();
   try{swim.setPointerCapture(e.pointerId)}catch{}
   setMove(true);
  });
  swim.addEventListener("pointermove",e=>{
   if(!right||right.id!==e.pointerId)return;
   const dx=e.clientX-right.x,dy=e.clientY-right.y;
   right.x=e.clientX;right.y=e.clientY;
   look(dx*1.2,dy*1.2);
  });
  for(const type of ["pointerup","pointercancel","lostpointercapture"])
   swim.addEventListener(type,e=>{
    if(right&&e.pointerId===right.id){right=null;setMove(false)}
   });
 }
 window.addEventListener("blur",reset);
 document.addEventListener("visibilitychange",()=>{if(document.hidden)reset()});
 window.__iosLog?.("V10 gesture controls: right swim/steer, left drag depth, double tap boost or dash");
 return {reset};
}
window.DeepWondersControls={mount};
})();