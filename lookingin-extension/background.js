// LookingIn background.js v1.2
var T = {};
T[“google-analytics.com”] = “Google”;
T[“googletagmanager.com”] = “Google”;
T[“doubleclick.net”] = “Google”;
T[“googlesyndication.com”] = “Google”;
T[“googleadservices.com”] = “Google”;
T[“ssl.google-analytics.com”] = “Google”;
T[“facebook.com”] = “Meta”;
T[“facebook.net”] = “Meta”;
T[“connect.facebook.net”] = “Meta”;
T[“analytics.tiktok.com”] = “TikTok”;
T[“ads.tiktok.com”] = “TikTok”;
T[“clarity.ms”] = “Microsoft”;
T[“bat.bing.com”] = “Microsoft”;
T[“platform.twitter.com”] = “Twitter/X”;
T[“ads-twitter.com”] = “Twitter/X”;
T[“linkedin.com”] = “LinkedIn”;
T[“snap.licdn.com”] = “LinkedIn”;
T[“hotjar.com”] = “Hotjar”;
T[“static.hotjar.com”] = “Hotjar”;
T[“amazon-adsystem.com”] = “Amazon”;
T[“criteo.com”] = “Criteo”;
T[“mixpanel.com”] = “Other”;
T[“segment.io”] = “Other”;
T[“amplitude.com”] = “Other”;
T[“fullstory.com”] = “Other”;
T[“newrelic.com”] = “Other”;

function getCompany(url) {
try {
var host = new URL(url).hostname.replace(/^www./, “”);
if (T[host]) return T[host];
var keys = Object.keys(T);
for (var i = 0; i < keys.length; i++) {
if (host === keys[i] || host.endsWith(”.” + keys[i])) return T[keys[i]];
}
} catch(e) {}
return null;
}

chrome.webRequest.onBeforeRequest.addListener(
function(details) {
var company = getCompany(details.url);
if (!company) return;
var pageHost = “”;
try { pageHost = new URL(details.initiator || details.documentUrl || “”).hostname; } catch(e) {}
if (!pageHost) return;
var trackerHost = “”;
try { trackerHost = new URL(details.url).hostname; } catch(e) {}
if (pageHost === trackerHost) return;

```
chrome.storage.local.get("li_data", function(result) {
  var data = result.li_data || { trackers: {}, total: 0, sites: {}, history: [], start: Date.now() };
  if (!data.trackers[company]) data.trackers[company] = { count: 0, sites: [] };
  data.trackers[company].count++;
  if (data.trackers[company].sites.indexOf(pageHost) === -1) data.trackers[company].sites.push(pageHost);
  data.total++;
  data.sites[pageHost] = (data.sites[pageHost] || 0) + 1;
  data.history.unshift({ company: company, page: pageHost, time: Date.now() });
  if (data.history.length > 100) data.history.pop();
  chrome.storage.local.set({ li_data: data });
  chrome.action.setBadgeText({ text: data.total > 99 ? "99+" : String(data.total) });
  chrome.action.setBadgeBackgroundColor({ color: "#ff4e4e" });
});
```

},
{ urls: [”<all_urls>”] }
);

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
if (msg.type === “GET”) {
chrome.storage.local.get(“li_data”, function(result) {
var data = result.li_data || { trackers: {}, total: 0, sites: {}, history: [], start: Date.now() };
var list = [];
var keys = Object.keys(data.trackers);
for (var i = 0; i < keys.length; i++) {
list.push({ company: keys[i], count: data.trackers[keys[i]].count, sites: data.trackers[keys[i]].sites.length });
}
list.sort(function(a, b) { return b.count - a.count; });
sendResponse({ total: data.total, sites: Object.keys(data.sites).length, trackers: list, history: data.history.slice(0, 10), start: data.start });
});
return true;
}
if (msg.type === “RESET”) {
chrome.storage.local.remove(“li_data”, function() {
chrome.action.setBadgeText({ text: “” });
sendResponse({ ok: true });
});
return true;
}
});