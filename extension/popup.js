const t=document.getElementById("t"),s=document.getElementById("s");
const paint=v=>{t.checked=v;s.textContent=v?"Shield On":"Shield Off"};
chrome.storage.local.get("enabled",r=>paint(r.enabled!==false));
t.onchange=()=>{chrome.storage.local.set({enabled:t.checked});paint(t.checked)};
document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{chrome.runtime.sendMessage({open:b.dataset.o});window.close()});
document.getElementById("snip").onclick=()=>{chrome.tabs.query({active:true,currentWindow:true},t=>{if(t[0])chrome.tabs.sendMessage(t[0].id,{snipStart:true},()=>void chrome.runtime.lastError);window.close()})};
