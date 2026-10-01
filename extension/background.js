importScripts("jsQR.js");
chrome.runtime.onInstalled.addListener(async()=>{const s=await chrome.storage.local.get("enabled");if(s.enabled===undefined)chrome.storage.local.set({enabled:true});});
async function decodeShot(url,rect,vw){const bmp=await createImageBitmap(await (await fetch(url)).blob()),k=bmp.width/vw,pad=Math.max(rect.w,rect.h)*.12;
const sx=Math.max(0,(rect.x-pad)*k),sy=Math.max(0,(rect.y-pad)*k),sw=Math.min(bmp.width-sx,(rect.w+2*pad)*k),sh=Math.min(bmp.height-sy,(rect.h+2*pad)*k);
const up=Math.min(4,Math.max(1,400/Math.min(sw,sh))),cw=Math.round(sw*up),ch=Math.round(sh*up),cv=new OffscreenCanvas(cw,ch),x=cv.getContext("2d");x.imageSmoothingEnabled=false;x.drawImage(bmp,sx,sy,sw,sh,0,0,cw,ch);
const d=x.getImageData(0,0,cw,ch),q=jsQR(d.data,cw,ch);return q?q.data:null}
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{if(!msg)return;
if(msg.capture&&sender.tab){chrome.tabs.captureVisibleTab(sender.tab.windowId,{format:"png"}).then(u=>decodeShot(u,msg.rect,msg.vw)).then(t=>reply({text:t})).catch(()=>reply({error:1}));return true}
if(msg.open){const tab=["link","sms","email","qr"].includes(msg.open)?msg.open:"link";
const go=()=>chrome.windows.create({url:chrome.runtime.getURL("scanner.html?tab="+tab),type:"popup",width:460,height:720});
if(msg.text)chrome.storage.local.set({prefill:{tab,text:String(msg.text).slice(0,5000)}},go);else go()}});
