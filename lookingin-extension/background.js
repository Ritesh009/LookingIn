import { matchTracker } from './tracker-list.js';

// ── Storage helpers ──────────────────────────────────────────────────────────

async function getStore() {
  const result = await chrome.storage.local.get('lookingin');
  return result.lookingin || {
    trackers: {},      // { company: { count, sites: Set, lastSeen } }
    totalBlocked: 0,
    sitesVisited: {},  // { hostname: count }
    startDate: Date.now(),
    history: [],       // last 100 detections for the report
  };
}

async function saveStore(store) {
  // Sets aren't JSON serialisable — convert before saving
  const serialisable = {
    ...store,
    trackers: Object.fromEntries(
      Object.entries(store.trackers).map(([k, v]) => [
        k,
        { ...v, sites: Array.from(v.sites || []) }
      ])
    )
  };
  await chrome.storage.local.set({ lookingin: serialisable });
}

async function loadStore() {
  const store = await getStore();
  // Rehydrate sites Sets
  for (const [company, data] of Object.entries(store.trackers)) {
    data.sites = new Set(Array.isArray(data.sites) ? data.sites : []);
  }
  return store;
}

// ── Request interception ─────────────────────────────────────────────────────

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const company = matchTracker(details.url);
    if (!company) return;

    // Get the originating page hostname
    let pageHost = 'unknown';
    try {
      if (details.initiator) {
        pageHost = new URL(details.initiator).hostname;
      } else if (details.documentUrl) {
        pageHost = new URL(details.documentUrl).hostname;
      }
    } catch {}

    // Skip if the tracker is the same as the page (first-party)
    const trackerHost = new URL(details.url).hostname;
    if (pageHost === trackerHost || pageHost === 'unknown') return;

    const store = await loadStore();

    // Update tracker entry
    if (!store.trackers[company]) {
      store.trackers[company] = { count: 0, sites: new Set(), lastSeen: null };
    }
    store.trackers[company].count++;
    store.trackers[company].sites.add(pageHost);
    store.trackers[company].lastSeen = Date.now();

    // Update totals
    store.totalBlocked++;
    store.sitesVisited[pageHost] = (store.sitesVisited[pageHost] || 0) + 1;

    // Append to history (keep last 200)
    store.history.unshift({
      company,
      tracker: new URL(details.url).hostname,
      page: pageHost,
      time: Date.now(),
    });
    if (store.history.length > 200) store.history.length = 200;

    await saveStore(store);

    // Update badge
    chrome.action.setBadgeText({ text: store.totalBlocked > 99 ? '99+' : String(store.totalBlocked) });
    chrome.action.setBadgeBackgroundColor({ color: '#ff4e4e' });
  },
  { urls: ['<all_urls>'] },
  []
);

// ── Reset on browser startup ─────────────────────────────────────────────────
// Keep a 30-day rolling window

chrome.runtime.onStartup.addListener(async () => {
  const store = await loadStore();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - store.startDate > thirtyDays) {
    await chrome.storage.local.set({
      lookingin: {
        trackers: {},
        totalBlocked: 0,
        sitesVisited: {},
        startDate: Date.now(),
        history: [],
      }
    });
    chrome.action.setBadgeText({ text: '' });
  }
});

// ── Message handler (popup asks for data) ───────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_STATS') {
    loadStore().then(store => {
      const trackerList = Object.entries(store.trackers)
        .map(([company, data]) => ({
          company,
          count: data.count,
          sites: data.sites.size,
          lastSeen: data.lastSeen,
        }))
        .sort((a, b) => b.count - a.count);

      sendResponse({
        totalBlocked: store.totalBlocked,
        sitesVisited: Object.keys(store.sitesVisited).length,
        trackers: trackerList,
        history: store.history.slice(0, 10),
        startDate: store.startDate,
      });
    });
    return true; // keep channel open for async
  }

  if (msg.type === 'RESET') {
    chrome.storage.local.set({
      lookingin: {
        trackers: {},
        totalBlocked: 0,
        sitesVisited: {},
        startDate: Date.now(),
        history: [],
      }
    }).then(() => {
      chrome.action.setBadgeText({ text: '' });
      sendResponse({ ok: true });
    });
    return true;
  }
});
