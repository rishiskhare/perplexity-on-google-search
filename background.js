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