const SETTINGS_KEY = "pawsOffSettings";
const USAGE_KEY = "pawsOffUsage";

const PREDEFINED_SITES = [
  { label: "X", host: "x.com", aliases: ["twitter.com"] },
  { label: "Facebook", host: "facebook.com" },
  { label: "Reddit", host: "reddit.com" },
  { label: "Instagram", host: "instagram.com" },
  { label: "TikTok", host: "tiktok.com" },
  { label: "YouTube", host: "youtube.com" },
  { label: "LinkedIn", host: "linkedin.com" },
  { label: "Threads", host: "threads.net" }
];

const DEFAULT_SETTINGS = {
  enabled: true,
  usageLimitMinutes: 30,
  breakMinutes: 5,
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

const usageLimitInput = document.querySelector("#usage-limit");
const breakTimeInput = document.querySelector("#break-time");
const siteGrid = document.querySelector("#site-grid");
const otherSitesToggle = document.querySelector("#other-sites-toggle");
const otherSitesTextarea = document.querySelector("#other-sites");
const usageInfo = document.querySelector("#usage-info");
const shooPuppy = document.querySelector("#shoo-btn");
const saveButton = document.querySelector("#save");

let activeHost = "";
let matchedSite = "";
let settings = DEFAULT_SETTINGS;
let usage = {};

document.addEventListener("DOMContentLoaded", init);
shooPuppy.addEventListener("click", dismissOverlay);
saveButton.addEventListener("click", saveSettings);
otherSitesToggle.addEventListener("change", toggleOtherSites);

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeHost = getHostFromUrl(tab?.url || "");

  const data = await chrome.storage.local.get([SETTINGS_KEY, USAGE_KEY]);
  settings = { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] || {}) };
  usage = data[USAGE_KEY] || {};
  matchedSite = getMatchedSite(activeHost, settings.sites);

  buildSiteGrid();
  render();
}

function buildSiteGrid() {
  siteGrid.replaceChildren();
  for (const site of PREDEFINED_SITES) {
    const allHosts = [site.host, ...(site.aliases || [])];
    const isChecked = allHosts.some((h) => settings.sites.includes(h));

    const label = document.createElement("label");
    label.className = "site-check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isChecked;
    checkbox.dataset.host = site.host;
    if (site.aliases) checkbox.dataset.aliases = site.aliases.join(",");

    const span = document.createElement("span");
    span.className = "site-name";
    span.textContent = site.label;

    label.append(checkbox, span);
    siteGrid.append(label);
  }
}

function toggleOtherSites() {
  const show = otherSitesToggle.checked;
  otherSitesTextarea.style.display = show ? "block" : "none";
}

function render() {
  usageLimitInput.value = Number(settings.usageLimitMinutes || 30);
  breakTimeInput.value = Number(settings.breakMinutes || 5);

  // Populate "other sites" textarea with sites not in PREDEFINED_SITES
  const predefinedHosts = new Set();
  for (const site of PREDEFINED_SITES) {
    predefinedHosts.add(site.host);
    if (site.aliases) site.aliases.forEach((a) => predefinedHosts.add(a));
  }
  const otherSites = (settings.sites || []).filter((s) => !predefinedHosts.has(s));
  if (otherSites.length > 0) {
    otherSitesToggle.checked = true;
    otherSitesTextarea.style.display = "block";
    otherSitesTextarea.value = otherSites.join("\n");
  } else {
    otherSitesToggle.checked = false;
    otherSitesTextarea.style.display = "none";
    otherSitesTextarea.value = "";
  }

  // Usage info
  updateUsageInfo();

  // Shoo button: enabled only if the current site is in break
  updateShooButton();
}

function updateUsageInfo() {
  if (!activeHost) {
    usageInfo.textContent = "This page cannot be tracked.";
    return;
  }

  if (!matchedSite) {
    usageInfo.textContent = `${activeHost} is not guarded yet.`;
    return;
  }

  const state = usage[matchedSite] || {};
  const usedMs = Number(state.usedMs || 0);
  const breakUntil = Number(state.breakUntil || 0);
  const now = Date.now();

  if (breakUntil > now) {
    const remaining = formatDuration(breakUntil - now);
    usageInfo.innerHTML = `<strong>${matchedSite}</strong> — on break. Unlocks in <strong>${remaining}</strong>`;
  } else {
    usageInfo.innerHTML = `<strong>${matchedSite}</strong> — used <strong>${formatDuration(usedMs)}</strong>`;
  }
}

function updateShooButton() {
  if (!matchedSite) {
    shooPuppy.disabled = true;
    return;
  }
  const state = usage[matchedSite] || {};
  const breakUntil = Number(state.breakUntil || 0);
  shooPuppy.disabled = breakUntil <= Date.now();
}

async function dismissOverlay() {
  if (!matchedSite) return;

  // Reset usage and break for matched site
  usage[matchedSite] = { usedMs: 0, breakUntil: 0, updatedAt: Date.now() };
  await chrome.storage.local.set({ [USAGE_KEY]: usage });

  // Send message to content script to remove overlay immediately
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "PAWSOFF_DISMISS" });
    } catch {
      // Tab might not have content script
    }
  }

  shooPuppy.disabled = true;
  updateUsageInfo();
}

async function saveSettings() {
  // Collect checked predefined sites
  const checkedSites = [];
  const checkboxes = siteGrid.querySelectorAll("input[type='checkbox']");
  for (const cb of checkboxes) {
    if (cb.checked) {
      checkedSites.push(cb.dataset.host);
      if (cb.dataset.aliases) {
        checkedSites.push(...cb.dataset.aliases.split(","));
      }
    }
  }

  // Collect "other sites" from textarea
  let otherSites = [];
  if (otherSitesToggle.checked) {
    otherSites = parseCustomSites(otherSitesTextarea.value);
  }

  const allSites = Array.from(new Set([...checkedSites, ...otherSites])).sort();

  settings = {
    ...settings,
    enabled: true,
    usageLimitMinutes: clampNumber(usageLimitInput.value, 1, 240, 30),
    breakMinutes: clampNumber(breakTimeInput.value, 1, 60, 5),
    sites: allSites
  };

  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  matchedSite = getMatchedSite(activeHost, settings.sites);

  // Visual feedback
  saveButton.textContent = "Saved 🐾";
  saveButton.classList.add("saved");
  setTimeout(() => {
    saveButton.textContent = "Save";
    saveButton.classList.remove("saved");
  }, 1800);

  updateUsageInfo();
  updateShooButton();
}

// ===== Helpers =====

function parseCustomSites(value) {
  return Array.from(
    new Set(
      String(value || "")
        .split(/[\n,]+/)
        .map(normalizeSiteInput)
        .filter(Boolean)
    )
  ).sort();
}

function getHostFromUrl(url) {
  try {
    return normalizeHost(new URL(url).hostname);
  } catch {
    return "";
  }
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

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
