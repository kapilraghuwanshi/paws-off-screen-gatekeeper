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
const siteForm = document.querySelector("#site-form");
const siteInput = document.querySelector("#site-input");
const siteList = document.querySelector("#site-list");
const saveButton = document.querySelector("#save");
const resetUsageButton = document.querySelector("#reset-usage");
const saveState = document.querySelector("#save-state");

let settings = DEFAULT_SETTINGS;

document.addEventListener("DOMContentLoaded", init);
siteForm.addEventListener("submit", addSite);
saveButton.addEventListener("click", saveSettings);
resetUsageButton.addEventListener("click", resetUsage);

async function init() {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  settings = { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] || {}) };
  render();
}

function render() {
  enabledInput.checked = Boolean(settings.enabled);
  usageLimitInput.value = String(settings.usageLimitMinutes || 30);
  breakTimeInput.value = String(settings.breakMinutes || 5);
  siteList.replaceChildren(...settings.sites.map(createSitePill));
}

function createSitePill(site) {
  const pill = document.createElement("span");
  pill.className = "site-pill";
  pill.textContent = site;

  const button = document.createElement("button");
  button.type = "button";
  button.title = `Remove ${site}`;
  button.setAttribute("aria-label", `Remove ${site}`);
  button.textContent = "×";
  button.addEventListener("click", () => {
    settings = {
      ...settings,
      sites: settings.sites.filter((item) => item !== site)
    };
    render();
  });

  pill.append(button);
  return pill;
}

function addSite(event) {
  event.preventDefault();
  const site = normalizeSiteInput(siteInput.value);
  if (!site) return;
  settings = {
    ...settings,
    sites: Array.from(new Set([...settings.sites, site])).sort()
  };
  siteInput.value = "";
  render();
}

async function saveSettings() {
  settings = {
    ...settings,
    enabled: enabledInput.checked,
    usageLimitMinutes: Number(usageLimitInput.value),
    breakMinutes: Number(breakTimeInput.value)
  };
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  showSaveState("Saved. The puppy has the new orders. 🐶");
}

async function resetUsage() {
  await chrome.storage.local.set({ [USAGE_KEY]: {} });
  showSaveState("All timers reset. 🔄");
}

function showSaveState(message) {
  saveState.textContent = message;
  setTimeout(() => {
    if (saveState.textContent === message) saveState.textContent = "";
  }, 2600);
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
