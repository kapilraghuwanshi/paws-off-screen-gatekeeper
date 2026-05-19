const SETTINGS_KEY = "pawsOffSettings";
const USAGE_KEY = "pawsOffUsage";
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

const enabledInput = document.querySelector("#enabled");
const usageLimitInput = document.querySelector("#usage-limit");
const breakTimeInput = document.querySelector("#break-time");
const sitesInput = document.querySelector("#sites");
const statusNode = document.querySelector("#site-status");
const addSiteButton = document.querySelector("#add-site");
const resetSiteButton = document.querySelector("#reset-site");
const saveButton = document.querySelector("#save");

let activeHost = "";
let matchedSite = "";
let settings = DEFAULT_SETTINGS;
let usage = {};

document.addEventListener("DOMContentLoaded", init);
addSiteButton.addEventListener("click", addCurrentSite);
resetSiteButton.addEventListener("click", resetCurrentSite);
saveButton.addEventListener("click", saveSettings);

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeHost = getHostFromUrl(tab?.url || "");

  const data = await chrome.storage.local.get([SETTINGS_KEY, USAGE_KEY]);
  settings = { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] || {}) };
  usage = data[USAGE_KEY] || {};
  matchedSite = getMatchedSite(activeHost, settings.sites);

  render();
}

async function addCurrentSite() {
  if (!activeHost) return;
  const sites = parseSites(sitesInput.value);
  settings = { ...settings, sites: Array.from(new Set([...sites, activeHost])).sort() };
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  matchedSite = activeHost;
  render("Current site added. 🐾");
}

async function resetCurrentSite() {
  if (!matchedSite) return;
  usage[matchedSite] = { usedMs: 0, breakUntil: 0, updatedAt: Date.now() };
  await chrome.storage.local.set({ [USAGE_KEY]: usage });
  render("Timer reset. Fresh start! 🐶");
}

async function saveSettings() {
  settings = {
    ...settings,
    enabled: enabledInput.checked,
    usageLimitMinutes: clampNumber(usageLimitInput.value, 1, 240, 30),
    breakMinutes: clampNumber(breakTimeInput.value, 1, 60, 5),
    sites: parseSites(sitesInput.value)
  };
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  matchedSite = getMatchedSite(activeHost, settings.sites);
  render("Saved. Puppy is ready. 🐕");
}

function render(message = "") {
  enabledInput.checked = Boolean(settings.enabled);
  usageLimitInput.value = Number(settings.usageLimitMinutes || 30);
  breakTimeInput.value = Number(settings.breakMinutes || 5);
  sitesInput.value = (settings.sites || []).join("\n");

  addSiteButton.disabled = !activeHost || Boolean(getMatchedSite(activeHost, parseSites(sitesInput.value)));
  resetSiteButton.disabled = !matchedSite;

  if (message) {
    statusNode.textContent = message;
    return;
  }

  if (!activeHost) {
    statusNode.textContent = "This page cannot be tracked.";
    return;
  }

  if (!matchedSite) {
    statusNode.textContent = `${activeHost} is not guarded yet.`;
    return;
  }

  const state = usage[matchedSite] || {};
  const usedText = formatDuration(Number(state.usedMs || 0));
  statusNode.textContent = `${matchedSite} guarded. Used ${usedText}.`;
}

function parseSites(value) {
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
