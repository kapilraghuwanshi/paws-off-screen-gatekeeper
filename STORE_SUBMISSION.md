# Chrome Web Store Submission — PawsOff

Use this as the launch checklist and copy for the Developer Dashboard.

## 1. Before Upload

1. Test locally from `chrome://extensions` → **Load unpacked**.
2. Confirm the popup saves settings.
3. Set the timer to 1 minute and confirm the puppy slides in on a target site.
4. Zip the extension folder (manifest.json must be at ZIP root):

```bash
cd puppy-gatekeeper-extension
zip -r ../pawsoff-store.zip . -x "*.DS_Store" "docs/*"
```

## 2. Package Tab

Upload `pawsoff-store.zip`. Manifest fields:

- Name: `PawsOff`
- Version: `1.0.0`
- Description: `Spend too long on distracting sites? A real puppy takes over your screen. The cutest forced break.`

## 3. Store Listing Tab

**Category:** `Productivity` or `Well-being`

**Short description:**
```
A real puppy blocks distracting sites when your focus timer runs out. The cutest forced break.
```

**Detailed description:**
```
PawsOff helps you stop endless scrolling with the one force humans cannot resist: a puppy taking over the screen.

Choose distracting sites like X, Facebook, YouTube, Instagram, Reddit, TikTok, or any custom website. Pick how many minutes before the puppy appears, choose a break length, and browse normally. When your active time runs out, a giant puppy slides in, sits on the page, and keeps watch until the countdown ends.

Features:
- Custom target sites
- Adjustable usage timer (1-60 min)
- Adjustable break timer (1-10 min)
- Full-screen puppy break overlay with smooth walk-in animation
- Counts time only while a guarded tab is active and focused
- Local-only settings — nothing leaves your machine
- No ads, no accounts, no external tracking
- Open source on GitHub

This extension stores settings locally in Chrome. It does not collect, transmit, sell, or share your data.
```

## 4. Graphic Assets

- **Store icon:** `icons/icon128.png`
- **Screenshots:** 1280×800 preferred, showing:
  1. Popup settings panel
  2. Puppy overlay sliding in on a guarded site
  3. Puppy sitting with countdown visible
  4. Options page with site management
  5. Before/after comparison
- **Small promo tile:** 440×280 PNG
- **Marquee promo tile:** 1400×560 PNG (recommended)

## 5. Privacy Tab

**Single purpose:**
```
PawsOff helps users take forced breaks from user-selected distracting websites by showing a full-screen puppy countdown overlay after a configurable active-use timer expires.
```

**Permission justifications:**
```
storage: Stores the user's target sites, timer settings, and timer progress in Chrome local storage.

activeTab: Lets the popup read the active tab URL so users can add the current website to their guarded list.
```

**Host/content access:**
```
The extension runs a content script on webpages to show the puppy break overlay on user-selected target sites. It checks only the page hostname against the user's local target-site list. Page content is not collected, transmitted, sold, or shared.
```

**Remote code:** `No`

**Privacy policy:**
```
PawsOff does not collect, transmit, sell, or share personal data.

The extension stores your selected target websites, timer settings, and timer progress locally using Chrome storage. This information stays on your device and is used only to decide when to show the puppy break overlay.

No analytics, ads, accounts, external servers, or third-party data sharing are used.

Contact: kapilraghuwanshi@gmail.com
```

## 6. Distribution

- Visibility: `Public`
- Regions: All
- Pricing: Free
- In-app purchases: No

## 7. Test Instructions

```
1. Install the extension.
2. Open the popup and set "Minutes before the puppy appears" to 1.
3. Visit reddit.com or youtube.com (default guarded sites).
4. Keep the tab active for ~60 seconds.
5. Confirm the puppy overlay appears, slides in, shows countdown, and auto-dismisses.
6. Use "Reset timer" in the popup to test again.

No account, login, or payment required.
```

## 8. Submit

Click **Submit for Review**. Choose automatic or manual publishing.
