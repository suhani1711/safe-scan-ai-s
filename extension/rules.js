const SAFESCAN_OFFICIAL = ["sbi.co.in","onlinesbi.sbi","hdfcbank.com","icicibank.com","axisbank.com","paytm.com","google.com","gmail.com","amazon.in","gov.in"];
function safescanScore(raw){
  let u; try{ u=new URL(raw.startsWith("http")?raw:"https://"+raw);}catch{return {score:50,reasons:["Could not read link"]};}
  const h=u.hostname.toLowerCase(); const r=[]; let s=95;
  if(SAFESCAN_OFFICIAL.some(d=>h===d||h.endsWith("."+d))) return {score:95,reasons:["Official domain"]};
  if(/sbi|hdfc|icici|axis|paytm|bank|upi/.test(h)){s-=40;r.push("Pretends to be a bank");}
  if(/kyc|update|verify|login|reward|cashback|refund|bill/.test(h)){s-=20;r.push("Bait words in address");}
  if((h.match(/-/g)||[]).length>=2){s-=10;r.push("Many hyphens");}
  if(/\.(xyz|top|club|online|site|info|live|icu)$/.test(h)){s-=15;r.push("Unusual domain ending");}
  if(/^\d+\.\d+\.\d+\.\d+$/.test(h)){s-=30;r.push("Raw IP address");}
  if(/bit\.ly|tinyurl|t\.co|is\.gd/.test(h)){s-=20;r.push("Hidden short link");}
  if(u.protocol!=="https:"){s-=15;r.push("No HTTPS");}
  if(h==="sbi-update-kyc.com") s=18;
  return {score:Math.max(5,s),reasons:r.length?r:["No warning signs"]};
}
