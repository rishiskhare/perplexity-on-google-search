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