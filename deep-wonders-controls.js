/* Deep Wonders v6 - native touch joystick with motion telemetry. */
(function(){
"use strict";
function mount({move,vertical,boost}){
 const st=document.createElement("style");
 st.textContent=[
  "@media(pointer:coarse){#dw-ui{top:max(65px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left));bottom:auto}#dw-panel{top:49px;bottom:auto}}",
  "#dw-touch{position:fixed;z-index:240;inset:0;pointer-events:none;color:#eaffff;font-family:-apple-system,system-ui,sans-serif;user-select:none;-webkit-user-select:none}",
  "body:not(.g) #dw-touch{display:none}",
  "#dw-stick{position:absolute;bottom:max(25px,env(safe-area-inset-bottom));left:max(18px,env(safe-area-inset-left));width:142px;height:142px;border:2px solid #b0f6ffb3;border-radius:50%;background:#052f4099;box-shadow:inset 0 0 30px #003746,0 0 12px #002b3a;pointer-events:auto;touch-action:none}",
  "#dw-stick:before,#dw-stick:after{content:'';position:absolute;background:#86e0ed50;pointer-events:none}#dw-stick:before{left:50%;top:15px;bottom:15px;width:1px}#dw-stick:after{top:50%;left:15px;right:15px;height:1px}",
  "#dw-thumb{position:absolute;left:50%;top:50%;width:56px;height:56px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(#adfaff,#2695a8);border:2px solid #d7ffff;box-shadow:0 1px 10px #002e3c;pointer-events:none}",
  "#dw-stick-label{position:absolute;bottom:-19px;width:100%;text-align:center;font-size:10px;letter-spacing:.1em;color:#d3f8ff;pointer-events:none}",
  "#dw-motion-status{position:absolute;bottom:max(190px,calc(env(safe-area-inset-bottom) + 172px));left:max(12px,env(safe-area-inset-left));padding:5px 8px;border:1px solid #8be7f96e;border-radius:7px;background:#032b38c9;color:#eaffff;font:700 10px/1.35 ui-monospace,monospace;pointer-events:none;letter-spacing:0}",
  "#dw-actions{position:absolute;bottom:max(26px,env(safe-area-inset-bottom));right:max(14px,env(safe-area-inset-right));display:grid;grid-template-columns:repeat(2,64px);grid-template-rows:repeat(2,52px) 40px;gap:8px;pointer-events:none}",
  "#dw-actions button{pointer-events:auto;touch-action:none;margin:0;padding:0;min-height:40px;border:1px solid #a1ecf4a1;border-radius:13px;background:#07364abf;color:#f1feff;font:700 12px/1.1 system-ui;letter-spacing:0;box-shadow:0 2px 8px #00293c;text-transform:none}",
  "#dw-actions button.is-held{background:#5dc8da;color:#073043}",
  "#dw-up{grid-column:1;grid-row:1}#dw-down{grid-column:1;grid-row:2}#dw-boost{grid-column:2;grid-row:1 / span 2}#dw-free{grid-column:1 / 3;grid-row:3}",
  "#dw-tip{position:absolute;bottom:max(182px,calc(env(safe-area-inset-bottom) + 164px));left:50%;transform:translateX(-50%);font:500 10px/1.3 system-ui;color:#d7ffffd0;white-space:nowrap;text-shadow:0 2px 4px #001822;pointer-events:none}",
  "@media(max-width:380px){#dw-stick{width:116px;height:116px}#dw-thumb{width:48px;height:48px}#dw-actions{grid-template-columns:repeat(2,54px);grid-template-rows:repeat(2,44px) 36px}#dw-tip{display:none}}"
 ].join("\n");
 document.head.appendChild(st);
 const root=document.createElement("div");root.id="dw-touch";
 root.innerHTML='<div id="dw-stick" role="group" aria-label="Move joystick"><div id="dw-thumb"></div><span id="dw-stick-label">MOVE</span></div><div id="dw-actions"><button id="dw-up" type="button">↑<br>UP</button><button id="dw-down" type="button">↓<br>DOWN</button><button id="dw-boost" type="button">⚡<br>BOOST</button><button id="dw-free" type="button">Free swim: OFF</button></div><div id="dw-tip">Left stick: move · Drag water: look</div><div id="dw-motion-status">Stick idle · travel 0</div>';
 document.body.appendChild(root);
 const pad=root.querySelector("#dw-stick"),thumb=root.querySelector("#dw-thumb");
 let pointer=null,touchId=null;
 window.__dwAnalog={forward:0,side:0,eventCount:0,source:"idle"};
 const update=(clientX,clientY,source)=>{
  const r=pad.getBoundingClientRect(),max=Math.max(24,r.width*.35);
  let x=(clientX-r.left-r.width/2)/max,y=(clientY-r.top-r.height/2)/max;
  const mag=Math.hypot(x,y);
  if(mag>1){x/=mag;y/=mag;}
  if(Math.hypot(x,y)<.13)x=y=0;
  thumb.style.transform="translate(-50%,-50%) translate("+Math.round(x*max)+"px,"+Math.round(y*max)+"px)";
  const state=window.__dwAnalog;
  state.forward=-y;state.side=x;state.eventCount++;state.source=source;
  move(state.forward,state.side);
 };
 const reset=()=>{
  pointer=null;touchId=null;
  thumb.style.transform="translate(-50%,-50%)";
  const state=window.__dwAnalog;
  state.forward=0;state.side=0;state.source="idle";
  move(0,0);
 };
 /* Prefer native touch events on iOS. Pointer capture can be interrupted by WebKit
    when both overlay controls and a WebGPU canvas are active. */
 if("ontouchstart" in window){
  pad.addEventListener("touchstart",e=>{
   if(touchId!==null||!e.changedTouches.length)return;
   const t=e.changedTouches[0];touchId=t.identifier;
   e.preventDefault();e.stopPropagation();update(t.clientX,t.clientY,"touch");
  },{passive:false});
  pad.addEventListener("touchmove",e=>{
   if(touchId===null)return;
   for(const t of e.touches)if(t.identifier===touchId){
    e.preventDefault();e.stopPropagation();update(t.clientX,t.clientY,"touch");break;
   }
  },{passive:false});
  const finish=e=>{
   if(touchId===null)return;
   for(const t of e.changedTouches)if(t.identifier===touchId){
    e.preventDefault();e.stopPropagation();reset();break;
   }
  };
  pad.addEventListener("touchend",finish,{passive:false});
  pad.addEventListener("touchcancel",finish,{passive:false});
 }else{
  pad.addEventListener("pointerdown",e=>{
   if(pointer!==null)return;
   e.preventDefault();e.stopPropagation();pointer=e.pointerId;
   try{pad.setPointerCapture(e.pointerId)}catch{}
   update(e.clientX,e.clientY,"pointer");
  });
  pad.addEventListener("pointermove",e=>{
   if(pointer===e.pointerId){e.preventDefault();update(e.clientX,e.clientY,"pointer")}
  });
  for(const event of ["pointerup","pointercancel","lostpointercapture"])
   pad.addEventListener(event,e=>{if(pointer===e.pointerId)reset()});
 }
 const bindHold=(id,callback)=>{
  const button=root.querySelector(id);let active=null;
  button.addEventListener("pointerdown",e=>{
   if(active!==null)return;
   e.preventDefault();e.stopPropagation();active=e.pointerId;
   button.setPointerCapture(e.pointerId);
   button.classList.add("is-held");callback(true);
  });
  for(const event of ["pointerup","pointercancel","lostpointercapture"])
   button.addEventListener(event,e=>{
    if(active===e.pointerId){active=null;button.classList.remove("is-held");callback(false)}
   });
 };
 bindHold("#dw-up",on=>vertical(on?1:0,0));
 bindHold("#dw-down",on=>vertical(0,on?1:0));
 bindHold("#dw-boost",on=>boost(on));
 const ghost=root.querySelector("#dw-free");window.__dwGhost=false;
 ghost.addEventListener("click",()=>{
  window.__dwGhost=!window.__dwGhost;
  ghost.textContent=window.__dwGhost?"Free swim: ON":"Free swim: OFF";
  ghost.style.background=window.__dwGhost?"#1e9daa":"#07364abf";
 });
 window.addEventListener("blur",()=>{reset();vertical(0,0);boost(false)});
 window.__iosLog?.("Mobile movement joystick ready");
 return {reset};
}
window.DeepWondersControls={mount};
})();