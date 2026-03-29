# LookingIn

> *Show users what's happening to their data the moment they open a browser — and give them the power to stop it.*

LookingIn is a privacy tool built for everyone, not just developers. It tells the story of who is tracking you, why it matters, and exactly what to do about it.

---

## Philosophy

**Impact drives the story.** If you don't know who is tracking you, you'd never ask why — and you'd never ask how to stop it. So we start with the number. Everything else follows.

Every feature serves one of three goals:

- **Awareness** — show what's happening, in plain language
- **Context** — explain why it matters, not just that it happens
- **Action** — give exact steps, not vague advice

---

## The Report (`index.html`)

A single scrolling narrative — five chapters that each earn the next:

1. **Impact** — one number, full screen. Let it land.
2. **Who** — the companies behind the trackers, named not domained
3. **Why** — what they actually do with your data
4. **Act** — five steps ranked by impact, browser detour built into step 1
5. **About** — the origin, the irony, the commitments

### Install as PWA

Works on Android and iPhone — no app store needed:

- **Android Chrome** — visit the URL, tap the install banner
- **iPhone Safari** — tap Share → Add to Home Screen

### Host on GitHub Pages

1. Rename `lookingin.html` to `index.html`
2. Push to a GitHub repository
3. **Settings → Pages → Deploy from branch → main**
4. Live at `https://yourusername.github.io/repo-name`

---

## The Extension (`lookingin-extension/`)

Runs silently in the background. Every time a website calls a known tracker, LookingIn catches it, logs the company, and feeds real data into your report.

### Install (no app store needed)

**Chrome / Brave / Edge**
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `lookingin-extension/` folder
4. CCTV icon appears in your toolbar

**Firefox**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** → select `manifest.json`
3. Note: temporary — removed on restart. For permanent install, sign via [addons.mozilla.org](https://addons.mozilla.org)

### Permissions explained

| Permission | Why |
|---|---|
| `webRequest` | Intercept network requests to detect trackers |
| `storage` | Save data locally on your device |
| `tabs` | Know which site a tracker came from |
| `<all_urls>` | Monitor requests on all websites |

---

## Repository Structure

```
lookingin/
├── index.html                  — report page (PWA)
├── manifest.json               — PWA manifest
├── sw.js                       — service worker (offline)
├── icon-192.png / icon-512.png — PWA icons
├── favicon.png                 — browser tab icon
├── README.md                   — this file
└── lookingin-extension/
    ├── manifest.json           — extension config
    ├── background.js           — request interceptor + storage
    ├── tracker-list.js         — 100+ known tracker domains
    ├── popup.html / popup.js   — toolbar popup with quick stats
    ├── report/index.html       — full report reading real data
    └── icons/                  — 16, 32, 48, 128px icons
```

---

## Tech

- Plain HTML, CSS, JavaScript — no frameworks, no dependencies
- System fonts only — zero external requests
- IntersectionObserver for scroll animations
- `chrome.storage.local` for extension data — never leaves your device

## Privacy

LookingIn collects zero data. Everything runs locally.
Verify it: DevTools → Network → watch zero requests go out.
