/* Deep Wonders V9 — minimal mobile swimming.
   Right side: hold to swim forward, drag to steer.
   Second touch on left: boost. Only visible gameplay buttons: Up and Down.
   Original Abyssal Garden is MIT licensed. */
(function(){
"use strict";
function mount({move,look,vertical,boost}){
 const css=document.createElement("style");
 css.id="dw-minimal-style";
 css.textContent=[
  "html,body{overscroll-behavior:none}",
  "body.g{touch-action:none;-webkit-user-select:none;user-select:none}",
  "#dw-swim-pad{position:fixed;z-index:500;right:0;top:0;bottom:0;width:55vw;width:55dvw;touch-action:none!important;overscroll-behavior:contain;pointer-events:auto!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;background:transparent}",
  "#dw-swim-hint{position:absolute;right:15px;bottom:max(22px,env(safe-area-inset-bottom));color:#e4ffffad;font:600 11px/1.3 system-ui;text-shadow:0 1px 5px #001722;pointer-events:none;letter-spacing:.02em;transition:opacity 1s}",
  "#dw-swim-hint.fade{opacity:0}",
  "#dw-depth{position:fixed;z-index:700;top:max(12px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left));display:flex;flex-direction:column;gap:9px;pointer-events:auto!important}",
  "#dw-depth button{pointer-events:auto!important;touch-action:none!important;-webkit-touch-callout:none;width:65px;height:54px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;padding:3px 2px;background:#07394dbb;color:#dffbff;border:1px solid #8fe3ed9e;border-radius:12px;box-shadow:0 2px 9px #002431;font:800 12px/1.15 system-ui;letter-spacing:.04em;text-transform:none;transition:none}",
  "#dw-depth button b{font:900 17px/1 system-ui}",
  "#dw-depth button.pressed{background:#84dceb;color:#073647}",
  "#dw-boost-hint{position:fixed;z-index:680;left:max(13px,env(safe-area-inset-left));bottom:max(18px,env(safe-area-inset-bottom));font:800 12px/1.2 system-ui;letter-spacing:.1em;color:#eaffff;opacity:0;pointer-events:none;transition:opacity .2s;text-shadow:0 2px 5px #001e24}",
  "#dw-boost-hint.on{opacity:1}",
  "body:not(.g) #dw-swim-pad,body:not(.g) #dw-depth,body:not(.g) #dw-boost-hint{display:none!important}",
  "#o{z-index:760!important}",
  "#iosdiag:not([open]){display:none}",
  "@media (orientation:landscape) and (max-height:430px){#dw-depth{top:10px;left:max(10px,env(safe-area-inset-left));gap:6px}#dw-depth button{height:46px;width:59px}}"
 ].join("\n");
 document.head.appendChild(css);
 const swim=document.createElement("div");
 swim.id="dw-swim-pad";
 swim.setAttribute("aria-label","Hold and drag here to swim forward and steer");
 swim.innerHTML='<span id="dw-swim-hint">HOLD + DRAG TO SWIM</span>';
 const depth=document.createElement("div");
 depth.id="dw-depth";
 depth.innerHTML='<button id="dw-up" type="button" aria-label="Swim up"><b>▲</b>UP</button><button id="dw-down" type="button" aria-label="Swim down"><b>▼</b>DOWN</button>';
 const boostHint=document.createElement("div");
 boostHint.id="dw-boost-hint";
 boostHint.textContent="⚡ BOOST";
 document.body.append(swim,depth,boostHint);
 const hint=swim.querySelector("#dw-swim-hint");
 window.setTimeout(()=>hint?.classList.add("fade"),5000);
 let swimId=null,lastX=0,lastY=0,isBoost=false;
 const mobile={forward:0,side:0,eventCount:0,source:"minimal"};
 window.__dwAnalog=mobile;
 window.__dwGhost=false;
 const playing=()=>document.body.classList.contains("g");
 const setMove=on=>{
  mobile.forward=on?1:0;mobile.side=0;
  mobile.eventCount++;mobile.source=on?"swim":"idle";
  move(mobile.forward,0);
 };
 const setBoost=on=>{
  if(on===isBoost)return;
  isBoost=on;
  boost(on);
  boostHint.classList.toggle("on",on);
 };
 const detectLeft=touches=>{
  if(swimId===null||!playing())return setBoost(false);
  let on=false;
  for(const t of touches)if(t.identifier!==swimId&&t.clientX<window.innerWidth*.5){on=true;break;}
  setBoost(on);
 };
 const stop=()=>{
  swimId=null;setMove(false);setBoost(false);
 };
 const start=e=>{
  if(!playing()||swimId!==null||!e.changedTouches.length)return;
  const t=e.changedTouches[0];
  swimId=t.identifier;lastX=t.clientX;lastY=t.clientY;
  e.preventDefault();e.stopPropagation();
  setMove(true);detectLeft(e.touches);
 };
 const moveTouch=e=>{
  if(swimId===null||!playing())return;
  for(const t of e.touches)if(t.identifier===swimId){
   e.preventDefault();e.stopPropagation();
   const dx=t.clientX-lastX,dy=t.clientY-lastY;
   lastX=t.clientX;lastY=t.clientY;
   if(Math.abs(dx)+Math.abs(dy)>.01){
    const scale=520/Math.min(window.innerWidth,window.innerHeight);
    look(dx*scale,dy*scale);
   }
   break;
  }
  detectLeft(e.touches);
 };
 const finish=e=>{
  if(swimId===null)return;
  for(const t of e.changedTouches)if(t.identifier===swimId){
   e.preventDefault();e.stopPropagation();stop();break;
  }
  detectLeft(e.touches);
 };
 swim.addEventListener("touchstart",start,{passive:false});
 swim.addEventListener("touchmove",moveTouch,{passive:false});
 swim.addEventListener("touchend",finish,{passive:false});
 swim.addEventListener("touchcancel",finish,{passive:false});
 /* A second finger can begin on any part of the left half, including the 3D canvas.
    Capture it at document level: no separate left-side touch layer is needed. */
 for(const evt of ["touchstart","touchmove","touchend","touchcancel"]){
  document.addEventListener(evt,e=>{
   if(swimId===null||!playing())return;
   detectLeft(e.touches);
   if(e.touches.length>1&&isBoost&&evt!=="touchend"&&evt!=="touchcancel"&&e.cancelable)
    e.preventDefault();
  },{capture:true,passive:false});
 }
 /* Keep a pointer fallback for desktops that emulate touch screens. */
 let pointerId=null;
 if(!("ontouchstart" in window)){
  swim.addEventListener("pointerdown",e=>{
   if(!playing()||pointerId!==null)return;
   e.preventDefault();pointerId=e.pointerId;
   try{swim.setPointerCapture(e.pointerId)}catch{}
   lastX=e.clientX;lastY=e.clientY;setMove(true);
  });
  swim.addEventListener("pointermove",e=>{
   if(pointerId!==e.pointerId)return;
   e.preventDefault();
   const scale=520/Math.min(window.innerWidth,window.innerHeight);
   look((e.clientX-lastX)*scale,(e.clientY-lastY)*scale);
   lastX=e.clientX;lastY=e.clientY;
  });
  for(const evt of ["pointerup","pointercancel","lostpointercapture"])
   swim.addEventListener(evt,e=>{if(pointerId===e.pointerId){pointerId=null;stop()}});
 }
 const states={up:false,down:false};
 const updateVertical=()=>vertical(states.up?1:0,states.down?1:0);
 function bindDepth(id,key){
  const button=depth.querySelector("#"+id);
  let holdId=null;
  const press=on=>{
   states[key]=on;button.classList.toggle("pressed",on);updateVertical();
  };
  if("ontouchstart" in window){
   button.addEventListener("touchstart",e=>{
    if(holdId!==null||!e.changedTouches.length)return;
    e.preventDefault();e.stopPropagation();
    holdId=e.changedTouches[0].identifier;press(true);
   },{passive:false});
   for(const evt of ["touchend","touchcancel"])
    button.addEventListener(evt,e=>{
     if(holdId===null)return;
     for(const t of e.changedTouches)if(t.identifier===holdId){
      e.preventDefault();e.stopPropagation();holdId=null;press(false);break;
     }
    },{passive:false});
  }else{
   button.addEventListener("pointerdown",e=>{
    if(holdId!==null)return;
    e.preventDefault();holdId=e.pointerId;
    try{button.setPointerCapture(holdId)}catch{}
    press(true);
   });
   for(const evt of ["pointerup","pointercancel","lostpointercapture"])
    button.addEventListener(evt,e=>{if(holdId===e.pointerId){holdId=null;press(false)}});
  }
 }
 bindDepth("dw-up","up");
 bindDepth("dw-down","down");
 const resetActive=()=>{
  pointerId=null;stop();
  states.up=states.down=false;
  for(const el of depth.querySelectorAll("button"))el.classList.remove("pressed");
  updateVertical();
 };
 window.addEventListener("blur",resetActive);
 document.addEventListener("visibilitychange",()=>{if(document.hidden)resetActive()});
 window.__iosLog?.("Minimal touch V9 ready; right hold/drag; left second finger boosts");
 return {reset:resetActive};
}
window.DeepWondersControls={mount,resetActive:()=>window.__dwControl?.reset?.()};
})();