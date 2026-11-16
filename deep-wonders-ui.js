/* Deep Wonders: compact touch-friendly explorer overlay. */
(function(){
"use strict";
function mount(scenes,onPick){
 const style=document.createElement("style");
 style.textContent=[
  "#dw-ui{position:fixed;z-index:800;top:max(12px,env(safe-area-inset-top));bottom:auto;left:max(12px,env(safe-area-inset-left));font:600 13px/1.35 -apple-system,system-ui,sans-serif;max-width:calc(100vw - 24px);color:#eafcff}",
  "body:not(.m) #dw-ui{display:none}",
  "#dw-toggle{border:1px solid #77edffbb;background:#073547ee;color:#eafcff;border-radius:18px;padding:10px 13px;letter-spacing:0;font:700 13px system-ui;box-shadow:0 3px 18px #001d24;text-transform:none}",
  "#dw-panel{display:none;position:absolute;top:49px;bottom:auto;left:0;width:min(340px,calc(100vw - 32px));max-height:min(66vh,430px);overflow:auto;border:1px solid #72cfe0;border-radius:15px;padding:13px;background:#041e2bf2;box-shadow:0 5px 30px #00161c}",
  "#dw-ui.dw-open #dw-panel{display:block}",
  "#dw-panel h2{font:800 16px system-ui;margin:0 0 5px;color:#9ff0ff}",
  "#dw-panel p{font:400 12px system-ui;margin:0 0 10px;color:#bde6e9}",
  "#dw-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}",
  "#dw-grid button{display:block;padding:10px 7px;white-space:normal;text-align:left;border:1px solid #2e7487;border-radius:9px;background:#0b3c4d;color:#effeff;font:700 12px/1.25 system-ui;letter-spacing:0;box-shadow:none;text-transform:none}",
  "#dw-grid button span{display:block;font:400 10px/1.2 system-ui;color:#b2d2d6;margin-top:4px}",
  "#dw-current{font:500 11px/1.3 system-ui;margin-top:10px;color:#84e8ed}"
 ].join("");
 document.head.appendChild(style);
 const root=document.createElement("div");root.id="dw-ui";
 root.innerHTML='<button id="dw-toggle" type="button">✦ Explore · 6 places</button><div id="dw-panel"><h2>Deep Wonders</h2><p>Pick a location to resume swimming there.</p><div id="dw-grid"></div><div id="dw-current">Select an area to begin</div></div>';
 document.body.appendChild(root);
 const grid=root.querySelector("#dw-grid");
 for(let i=0;i<scenes.length;i++){
  const destination=scenes[i],button=document.createElement("button");button.type="button";
  button.textContent=destination.name;
  const info=document.createElement("span");info.textContent=destination.desc;button.appendChild(info);
  button.addEventListener("click",()=>{
   try{onPick(destination)}catch(err){console.error("Explore destination: "+err.message)}
   root.querySelector("#dw-current").textContent="Exploring: "+destination.name;
   root.classList.remove("dw-open");
  });
  grid.appendChild(button);
 }
 root.querySelector("#dw-toggle").addEventListener("click",()=>root.classList.toggle("dw-open"));
 document.addEventListener("keydown",e=>{if(e.key==="Escape")root.classList.remove("dw-open")});
}
window.DeepWondersUI={mount};
})();