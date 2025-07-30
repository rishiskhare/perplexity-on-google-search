if (typeof chrome.webRequest !== 'undefined' && chrome.webRequest.onHeadersReceived) {
  try {
    chrome.webRequest.onHeadersReceived.addListener(
      details => {
        const filtered = (details.responseHeaders || []).filter(h => {
          const n = h.name.toLowerCase();
          if (n === 'x-frame-options') return false;
          if (n === 'content-security-policy' && /frame-ancestors/i.test(h.value)) return false;
          return true;
        });
        return { responseHeaders: filtered };
      },
      { urls: ['https://perplexity.ai/*', 'https://*.perplexity.ai/*'], types: ['sub_frame'] },
      ['blocking', 'responseHeaders']
    );
  } catch (e) {}
}
try { importScripts('defaults.js'); } catch (_e) {}

const storageArea = chrome.storage?.local;

let cachedSettings = { ...DEFAULT_SETTINGS };

function refreshCachedSettings(cb) {
  if (!storageArea) {
    cachedSettings = { ...DEFAULT_SETTINGS };
    cb && cb();
    return;
  }
  storageArea.get({ settings: DEFAULT_SETTINGS }, data => {
    cachedSettings = (data && data.settings) ? data.settings : DEFAULT_SETTINGS;
    cb && cb();
  });
}

refreshCachedSettings();

if (storageArea && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener(changes => {
    if (changes.settings) {
      cachedSettings = changes.settings.newValue || DEFAULT_SETTINGS;
    }
  });
}

function isYouTubeVideoPage(urlObj) {
  return urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch' && cachedSettings.youtubeVideoSummaries;
}

function isGoogleSearchPage(urlObj) {
  return urlObj.hostname.includes('google.') && urlObj.pathname.startsWith('/search') && cachedSettings.googleSearch;
}

function isDuckDuckGoSearchPage(urlObj) {
  return urlObj.hostname.includes('duckduckgo.com') && urlObj.search.includes('q=') && cachedSettings.duckduckgoSearch;
}

function isBraveSearchPage(urlObj) {
  return urlObj.hostname.includes('search.brave.com') && urlObj.search.includes('q=') && cachedSettings.braveSearch;
}

function isSupportedPage(urlString) {
  try {
    const urlObj = new URL(urlString);
    return isYouTubeVideoPage(urlObj) ||
           isGoogleSearchPage(urlObj) ||
           isDuckDuckGoSearchPage(urlObj) ||
           isBraveSearchPage(urlObj);
  } catch (_e) {
    return false;
  }
}

chrome.commands?.onCommand.addListener((command) => {
  if (command === 'toggle-sidebar') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { toggleSidebar: true },
          () => {
            void chrome.runtime.lastError;
          }
        );
      }
    });
  }
}); 

chrome.action?.onClicked.addListener((tab) => {
  if (tab && tab.id !== undefined) {
    chrome.tabs.sendMessage(
      tab.id,
      { toggleSidebar: true },
      () => {
        void chrome.runtime.lastError;
      }
    );
  }
}); 