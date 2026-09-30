chrome.runtime.onMessage.addListener((m,sender)=>{
  if(m.type!=="page"||!sender.tab) return;
  const bad=m.score<40, mid=m.score<70;
  chrome.action.setBadgeText({tabId:sender.tab.id,text:bad?"!":mid?"?":""});
  chrome.action.setBadgeBackgroundColor({tabId:sender.tab.id,color:bad?"#dc2626":"#d97706"});
});
