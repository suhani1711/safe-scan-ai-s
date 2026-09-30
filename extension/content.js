document.addEventListener("click",(e)=>{
  const a=e.target.closest&&e.target.closest("a[href]"); if(!a) return;
  const href=a.href; if(!/^https?:/.test(href)||new URL(href).hostname===location.hostname) return;
  const {score,reasons}=safescanScore(href);
  if(score<40 && !confirm("🛡️ SafeScan AI warning\n\nThis link looks DANGEROUS ("+score+"/100):\n• "+reasons.join("\n• ")+"\n\n"+href+"\n\nOpen it anyway?")){e.preventDefault();e.stopPropagation();}
},true);
chrome.runtime.sendMessage({type:"page",score:safescanScore(location.href).score});
