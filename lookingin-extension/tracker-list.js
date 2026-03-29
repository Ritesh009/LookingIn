// Known tracker domains — sourced from EasyPrivacy & open tracker lists
// Organised by company so we can show human-readable names in the report

export const TRACKER_COMPANIES = {
  'Google': [
    'google-analytics.com',
    'googletagmanager.com',
    'googletagservices.com',
    'doubleclick.net',
    'googlesyndication.com',
    'google.com/ads',
    'googleadservices.com',
    'googleapis.com',
    'gstatic.com',
    'google-analytics.com',
    'urchin.com',
    'ssl.google-analytics.com',
  ],
  'Meta': [
    'facebook.com',
    'facebook.net',
    'connect.facebook.net',
    'instagram.com',
    'graph.facebook.com',
    'an.facebook.com',
    'pixel.facebook.com',
  ],
  'TikTok': [
    'analytics.tiktok.com',
    'ads.tiktok.com',
    'tiktok.com',
    'byteoversea.com',
    'ibytedtos.com',
    'ipstatp.com',
    'muscdn.com',
    'tiktokv.com',
  ],
  'Microsoft': [
    'clarity.ms',
    'bat.bing.com',
    'ads.microsoft.com',
    'c.bing.com',
    'a.bing.com',
    'msn.com',
    'scorecardresearch.com',
  ],
  'Twitter/X': [
    'platform.twitter.com',
    'ads-twitter.com',
    'analytics.twitter.com',
    't.co',
    'syndication.twitter.com',
  ],
  'LinkedIn': [
    'linkedin.com',
    'licdn.com',
    'snap.licdn.com',
    'dc.ads.linkedin.com',
  ],
  'Hotjar': [
    'hotjar.com',
    'static.hotjar.com',
    'vars.hotjar.com',
    'script.hotjar.com',
  ],
  'Amazon': [
    'amazon-adsystem.com',
    'fls-na.amazon.com',
    'images-na.ssl-images-amazon.com',
    'aax-us-east.amazon-adsystem.com',
  ],
  'Criteo': [
    'criteo.com',
    'criteo.net',
    'emailretargeting.com',
    'hlserve.com',
    'inventoryplanner.com',
  ],
  'TradeDesk': [
    'adsrvr.org',
    'casalemedia.com',
    'rubiconproject.com',
    'openx.net',
    'openx.com',
  ],
  'Oracle': [
    'bluekai.com',
    'bkrtx.com',
    'addthis.com',
    'addthisedge.com',
    'eloqua.com',
  ],
  'Outbrain': [
    'outbrain.com',
    'zemanta.com',
    'outbrainimg.com',
  ],
  'Taboola': [
    'taboola.com',
    'taboolasyndication.com',
    'taboolasyndication.com',
  ],
  'Quantcast': [
    'quantserve.com',
    'quantcount.com',
    'choice.quantcast.com',
  ],
  'Nielsen': [
    'scorecardresearch.com',
    'imrworldwide.com',
    'imrdata.com',
  ],
  'Other': [
    'adnxs.com',
    'pubmatic.com',
    'AppNexus',
    'moatads.com',
    'nr-data.net',
    'newrelic.com',
    'mixpanel.com',
    'segment.io',
    'segment.com',
    'amplitude.com',
    'intercom.io',
    'intercomcdn.com',
    'fullstory.com',
    'logrocket.com',
    'mouseflow.com',
    'crazyegg.com',
    'optimizely.com',
    'moengage.com',
    'braze.com',
    'klaviyo.com',
  ]
};

// Flat lookup map: domain → company name
export const TRACKER_MAP = {};
for (const [company, domains] of Object.entries(TRACKER_COMPANIES)) {
  for (const domain of domains) {
    TRACKER_MAP[domain] = company;
  }
}

// Check if a URL belongs to a known tracker
// Returns company name or null
export function matchTracker(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    // Exact match
    if (TRACKER_MAP[host]) return TRACKER_MAP[host];
    // Subdomain match — check if host ends with any known tracker domain
    for (const domain of Object.keys(TRACKER_MAP)) {
      if (host.endsWith('.' + domain) || host === domain) {
        return TRACKER_MAP[domain];
      }
    }
    return null;
  } catch {
    return null;
  }
}
