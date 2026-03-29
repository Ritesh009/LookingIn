var TRACKERS = {
‘google-analytics.com’: ‘Google’,
‘googletagmanager.com’: ‘Google’,
‘doubleclick.net’: ‘Google’,
‘googlesyndication.com’: ‘Google’,
‘googleadservices.com’: ‘Google’,
‘ssl.google-analytics.com’: ‘Google’,
‘facebook.com’: ‘Meta’,
‘facebook.net’: ‘Meta’,
‘connect.facebook.net’: ‘Meta’,
‘analytics.tiktok.com’: ‘TikTok’,
‘ads.tiktok.com’: ‘TikTok’,
‘clarity.ms’: ‘Microsoft’,
‘bat.bing.com’: ‘Microsoft’,
‘platform.twitter.com’: ‘Twitter/X’,
‘ads-twitter.com’: ‘Twitter/X’,
‘linkedin.com’: ‘LinkedIn’,
‘snap.licdn.com’: ‘LinkedIn’,
‘hotjar.com’: ‘Hotjar’,
‘static.hotjar.com’: ‘Hotjar’,
‘amazon-adsystem.com’: ‘Amazon’,
‘criteo.com’: ‘Criteo’,
‘criteo.net’: ‘Criteo’,
‘bluekai.com’: ‘Oracle’,
‘addthis.com’: ‘Oracle’,
‘outbrain.com’: ‘Outbrain’,
‘taboola.com’: ‘Taboola’,
‘quantserve.com’: ‘Quantcast’,
‘mixpanel.com’: ‘Other’,
‘segment.io’: ‘Other’,
‘segment.com’: ‘Other’,
‘amplitude.com’: ‘Other’,
‘fullstory.com’: ‘Other’,
‘newrelic.com’: ‘Other’,
‘nr-data.net’: ‘Other’
};

function getCompany(url) {
try {
var host = new URL(url).hostname.replace(/^www./, ‘’);
if (TRACKERS[host]) return TRACKERS[host];
var keys = Object.keys(TRACKERS);
for (var i = 0; i < keys.length; i++) {
if (host === keys[i] || host.endsWith(’.’ + keys[i])) {
return TRACKERS[keys[i]];
}
}
} catch(e) {}
return null;
}

chrome.webRequest.onBeforeRequest.addListener(
function(details) {
var company = getCompany(details.url);
if (!company) return;

```
var pageHost = '';
try {
  pageHost = new URL(details.initiator || details.documentUrl || '').hostname;
} catch(e) {}
if (!pageHost) return;

var trackerHost = '';
try { trackerHost = new URL(details.url).hostname; } catch(e) {}
if (pageHost === trackerHost) return;

chrome.storage.local.get('li_data', function(result) {
  var data = result.li_data || {
    trackers: {},
    total: 0,
    sites: {},
    history: [],
    start: Date.now()
  };

  if (!data.trackers[company]) {
    data.trackers[company] = { count: 0, sites: [] };
  }
  data.trackers[company].count++;
  if (data.trackers[company].sites.indexOf(pageHost) === -1) {
    data.trackers[company].sites.push(pageHost);
  }

  data.total++;
  data.sites[pageHost] = (data.sites[pageHost] || 0) + 1;

  data.history.unshift({
    company: company,
    page: pageHost,
    time: Date.now()
  });
  if (data.history.length > 100) data.history.pop();

  chrome.storage.local.set({ li_data: data });

  var badge = data.total > 99 ? '99+' : String(data.total);
  chrome.action.setBadgeText({ text: badge });
  chrome.action.setBadgeBackgroundColor({ color: '#ff4e4e' });
});
```

},
{ urls: [’<all_urls>’] }
);

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
if (msg.type === ‘GET’) {
chrome.storage.local.get(‘li_data’, function(result) {
var data = result.li_data || { trackers: {}, total: 0, sites: {}, history: [], start: Date.now() };
var list = [];
var keys = Object.keys(data.trackers);
for (var i = 0; i < keys.length; i++) {
list.push({
company: keys[i],
count: data.trackers[keys[i]].count,
sites: data.trackers[keys[i]].sites.length
});
}
list.sort(function(a, b) { return b.count - a.count; });
sendResponse({
total: data.total,
sites: Object.keys(data.sites).length,
trackers: list,
history: data.history.slice(0, 10),
start: data.start
});
});
return true;
}

if (msg.type === ‘RESET’) {
chrome.storage.local.remove(‘li_data’, function() {
chrome.action.setBadgeText({ text: ‘’ });
sendResponse({ ok: true });
});
return true;
}
});