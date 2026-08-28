# Chrome Web Store Listing — PawsOff

> Last Updated: 2026-08-27

## Store Listing

**Extension Name** [REQUIRED]
PawsOff

**Short Description** [REQUIRED]
Spend too long on distracting sites? A real puppy takes over your screen. The cutest forced break.

**Detailed Description** [REQUIRED]
PawsOff is the cutest way to manage your screen time and take forced breaks when you've been doom-scrolling for too long.

Key Features:
- Pick the websites you want to guard (like X, YouTube, Reddit, Instagram).
- Set a custom usage limit (e.g., 30 minutes).
- When your time is up, a cute puppy will walk onto your screen and politely occupy the page.
- The screen locks until your designated break time (e.g., 5 minutes) is over, encouraging you to stretch, blink, and sip some water.

How to use it:
1. Click the PawsOff extension icon to open your settings.
2. Check the boxes for the sites you want to monitor, or add custom ones.
3. Set your usage limit and your puppy break duration.
4. Browse normally! If you hit your limit, a puppy will take over the screen.

Privacy Note:
PawsOff is fully local. It does not track your browsing history or send any data to external servers. All site limits and timers are stored securely on your own device.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Locks distracting websites after a set time limit by displaying a full-screen puppy animation to enforce a break.

**Primary Language** [REQUIRED]
English


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | `promo/screenshot-1.png` |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | `promo/screenshot-2.png` |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | `promo/small-tile.png` |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | `promo/marquee.png` |

### Screenshot Notes
- **Screenshot 1**: Show the PawsOff settings popup with some sites checked.
- **Screenshot 2**: Show a real website (like YouTube) with the Puppy overlay actively blocking the screen.


## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Used to securely save the user's custom site list, time limits, and active timers locally on their device. |
| `activeTab` | permissions | Used to interact with the currently active tab if the user triggers a manual puppy break from the extension icon. |
| `http://*/*`, `https://*/*` | content_scripts matches | Needed to inject the puppy overlay and monitor time spent on the specific websites the user explicitly chose to guard in their settings. |


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

*PawsOff operates entirely locally. No user data, analytics, or browsing history is collected or transmitted off-device.*

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL** [RECOMMENDED]
*(Since PawsOff collects no data, you can host a simple text file on GitHub Pages or Notion stating that "PawsOff does not collect, store, or transmit any personal data or browsing history. All settings are saved locally on your device.")*


## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free


## Developer Info

**Publisher Name** [REQUIRED]
Tech Monk - Kapil

**Contact Email** [REQUIRED]
*(Fill this out in the dashboard)*


## Pre-Publishing Checklist

1. **ZIP the Extension**: 
   Compress all files in your folder (`assets/`, `icons/`, `background.js`, `content.js`, `content.css`, `options.html`, `options.js`, `options.css`, `manifest.json`). 
   *Note: Do NOT include `test-overlay.html`, `.git`, or this `CHROMEWEBSTORE.md` file in the ZIP.*
2. **Take Screenshots**: Capture at least one 1280x800 screenshot showing the app in action.
3. **Go to Dashboard**: Visit the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
4. **Pay Developer Fee**: If this is your first extension, there is a one-time $5 registration fee.
5. **Upload ZIP**: Click "New Item", upload your ZIP, and copy-paste the details from this document into the Store Listing and Privacy tabs.
6. **Submit for Review**: Click "Submit for Review". Approvals usually take 1-3 days.
