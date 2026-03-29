var R="https://ritesh009.github.io/LookingIn/";
chrome.runtime.sendMessage({t:"get"},function(s){
  if(chrome.runtime.lastError||!s){document.getElementById("num").textContent="?";return;}
  var n=document.getElementById("num"),si=document.getElementById("sites"),
      pu=document.getElementById("pulse"),em=document.getElementById("empty"),
      su=document.getElementById("sub");
  if(!s.n){n.textContent="0";n.className="num zero";return;}
  em.style.display="none";pu.style.display="inline-flex";su.style.display="block";
  n.className="num";si.textContent=s.s;
  var c=0,step=Math.max(1,Math.floor(s.n/30)),
      t=setInterval(function(){c=Math.min(c+step,s.n);n.textContent=c;if(c>=s.n)clearInterval(t);},20);
  document.getElementById("report").onclick=function(){
    chrome.tabs.create({url:R+"#data="+btoa(JSON.stringify({totalBlocked:s.n,sitesVisited:s.s,startDate:s.ts,trackers:s.list,history:s.h,source:"extension"}))});
    window.close();
  };
});
document.getElementById("reset").onclick=function(){
  if(!confirm("Reset all data?"))return;
  chrome.runtime.sendMessage({t:"reset"},function(){location.reload();});
};
