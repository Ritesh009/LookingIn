const COLORS = {
  'Google':    '#ff4e4e',
  'Meta':      '#4ea8ff',
  'TikTok':    '#ff6eb4',
  'Microsoft': '#00aaff',
  'Twitter/X': '#1d9bf0',
  'LinkedIn':  '#0a66c2',
  'Hotjar':    '#ffc107',
  'Amazon':    '#ff9900',
  'Criteo':    '#f45e30',
  'Oracle':    '#c74634',
  'Other':     '#7a8799',
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function dateRange(startDate) {
  const from = new Date(startDate);
  const to = new Date();
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(from)} – ${fmt(to)}`;
}

function render(stats) {
  document.getElementById('dateRange').textContent = dateRange(stats.startDate);
  const content = document.getElementById('content');

  if (stats.totalBlocked === 0) {
    content.innerHTML = `
      <div class="empty">
        <strong>No trackers detected yet</strong>
        Browse normally and LookingIn will start building your report.
      </div>`;
    return;
  }

  // Stats row
  let html = `
    <div class="stats">
      <div class="stat">
        <div class="stat-num">${stats.totalBlocked > 999 ? '999+' : stats.totalBlocked}</div>
        <div class="stat-label">Trackers detected</div>
      </div>
      <div class="stat">
        <div class="stat-num" style="color:var(--yellow)">${stats.sitesVisited}</div>
        <div class="stat-label">Sites visited</div>
      </div>
    </div>`;

  // Top trackers
  if (stats.trackers.length > 0) {
    html += `<div class="section-label">Top trackers</div>`;
    stats.trackers.slice(0, 5).forEach(t => {
      const color = COLORS[t.company] || COLORS['Other'];
      html += `
        <div class="tracker-row">
          <span class="t-dot" style="background:${color}"></span>
          <span class="t-name">${t.company}</span>
          <div class="t-meta">
            <div style="color:var(--text);font-weight:600;">${t.count}</div>
            <div>${t.sites} site${t.sites !== 1 ? 's' : ''}</div>
          </div>
        </div>`;
    });
  }

  // Recent activity
  if (stats.history.length > 0) {
    html += `<div class="section-label">Recent</div>`;
    stats.history.slice(0, 5).forEach(h => {
      html += `
        <div class="activity-row">
          <span class="a-company">${h.company}</span>
          <span class="a-page">${h.page}</span>
          <span class="a-time">${timeAgo(h.time)}</span>
        </div>`;
    });
  }

  content.innerHTML = html;
}

// Load stats on open
chrome.runtime.sendMessage({ type: 'GET_STATS' }, stats => {
  if (chrome.runtime.lastError || !stats) {
    document.getElementById('content').innerHTML =
      '<div class="empty"><strong>Starting up…</strong>Reload the extension and try again.</div>';
    return;
  }
  render(stats);
});

// Open full report
document.getElementById('reportBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('report/index.html') });
  window.close();
});

// Reset
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all tracking data?')) return;
  chrome.runtime.sendMessage({ type: 'RESET' }, () => {
    chrome.runtime.sendMessage({ type: 'GET_STATS' }, render);
  });
});
