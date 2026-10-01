const $=s=>document.querySelector(s),m=$("#m");let cur="link",stream=null,facing="environment",loop=0,tOn=false;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const P={link:'<label for="a">URL</label><input id="a" placeholder="https://example.com" autocomplete="off"><button class="btn p" data-run>Check Link</button><div id="o"></div>',
sms:'<label for="a">Suspicious SMS</label><textarea id="a" placeholder="Paste the suspicious SMS here..."></textarea><button class="btn p" data-run>Analyze Message</button><div id="o"></div>',
email:'<label for="a">Sender Email</label><input id="a"><label for="b">Subject</label><input id="b"><label for="c">Email Content</label><textarea id="c"></textarea><label for="d">Reply-To (optional)</label><input id="d"><button class="btn p" data-run>Analyze Email</button><div id="o"></div>',
qr:'<button class="btn p" id="cam">📷 Use Camera</button><button class="btn" id="upb">📁 Upload QR Image</button><input type="file" id="up" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" hidden><div class="drop" id="drop">Drag &amp; drop a QR image here (JPG, PNG, WEBP)</div><div id="camw"></div><p class="mu">Camera access is used only to detect the QR code. The camera stops automatically after scanning or when you close the scanner. Nothing is recorded or uploaded, and the destination is never opened.</p><div id="o"></div>'};
function show(t,pre){stopCam();cur=t;document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.t===t));m.innerHTML=P[t];if(pre&&$("#a")){$("#a").value=pre}}
function result(r){const c={"SAFE":["#16a34a","🟢 Safe"],"SUSPICIOUS":["#d97706","🟠 Suspicious"],"PHISHING DETECTED":["#dc2626","🔴 Phishing Detected"]}[r.status];
$("#o").innerHTML=`<div class="res" aria-live="polite">${r.qrType?`<h3>QR Code Detected (${r.qrType})</h3>`:""}${r.destination?`<p>Destination: <code>${esc(r.destination)}</code></p>`:""}<div class="score">${r.score} / 100</div><div class="bar"><i style="width:${r.score}%;background:${c[0]}"></i></div><p><span class="badge" style="background:${c[0]}">${c[1]}</span></p><b>Why was this flagged?</b><ul>${r.indicators.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><b>Recommended Action</b><p>${esc(r.recommendation)}</p><p class="mu">Rule-based estimate, not a guarantee. Nothing was opened or uploaded.</p><button class="btn" data-again>Scan Another</button></div>`}
const fail=e=>{$("#o").innerHTML=`<p class="err" role="alert">${esc(/^(No content|Unable|QR code)/.test(e&&e.message)?e.message:"Something went wrong. Please try again.")}</p>`};
const v=id=>($("#"+id)||{}).value||"";
m.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
if(b.dataset.run!==undefined){try{result(cur==="link"?SafeScan.url(v("a")):cur==="sms"?SafeScan.sms(v("a")):SafeScan.email({sender:v("a"),subject:v("b"),body:v("c"),replyTo:v("d")}))}catch(x){fail(x)}}
else if(b.dataset.again!==undefined)show(cur);else if(b.id==="cam")startCam();else if(b.id==="upb")$("#up").click();else if(b.id==="sw")switchCam();else if(b.id==="tor")torch();else if(b.id==="cls")stopCam(true)});
m.addEventListener("change",e=>{if(e.target.id==="up"&&e.target.files[0])fromImage(e.target.files[0])});
m.addEventListener("dragover",e=>{if(e.target.closest("#drop")){e.preventDefault();$("#drop").classList.add("h")}});
m.addEventListener("dragleave",()=>{$("#drop")&&$("#drop").classList.remove("h")});
m.addEventListener("drop",e=>{if(e.target.closest("#drop")){e.preventDefault();e.dataTransfer.files[0]&&fromImage(e.dataTransfer.files[0])}});
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>show(b.dataset.t));
const dec=(src,w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(src,0,0,w,h);const d=x.getImageData(0,0,w,h),q=jsQR(d.data,w,h);return q?q.data:null};
function handle(val){try{result(SafeScan.qr(val))}catch(e){fail(e)}}
function fromImage(f){if(!/^image\/(jpeg|png|webp)$/.test(f.type)){fail(new Error("QR code could not be detected. Use a JPG, PNG or WEBP image."));return}
const img=new Image(),u=URL.createObjectURL(f);img.onload=()=>{const sc=Math.min(1,1400/Math.max(img.width,img.height)),val=dec(img,Math.round(img.width*sc),Math.round(img.height*sc));URL.revokeObjectURL(u);val?handle(val):fail(new Error("QR code could not be detected."))};img.onerror=()=>fail(new Error("QR code could not be detected."));img.src=u}
function stopCam(ui){loop++;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}if(ui&&$("#camw"))$("#camw").innerHTML=""}
async function startCam(){const w=$("#camw");if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){w.innerHTML='<p class="err">Camera is not available on this device.</p><button class="btn" id="upb">Upload QR Image</button>';return}
stopCam();$("#o").innerHTML="";
try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing}},audio:false})}catch(e){const d=e&&(e.name==="NotAllowedError"||e.name==="SecurityError");
w.innerHTML=d?'<h3>Camera Access Required</h3><p>SafeScan needs camera access to scan QR codes.</p><button class="btn p" id="cam">Try Again</button><button class="btn" id="upb">Upload QR Instead</button>':'<p class="err">Camera is unavailable.</p><button class="btn" id="upb">Upload QR Image</button>';return}
let tor=false;try{tor=!!stream.getVideoTracks()[0].getCapabilities().torch}catch(e){}
w.innerHTML=`<h3>Scan QR Code</h3><div class="vid"><video id="vd" playsinline muted></video><div class="fr"></div></div><p>Point your camera at a QR code.</p><button class="btn" id="cls">Close</button><button class="btn" id="sw">Switch Camera</button>${tor?'<button class="btn" id="tor">Flash</button>':""}<button class="btn" id="cam">Scan Again</button>`;
const vd=$("#vd");vd.srcObject=stream;await vd.play().catch(()=>{});const my=++loop;
(function tick(){if(my!==loop||!stream)return;if(vd.videoWidth){const val=dec(vd,vd.videoWidth,vd.videoHeight);if(val){stopCam(true);handle(val);return}}setTimeout(tick,200)})()}
async function torch(){try{tOn=!tOn;await stream.getVideoTracks()[0].applyConstraints({advanced:[{torch:tOn}]})}catch(e){}}
function switchCam(){facing=facing==="environment"?"user":"environment";startCam()}
addEventListener("pagehide",()=>stopCam());document.addEventListener("visibilitychange",()=>{if(document.hidden)stopCam(true)});
const q=new URLSearchParams(location.search),t0=q.get("tab")||"link";
chrome.storage.local.get("prefill",r=>{const pf=r.prefill;chrome.storage.local.remove("prefill");show(t0,pf&&pf.tab===t0?pf.text:"")});
