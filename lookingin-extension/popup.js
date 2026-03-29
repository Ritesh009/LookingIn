const COLORS = {
‘Google’:    ‘#ff4e4e’,
‘Meta’:      ‘#4ea8ff’,
‘TikTok’:    ‘#ff6eb4’,
‘Microsoft’: ‘#00aaff’,
‘Twitter/X’: ‘#1d9bf0’,
‘LinkedIn’:  ‘#0a66c2’,
‘Hotjar’:    ‘#ffc107’,
‘Amazon’:    ‘#ff9900’,
‘Criteo’:    ‘#f45e30’,
‘Oracle’:    ‘#c74634’,
‘Other’:     ‘#7a8799’,
};

const REPORT_URL = ‘https://ritesh009.github.io/LookingIn/’;

function timeAgo(ts) {
const diff = Math.floor((Date.now() - ts) / 1000);
if (diff < 60)    return `${diff}s ago`;
if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
return `${Math.floor(diff / 86400)}d ago`;
}

function dateRange(startDate) {
const fmt = d => new Date(d).toLocaleDateString(‘en-US’, { month: ‘short’, day: ‘numeric’ });
return `${fmt(startDate)} – ${fmt(Date.now())}`;
}

// Animate a number counting up
function animateCount(el, target, duration = 600) {
if (target === 0) { el.textContent = ‘0’; return; }
let start = 0;
const step = target / (duration / 16);
const t = setInterval(() => {
start = Math.min(start + step, target);
el.textContent = target > 999 ? ‘999+’ : Math.floor(start);
if (start >= target) clearInterval(t);
}, 16);
}

function render(stats) {
// Date range
document.getElementById(‘dateRange’).textContent = dateRange(stats.startDate);

const hitEl    = document.getElementById(‘hitNum’);
const sitesEl  = document.getElementById(‘sitesNum’);
const content  = document.getElementById(‘content’);

if (stats.totalBlocked === 0) {
hitEl.textContent = ‘0’;
document.getElementById(‘hitLabel’).textContent = ‘trackers detected’;
document.getElementById(‘hitSub’).style.display = ‘none’;
content.innerHTML = ` <div class="empty"> <div class="empty-icon">👁</div> <div class="empty-title">LookingIn is watching</div> <div class="empty-body">Browse normally — trackers will show up here in real time as you visit sites.</div> </div>`;
return;
}

// Animate the big number
animateCount(hitEl, stats.totalBlocked);
sitesEl.textContent = stats.sitesVisited;

let html = ‘’;

// Top trackers with bars
if (stats.trackers.length > 0) {
const maxCount = stats.trackers[0].count;
html += `<div class="section-label">Who's watching</div>`;
stats.trackers.slice(0, 5).forEach((t, i) => {
const color = COLORS[t.company] || COLORS[‘Other’];
const pct = Math.round((t.count / maxCount) * 100);
html += ` <div class="tracker-row"> <span class="t-dot" style="background:${color}"></span> <span class="t-name">${t.company}</span> <div class="t-bar-wrap"> <div class="t-bar-track"> <div class="t-bar-fill" id="bar${i}" style="width:0%;background:${color}"></div> </div> <div class="t-count">${t.count} × · ${t.sites} site${t.sites !== 1 ? 's' : ''}</div> </div> </div>`;
});
}

// Recent detections
if (stats.history.length > 0) {
html += `<div class="divider"></div><div class="section-label">Just now</div>`;
stats.history.slice(0, 4).forEach(h => {
html += ` <div class="recent-row"> <span class="r-company">${h.company}</span> <span class="r-page">${h.page}</span> <span class="r-time">${timeAgo(h.time)}</span> </div>`;
});
}

content.innerHTML = html;

// Animate bars after render
requestAnimationFrame(() => {
const maxCount = stats.trackers[0]?.count || 1;
stats.trackers.slice(0, 5).forEach((t, i) => {
const bar = document.getElementById(`bar${i}`);
if (bar) setTimeout(() => {
bar.style.width = Math.round((t.count / maxCount) * 100) + ‘%’;
}, i * 60);
});
});

// Current page tracker count
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
if (!tabs[0]?.url) return;
try {
const host = new URL(tabs[0].url).hostname;
const pageCount = stats.history.filter(h => h.page === host).length;
if (pageCount > 0) {
const banner = document.getElementById(‘pageBanner’);
document.getElementById(‘pageTrackerCount’).textContent = pageCount;
document.getElementById(‘pageTrackerPlural’).textContent = pageCount !== 1 ? ‘s’ : ‘’;
banner.classList.add(‘show’);
}
} catch {}
});
}

// ── Data bridge: pass real data to GitHub Pages report ──────────────────────
// We encode the stats into the URL hash so the report page can read them
// without needing a server or shared storage

function buildReportURL(stats) {
try {
const payload = {
totalBlocked: stats.totalBlocked,
sitesVisited: stats.sitesVisited,
startDate: stats.startDate,
trackers: stats.trackers.slice(0, 20), // top 20
history: stats.history.slice(0, 50),
source: ‘extension’,
generated: Date.now(),
};
const encoded = btoa(JSON.stringify(payload));
return `${REPORT_URL}#data=${encoded}`;
} catch {
return REPORT_URL;
}
}

// ── Load ─────────────────────────────────────────────────────────────────────

chrome.runtime.sendMessage({ type: ‘GET_STATS’ }, stats => {
if (chrome.runtime.lastError || !stats) {
document.getElementById(‘hitNum’).textContent = ‘?’;
document.getElementById(‘content’).innerHTML =
‘<div class="empty"><div class="empty-title">Starting up…</div><div class="empty-body">Reload the extension and try again.</div></div>’;
return;
}
render(stats);

// Wire report button with live data URL
document.getElementById(‘reportBtn’).addEventListener(‘click’, () => {
chrome.tabs.create({ url: buildReportURL(stats) });
window.close();
});
});

// ── Reset ─────────────────────────────────────────────────────────────────────

document.getElementById(‘resetBtn’).addEventListener(‘click’, () => {
if (!confirm(‘Reset all tracking data?’)) return;
chrome.runtime.sendMessage({ type: ‘RESET’ }, () => {
chrome.runtime.sendMessage({ type: ‘GET_STATS’ }, render);
});
});