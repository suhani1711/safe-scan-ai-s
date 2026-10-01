(()=>{if(window.__safescan)return;window.__safescan=1;
const host=document.createElement("div");host.style.cssText="all:initial;position:fixed;right:18px;bottom:18px;z-index:2147483647";
const sh=host.attachShadow({mode:"closed"});
sh.innerHTML=`<style>*{box-sizing:border-box;font-family:system-ui,sans-serif}.col{display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.fab{width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;background:linear-gradient(135deg,#3b5bff,#7c3aed);box-shadow:0 8px 24px rgba(47,91,255,.5);display:grid;place-items:center;transition:transform .2s}
.fab:hover{transform:scale(1.08)}.fab:focus-visible,button:focus-visible{outline:3px solid #fff;outline-offset:2px}
.p{width:min(290px,86vw);background:#131a2e;color:#e8ecf8;border:1px solid #25304d;border-radius:16px;padding:8px;box-shadow:0 12px 32px rgba(0,0,0,.4);display:none;font-size:14px;max-height:70vh;overflow:auto}.p.o{display:block}
.it{display:block;width:100%;text-align:left;background:none;border:0;color:inherit;padding:10px 12px;border-radius:10px;cursor:pointer;font-size:14px;min-height:44px}.it:hover{background:#1c2540}.it small{display:block;color:#9aa5c0}
hr{border:0;border-top:1px solid #25304d;margin:4px 0}.b{display:inline-block;padding:3px 10px;border-radius:99px;color:#fff;font-weight:700}.n{color:#9aa5c0;font-size:12px;padding:6px 12px}ul{padding-left:18px;margin:6px 12px}</style>
<div class="col"><div class="p" id="p" role="dialog" aria-label="SafeScan menu"></div>
<button class="fab" id="f" aria-label="SafeScan quick security scan" aria-expanded="false" title="Quick Security Scan"><svg width="30" height="34" viewBox="0 0 30 34"><path d="M15 1 2 6v10c0 8 5.5 14 13 17 7.5-3 13-9 13-17V6z" fill="#5eb3e8" stroke="#f0c14b" stroke-width="2"/><path d="M15 1v32C7.5 30 2 24 2 16V6z" fill="#3b7fd4"/></svg></button></div>`;
const P=sh.getElementById("p"),F=sh.getElementById("f");
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const send=m=>{try{chrome.runtime.sendMessage(m)}catch(e){}};
function menu(){P.innerHTML=`<button class="it" data-a="link">🔗 Links<small>Check a URL</small></button><button class="it" data-a="sms">💬 SMS<small>Scan a message</small></button><button class="it" data-a="email">📧 Mail<small>Check an email</small></button><button class="it" data-a="qr">🔳 QR<small>Camera or upload</small></button><hr><button class="it" data-a="page">🌐 Check this page's address</button><button class="it" data-a="sel">✂️ Scan selected text</button><button class="it" data-a="hide">🚫 Hide shield</button><div class="n">Runs only when you choose. Nothing is uploaded and no link is opened.</div>`}
function back(m){P.innerHTML=`<p style="margin:8px 12px">${m}</p><button class="it" data-a="back">← Back</button>`}
function toggle(o){P.classList.toggle("o",o);F.setAttribute("aria-expanded",o);if(o)menu()}
F.onclick=()=>toggle(!P.classList.contains("o"));
P.onclick=e=>{const a=e.target.closest("[data-a]");if(!a)return;const k=a.dataset.a;
if(["link","sms","email"].includes(k)){send({open:k});toggle(false)}
else if(k==="qr"){P.innerHTML=`<button class="it" data-a="qrcam">📷 Camera / Upload<small>Open the QR scanner</small></button><button class="it" data-a="snip">✂️ Snip QR on page<small>Drag around a QR code on this page</small></button><hr><button class="it" data-a="back">← Back</button>`}
else if(k==="qrcam"){send({open:"qr"});toggle(false)}
else if(k==="snip"){snip()}
else if(k==="page"){try{const r=SafeScan.url(location.href),c={"SAFE":"#16a34a","SUSPICIOUS":"#d97706","PHISHING DETECTED":"#dc2626"}[r.status];
P.innerHTML=`<div style="padding:8px 12px"><b>${esc(location.hostname)}</b><p><span class="b" style="background:${c}">${r.status}</span> Risk ${r.score}/100</p></div><ul>${r.indicators.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><div class="n">Rule-based estimate, not a guarantee.</div><button class="it" data-a="back">← Back</button>`}catch(x){back("Unable to analyze this page.")}}
else if(k==="sel"){const t=(getSelection()||"").toString().trim();if(!t){back("Select some text on the page first, then choose this again.");return}
send({open:/^https?:\/\/\S+$/i.test(t)?"link":"sms",text:t});toggle(false)}
else if(k==="hide")chrome.storage.local.set({enabled:false});else menu()};

function show(h){P.innerHTML=h;P.classList.add("o");F.setAttribute("aria-expanded","true")}
function snip(){toggle(false);const st="all:initial;position:fixed;",o=document.createElement("div");o.style.cssText=st+"inset:0;z-index:2147483647;cursor:crosshair;background:rgba(0,0,0,.35);touch-action:none";
const hint=document.createElement("div");hint.textContent="Drag around the QR code. Press Esc to cancel.";hint.style.cssText=st+"top:16px;left:50%;transform:translateX(-50%);background:#131a2e;color:#fff;padding:8px 14px;border-radius:99px;font:14px system-ui,sans-serif";
const box=document.createElement("div");box.style.cssText=st+"border:2px solid #5eb3e8;background:rgba(94,179,232,.15);display:none";o.append(hint,box);document.documentElement.appendChild(o);
let x0=0,y0=0,r=null,go=false;const end=()=>{o.remove();document.removeEventListener("keydown",esc,true)};
const esc=e=>{if(e.key==="Escape"){e.stopPropagation();end()}};document.addEventListener("keydown",esc,true);
o.onpointerdown=e=>{go=true;x0=e.clientX;y0=e.clientY;o.setPointerCapture(e.pointerId);box.style.display="block";mv(e)};
const mv=e=>{if(!go)return;r={x:Math.min(x0,e.clientX),y:Math.min(y0,e.clientY),w:Math.abs(e.clientX-x0),h:Math.abs(e.clientY-y0)};box.style.left=r.x+"px";box.style.top=r.y+"px";box.style.width=r.w+"px";box.style.height=r.h+"px"};
o.onpointermove=mv;
o.onpointerup=()=>{go=false;end();if(!r||r.w<20||r.h<20){show('<p style="margin:8px 12px">Selection too small. Try again.</p><button class="it" data-a="snip">✂️ Snip again</button>');return}
host.style.visibility="hidden";if(!host.isConnected)document.documentElement.appendChild(host);
setTimeout(()=>{try{chrome.runtime.sendMessage({capture:true,rect:r,vw:innerWidth},res=>{host.style.visibility="visible";void chrome.runtime.lastError;
if(!res||!res.text){show('<p style="margin:8px 12px">QR code could not be detected. Try dragging closer around the QR code.</p><button class="it" data-a="snip">✂️ Snip again</button><button class="it" data-a="back">← Back</button>');return}
try{const q=SafeScan.qr(res.text),c={"SAFE":"#16a34a","SUSPICIOUS":"#d97706","PHISHING DETECTED":"#dc2626"}[q.status];
show(`<div style="padding:8px 12px"><b>QR Code Detected (${q.qrType})</b><p style="word-break:break-all;color:#9aa5c0;margin:6px 0">${esc(q.destination||"")}</p><p><span class="b" style="background:${c}">${q.status}</span> Risk ${q.score}/100</p></div><ul>${q.indicators.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><div class="n">${esc(q.recommendation)} The destination was not opened.</div><button class="it" data-a="snip">✂️ Snip again</button><button class="it" data-a="back">← Menu</button>`)}catch(x){show('<p style="margin:8px 12px">Something went wrong. Please try again.</p>')}})}catch(x){host.style.visibility="visible"}},150)}}
chrome.runtime.onMessage.addListener(m=>{if(m&&m.snipStart)snip()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")toggle(false)});
document.addEventListener("click",e=>{if(!e.composedPath().includes(host))toggle(false)});
const apply=v=>{if(v!==false){if(!host.isConnected)document.documentElement.appendChild(host)}else host.remove()};
chrome.storage.local.get("enabled",r=>apply(r.enabled));
chrome.storage.onChanged.addListener(c=>{if(c.enabled)apply(c.enabled.newValue)});
})();
