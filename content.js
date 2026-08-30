(() => {
  const SETTINGS_KEY = "pawsOffSettings";
  const USAGE_KEY = "pawsOffUsage";
  const DEFAULT_SETTINGS = {
    enabled: true,
    usageLimitMinutes: 2,
    breakMinutes: 2,
    sites: [
      "x.com",
      "twitter.com",
      "facebook.com",
      "instagram.com",
      "youtube.com",
      "reddit.com",
      "tiktok.com",
      "linkedin.com"
    ]
  };

  const chromeApi = globalThis.chrome;
  const breeds = ["husky", "labrador"];
  const host = normalizeHost(location.hostname);
  let settings = DEFAULT_SETTINGS;
  let usage = {};
  let matchedSite = "";
  let lastTick = Date.now();
  let lastFlush = 0;
  let overlay = null;
  let countdownNode = null;

  init();

  async function init() {
    const data = await chromeApi.storage.local.get([SETTINGS_KEY, USAGE_KEY]);
    settings = { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] || {}) };
    usage = data[USAGE_KEY] || {};
    matchedSite = getMatchedSite(host, settings.sites);
    ensureSiteState();
    chromeApi.storage.onChanged.addListener(handleStorageChange);
    chromeApi.runtime.onMessage.addListener((message) => {
      if (message?.type === "PAWSOFF_DISMISS") {
        removeOverlay();
        if (matchedSite && usage[matchedSite]) {
          usage[matchedSite].usedMs = 0;
          usage[matchedSite].breakUntil = 0;
        }
      }
    });
    window.addEventListener("pagehide", flushUsage);
    document.addEventListener("visibilitychange", () => {
      lastTick = Date.now();
    });
    setInterval(tick, 1000);
    tick();
  }

  function handleStorageChange(changes, areaName) {
    if (areaName !== "local") return;
    if (changes[SETTINGS_KEY]) {
      settings = { ...DEFAULT_SETTINGS, ...(changes[SETTINGS_KEY].newValue || {}) };
      matchedSite = getMatchedSite(host, settings.sites);
      lastTick = Date.now();
      if (!settings.enabled || !matchedSite) removeOverlay();
    }
    if (changes[USAGE_KEY]) {
      usage = changes[USAGE_KEY].newValue || {};
      ensureSiteState();
    }
  }

  function tick() {
    if (!settings.enabled || !matchedSite) return;
    ensureSiteState();

    const now = Date.now();
    const state = usage[matchedSite];
    const breakUntil = Number(state.breakUntil || 0);

    if (breakUntil > now) {
      showOverlay(breakUntil - now);
      lastTick = now;
      return;
    }

    if (breakUntil && breakUntil <= now) {
      state.usedMs = 0;
      state.breakUntil = 0;
      state.lastFinishedBreakAt = now;
      removeOverlay();
      flushUsage();
    }

    const elapsed = Math.min(now - lastTick, 2000);
    lastTick = now;
    if (document.visibilityState !== "visible" || !document.hasFocus()) return;

    state.usedMs = Number(state.usedMs || 0) + elapsed;
    state.updatedAt = now;

    if (state.usedMs >= minutesToMs(settings.usageLimitMinutes)) {
      state.breakUntil = now + minutesToMs(settings.breakMinutes);
      state.usedMs = minutesToMs(settings.usageLimitMinutes);
      showOverlay(state.breakUntil - now);
      flushUsage();
      return;
    }

    if (now - lastFlush > 5000) flushUsage();
  }

  function showOverlay(remainingMs) {
    if (!overlay) {
      const breed = breeds[Math.floor(Math.random() * breeds.length)];
      const walkVideoUrl = chromeApi.runtime.getURL(`assets/${breed}_walk.webm`);
      const idleVideoUrl = chromeApi.runtime.getURL(`assets/${breed}_idle.webm`);

      overlay = document.createElement("section");
      overlay.id = "pawsoff-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.innerHTML = `
        <div class="pawsoff-stage">
          <div class="pawsoff-copy">
            <div class="pawsoff-kicker">🐶 PawsOff is on duty</div>
            <h1 class="pawsoff-title">PawsOff</h1>
            <p class="pawsoff-subtitle">This site has had enough of you for now.<br>Stretch, blink, sip water — and let the puppy supervise.</p>
            <div class="pawsoff-countdown" aria-live="polite">00:00</div>
            <div class="pawsoff-hint">The page unlocks automatically when the countdown ends.</div>
            <button class="pawsoff-dismiss" type="button">Shhhhh Puppy 🐾</button>
            <div class="pawsoff-socials">
              <a href="https://www.youtube.com/@TechMonkKapil" target="_blank" rel="noopener" title="YouTube">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.17 1 12 1 12s0 3.83.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.83 23 12 23 12s0-3.83-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
              </a>
              <a href="https://www.linkedin.com/in/kapilraghuwanshi/" target="_blank" rel="noopener" title="LinkedIn">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://x.com/techygeeeky" target="_blank" rel="noopener" title="Twitter">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="https://www.instagram.com/techygeeeky/" target="_blank" rel="noopener" title="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
            <div class="pawsoff-author">Made in India 🇮🇳 by Tech Monk - Kapil</div>
          </div>
          <div class="pawsoff-dog-wrap pawsoff-${breed}">
            <video class="pawsoff-dog-walk pawsoff-slide-in" src="${walkVideoUrl}" autoplay muted playsinline></video>
            <video class="pawsoff-dog-idle pawsoff-dog-hidden" src="${idleVideoUrl}" muted playsinline></video>
          </div>
        </div>
      `;
      countdownNode = overlay.querySelector(".pawsoff-countdown");
      document.documentElement.append(overlay);
      document.documentElement.style.overflow = "hidden";

      // Dismiss button
      overlay.querySelector(".pawsoff-dismiss").addEventListener("click", () => {
        if (matchedSite && usage[matchedSite]) {
          usage[matchedSite].usedMs = 0;
          usage[matchedSite].breakUntil = 0;
          usage[matchedSite].updatedAt = Date.now();
          flushUsage();
        }
        removeOverlay();
      });

      const walkVideo = overlay.querySelector(".pawsoff-dog-walk");
      const idleVideo = overlay.querySelector(".pawsoff-dog-idle");

      walkVideo.addEventListener("ended", () => {
        walkVideo.classList.add("pawsoff-dog-hidden");
        idleVideo.classList.remove("pawsoff-dog-hidden");
        idleVideo.classList.add("pawsoff-idle-visible");
        idleVideo.play().catch(err => console.warn("PawsOff idle video autoplay prevented", err));
      });

      // Play idle video once, pause on last frame, and replay after 1 minute
      idleVideo.addEventListener("ended", () => {
        setTimeout(() => {
          if (overlay && document.documentElement.contains(overlay)) {
            idleVideo.currentTime = 0;
            idleVideo.play();
          }
        }, 60000);
      });
    }
    countdownNode.textContent = formatDuration(remainingMs);
  }

  function removeOverlay() {
    overlay?.remove();
    overlay = null;
    countdownNode = null;
    document.documentElement.style.overflow = "";
  }

  function ensureSiteState() {
    if (!matchedSite) return;
    usage[matchedSite] ||= { usedMs: 0, breakUntil: 0, updatedAt: Date.now() };
  }

  function flushUsage() {
    if (!matchedSite) return;
    lastFlush = Date.now();
    chromeApi.storage.local.set({ [USAGE_KEY]: usage });
  }

  function getMatchedSite(currentHost, sites) {
    return (sites || [])
      .map(normalizeSiteInput)
      .filter(Boolean)
      .find((site) => currentHost === site || currentHost.endsWith(`.${site}`)) || "";
  }

  function normalizeSiteInput(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    try {
      const asUrl = raw.includes("://") ? new URL(raw) : new URL(`https://${raw}`);
      return normalizeHost(asUrl.hostname);
    } catch {
      return normalizeHost(raw.split("/")[0]);
    }
  }

  function normalizeHost(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/^m\./, "");
  }

  function minutesToMs(minutes) {
    return Math.max(0.1, Number(minutes) || 0) * 60 * 1000;
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }
})();
