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

const enabledInput = document.querySelector("#enabled");
const usageLimitInput = document.querySelector("#usage-limit");
const breakTimeInput = document.querySelector("#break-time");
const siteGrid = document.querySelector("#site-grid");
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
  let data = {};
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      data = await chrome.storage.local.get(SETTINGS_KEY);
    }
  } catch (e) {
    console.warn("Storage API not available, using defaults.");
  }
  settings = { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] || {}) };
  render();
}

function render() {
  enabledInput.checked = Boolean(settings.enabled);
  usageLimitInput.value = String(settings.usageLimitMinutes || 2);
  breakTimeInput.value = String(settings.breakMinutes || 2);
  
  // Render checkboxes for predefined sites
  siteGrid.replaceChildren();
  for (const site of PREDEFINED_SITES) {
    const allHosts = [site.host, ...(site.aliases || [])];
    const isChecked = allHosts.some((h) => settings.sites.includes(h));

    const label = document.createElement("label");
    label.className = "site-check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isChecked;
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        settings.sites = Array.from(new Set([...settings.sites, site.host])).sort();
      } else {
        settings.sites = settings.sites.filter((item) => !allHosts.includes(item));
      }
      render();
    });

    const span = document.createElement("span");
    span.className = "site-name";
    span.textContent = site.label;

    label.append(checkbox, span);
    siteGrid.append(label);
  }

  // Render chips for custom sites only
  const predefinedHosts = new Set(
    PREDEFINED_SITES.flatMap(s => [s.host, ...(s.aliases || [])])
  );
  
  const customSites = settings.sites.filter(s => !predefinedHosts.has(s));
  siteList.replaceChildren(...customSites.map(createSitePill));
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
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
    }
  } catch (e) {
    console.warn("Storage API not available. Cannot save.");
  }
  showSaveState("Saved. The puppy has the new orders. 🐶");
}

async function resetUsage() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({ [USAGE_KEY]: {} });
    }
  } catch (e) {
    console.warn("Storage API not available. Cannot reset.");
  }
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
