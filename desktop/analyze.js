const SafeScan=(()=>{
const RULES=[[/urgent|immediately|act now|final notice|expires? (today|soon)|within \d+ ?(hours|hrs)/i,"Urgent or time-pressure language",18],[/suspend|blocked|locked|terminated|legal action|arrest|penalty/i,"Threatening language",18],[/won|winner|prize|reward|lottery|gift ?card|free (gift|iphone)/i,"Fake reward or prize claim",20],[/\botp\b|one.?time password|verification code|\bpin\b|cvv/i,"Asks for OTP, PIN or code",25],[/bank|kyc|card number|net ?banking|account (number|verification)/i,"Banking details request",18],[/upi|wire|bitcoin|crypto|processing fee|transfer/i,"Payment request",15],[/(password|login|sign.?in|verify your).{0,40}(here|below|link)|confirm your (identity|account)/i,"Credential request",22],[/dear (customer|user|client)|kindly|revert back/i,"Generic or unusual wording",8],[/\b(paypal|amazon|apple|microsoft|netflix|hdfc|sbi|icici|fedex|dhl|irs|india post)\b/i,"Mentions a well-known brand (possible impersonation)",8]];
const URLRE=/https?:\/\/[^\s<>"')]+|\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl)\/\S+/gi;
const SHORT=/^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|cutt\.ly|rb\.gy|ow\.ly)$/i,TLD=/\.(zip|top|xyz|click|work|country|gq|tk|ml|cf|ga|icu|rest)$/i;
const BR="paypal|amazon|apple|microsoft|google|netflix|sbi|hdfc|icici";
const status=s=>s<30?"SAFE":s<60?"SUSPICIOUS":"PHISHING DETECTED";
const REC={"SAFE":"No major red flags, but never share OTPs or passwords, and only log in on sites you reached yourself.","SUSPICIOUS":"Don't click links, reply or enter details. Verify through an official channel.","PHISHING DETECTED":"Do not click, reply or share codes. Delete it and report it to your bank or provider."};
const out=(type,i,s,dest)=>{s=Math.min(100,Math.round(s));const st=status(s);return{type,score:s,status:st,indicators:i.length?i:["No common phishing indicators found"],recommendation:REC[st],destination:dest}};
function urlCore(raw){let u;try{u=new URL(/^[a-z]+:\/\//i.test(raw)?raw:"https://"+raw)}catch(e){throw new Error("Unable to analyze this URL. Please try again.")}
let s=0,i=[];const h=u.hostname;
if(u.protocol!=="https:"){s+=20;i.push("Not using HTTPS")}if(/^\d+\.\d+\.\d+\.\d+$/.test(h)){s+=35;i.push("Raw IP address instead of a domain")}
if(SHORT.test(h)){s+=25;i.push("Shortened URL hides the real destination")}if(h.split(".").length>4){s+=15;i.push("Excessive subdomains")}
if(/xn--/.test(h)){s+=25;i.push("Punycode look-alike domain")}if(TLD.test(h)){s+=15;i.push("Domain ending often abused for scams")}
if(/login|verify|secure|update|account|wallet|bank|confirm/i.test(h)){s+=18;i.push("Sensitive keywords in domain")}
if((h.match(/-/g)||[]).length>=3){s+=12;i.push("Many hyphens in domain")}if(/redirect=|url=|=https?:/i.test(u.search)){s+=12;i.push("Redirect parameter in URL")}
if(new RegExp(BR,"i").test(h)&&!new RegExp("(^|\\.)("+BR+")\\.(com|in|co\\.in|net|bank\\.in)$","i").test(h)){s+=25;i.push("Brand name on an unofficial domain")}
if(u.href.length>120){s+=8;i.push("Unusually long URL")}return{s,i,href:u.href,host:h}}
function textCore(t){let s=0,i=[];RULES.forEach(r=>{if(r[0].test(t)){s+=r[2];i.push(r[1])}});
(t.match(URLRE)||[]).forEach(u=>{try{const a=urlCore(u);if(a.s>=15){s+=a.s/2;i.push("Suspicious link: "+a.host)}}catch(e){}});return{s,i}}
const need=v=>{if(!String(v||"").trim())throw new Error("No content provided.")};
return{
status,
url(raw){need(raw);const a=urlCore(raw.trim());return out("Link",a.i,a.s,a.href)},
sms(t){need(t);const a=textCore(t);return out("SMS",a.i,a.s)},
email(f){if(!String(f.body||"").trim()&&!String(f.sender||"").trim())throw new Error("No content provided.");
const a=textCore((f.subject||"")+" "+(f.body||""));let s=a.s,i=a.i;const dom=e=>(String(e).split("@")[1]||"").trim().toLowerCase(),d=dom(f.sender);
if(f.sender&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.sender)){s+=15;i.push("Sender address looks malformed")}
if(f.replyTo&&dom(f.replyTo)&&dom(f.replyTo)!==d){s+=25;i.push("Reply-To domain differs from sender domain")}
if(d&&(TLD.test(d)||/-.*-/.test(d)||/(secure|verify|support|alert)/.test(d))){s+=15;i.push("Suspicious sender domain")}return out("Email",i,s)},
qr(c){need(c);const t=/^https?:\/\//i.test(c)?"URL":/^WIFI:/i.test(c)?"Wi-Fi":/^(BEGIN:VCARD|MECARD)/i.test(c)?"Contact":"Text";
let r;if(t==="URL"){const a=urlCore(c.trim());r=out("QR",a.i,a.s,a.href)}else{const a=textCore(c);r=out("QR",a.i,a.s,c.slice(0,200))}r.qrType=t;return r}
}})();
/* UPI check + shared exports (one analyzer for main process and all windows) */
(()=>{const HANDLES=/^(okaxis|okhdfcbank|okicici|oksbi|ybl|ibl|axl|paytm|ptyes|ptsbi|pthdfc|ptaxis|upi|apl|yapl|axisbank|hdfcbank|icici|sbi|kotak|federal|indus|aubank|idfcbank|pnb|barodampay|unionbank|cnrb|jupiteraxis|freecharge|airtel|jio|slc|abfspay|naviaxis|waaxis|wahdfcbank|wasbi|waicici)$/i;
const REC={"SAFE":"Looks like a normal payment request. Check the name and amount before you approve.","SUSPICIOUS":"Don't pay yet. Confirm the receiver through an official channel.","PHISHING DETECTED":"Do not pay or enter your UPI PIN. Scanning a QR never gives you money."};
SafeScan.upi=function(c){let p;try{p=new URL(c.replace(/^upi:\/\//i,"https://x/")).searchParams}catch(e){throw new Error("Unable to analyze this QR code.")}
let s=0,i=[];const pa=(p.get("pa")||"").trim(),pn=(p.get("pn")||"").trim(),am=p.get("am"),txt=((p.get("tn")||"")+" "+pn).toLowerCase();
if(!/^[\w.\-]{2,256}@[a-z][a-z0-9.]{1,64}$/i.test(pa)){s+=35;i.push("UPI ID format is invalid")}else if(!HANDLES.test(pa.split("@")[1])){s+=12;i.push("Unfamiliar bank handle: @"+pa.split("@")[1])}
if(!pn){s+=15;i.push("No merchant name in the QR")}
if(am&&Number(am)>0){s+=12;i.push("Amount is pre-filled (₹"+am+")")}
if(/collect/i.test(c)||/collect/i.test(p.get("mode")||"")){s+=25;i.push("This is a 'collect' request: money leaves your account")}
if(/cashback|reward|refund|prize|won|lottery|bonus|receive money/.test(txt)){s+=30;i.push("Cashback or reward wording (you never scan to receive money)")}
s=Math.min(100,Math.round(s));const st=SafeScan.status(s);
return{type:"QR",qrType:"UPI",score:s,status:st,indicators:i.length?i:["No common UPI scam indicators found"],recommendation:REC[st],destination:(pn?pn+" · ":"")+pa+(am?" · ₹"+am:"")}};
const qr0=SafeScan.qr;SafeScan.qr=c=>/^upi:\/\//i.test(String(c||"").trim())?SafeScan.upi(String(c).trim()):qr0(c);
SafeScan.analyzeSMS=t=>SafeScan.sms(t);SafeScan.analyzeURL=u=>SafeScan.url(u);SafeScan.analyzeEmail=f=>SafeScan.email(f);SafeScan.analyzeQR=c=>SafeScan.qr(c);})();
if(typeof module!=="undefined"&&module.exports)module.exports=SafeScan;
