const SIDEBAR_CONFIG = {
  DEFAULT_WIDTH: '430px',
  MIN_WIDTH: 50,
  CLOSE_THRESHOLD: 50,
  Z_INDEX: 9998
};

const COLORS = {
  primary: '#40a0b0',
  headerBg: '#f8f8f8',
  buttonBg: '#f1f1f1',
  buttonHoverBg: '#e0e0e0',
  border: '#e0e0e0'
};

const storageArea = chrome.storage.local;
let cachedSettings = DEFAULT_SETTINGS;
const getExtensionURL = (chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL : (p) => p;

function isYouTubeVideoPage(url = location) {
  return url.hostname.includes('youtube.com') && url.pathname === '/watch';
}

function isGoogleSearchPage(url = location) {
  return (
    url.hostname.includes('google.') && url.pathname.startsWith('/search')
  );
}

function isDuckDuckGoSearchPage(url = location) {
  return (
    url.hostname.includes('duckduckgo.com') && new URLSearchParams(url.search).has('q')
  );
}

function isBraveSearchPage(url = location) {
  return (
    url.hostname.includes('search.brave.com') && new URLSearchParams(url.search).has('q')
  );
}

function isSupportedPage(url = location) {
  if (isYouTubeVideoPage(url)) return cachedSettings.youtubeVideoSummaries;
  if (isGoogleSearchPage(url)) return cachedSettings.googleSearch;
  if (isDuckDuckGoSearchPage(url)) return cachedSettings.duckduckgoSearch;
  if (isBraveSearchPage(url)) return cachedSettings.braveSearch;
  return false;
}

function hidePerplexityUI() {
  const sidebar = document.getElementById('perplexity-sidebar');
  const button = document.getElementById('perplexity-side-button');

  if (sidebar) {
    sidebar.style.transform = 'translateX(100%)';
    sidebar.style.display = 'none';
    const iframe = sidebar.querySelector('iframe');
    if (iframe) iframe.remove();
    sidebar.dataset.loaded = '';
  }

  if (button) {
    hideSideButton();
  }
}

function shouldShowSideButton(url = location) {
  const mode = cachedSettings.showSidebarButtonMode || 'supported';
  if (mode === 'never') return false;
  const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
  if (isFullscreen && isYouTubeVideoPage(url)) return false;
  if (mode === 'always') return true;
  return isSupportedPage(url);
}

function ensureSideButtonVisible() {
  if (!shouldShowSideButton()) {
    hideSideButton();
    return;
  }

  let button = document.getElementById('perplexity-side-button');
  if (button) {
    showSideButton();
  } else {
    addPerplexitySideButton();
  }
}

function initializeWithUserSettings() {
  storageArea.get({
    settings: DEFAULT_SETTINGS
  }, function(data) {
    const settings = (data && data.settings) ? data.settings : DEFAULT_SETTINGS;

    cachedSettings = settings;

    addCustomFont();

    createPerplexitySidebar(settings);

    if (settings.showSidebarButtonMode !== 'never' && shouldShowSideButton()) {
      if (!settings.autoExpandSidebar) {
        addPerplexitySideButton();
      } else {
        addPerplexitySideButton(true);
      }
    }

    setupLocationChangeListener();
  });
}

function createPerplexitySidebar(settings) {
  const isYT = window.location.hostname.includes('youtube.com') && window.location.pathname === '/watch';
  const isGSearch = isGoogleSearchPage();
  const isDdg = isDuckDuckGoSearchPage();
  const isBrave = isBraveSearchPage();

  let query = '';

  if (isYT && settings.youtubeVideoSummaries) {
    query = `Summarize this video: ${window.location.href}`;
  } else if ((isGSearch && settings.googleSearch) || (isDdg && settings.duckduckgoSearch) || (isBrave && settings.braveSearch)) {
    query = new URLSearchParams(window.location.search).get('q') || '';
  } else {
    query = '';
  }

  const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;

  const sidebar = createSidebarElement(settings);
  const headerSection = createHeaderSection();
  const closeButton = createCloseButton();
  const contentContainer = createContentContainer();
  const resizeHandle = createResizeHandle();

  const optionsButton = createOptionsButton();

  sidebar.dataset.perplexityUrl = perplexityUrl;

  headerSection.appendChild(optionsButton);
  headerSection.appendChild(closeButton);
  sidebar.appendChild(resizeHandle);
  sidebar.appendChild(headerSection);
  sidebar.appendChild(contentContainer);
  document.body.appendChild(sidebar);

  setupResizeFunctionality(sidebar, resizeHandle, sidebar.querySelector('iframe'));

  const shouldAutoExpand = settings.autoExpandSidebar && (
    (isYT && settings.youtubeVideoSummaries) ||
    (isGSearch && settings.googleSearch) ||
    (isDdg && settings.duckduckgoSearch) ||
    (isBrave && settings.braveSearch)
  );

  if (shouldAutoExpand) {
    setTimeout(() => {
      sidebar.style.transform = "translateX(0)";

      if (!sidebar.dataset.loaded) {
        const iframe = createIframe(sidebar.dataset.perplexityUrl);
        contentContainer.appendChild(iframe);
        sidebar.dataset.loaded = "true";
      }

      const sideButton = document.getElementById("perplexity-side-button");
      if (sideButton) hideSideButton();
    }, 30);
  }
}

function createHeaderSection() {
  const headerSection = document.createElement('div');

  Object.assign(headerSection.style, {
    height: "50px",
    width: "100%",
    position: "relative",
    borderBottom: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.headerBg,
    flexShrink: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    paddingLeft: "15px",
    boxSizing: "border-box"
  });

  const titleContainer = document.createElement('div');
  Object.assign(titleContainer.style, {
    display: "flex",
    alignItems: "center",
    maxWidth: "calc(100% - 50px)",
    overflow: "hidden"
  });

  const combinedLink = document.createElement('a');
  combinedLink.href = "https://github.com/rishiskhare/perplexity-on-google-search";
  combinedLink.target = "_blank";

  Object.assign(combinedLink.style, {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    cursor: "pointer",
    color: "#333",
    transition: "color 0.2s ease"
  });

  const titleText = document.createElement('span');
  titleText.textContent = "perplexity on google search";

  Object.assign(titleText.style, {
    fontFamily: "FKGrotesk-Regular, sans-serif",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  });

  const githubIcon = document.createElement('span');
  githubIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>`;

  Object.assign(githubIcon.style, {
    display: "inline-flex",
    marginLeft: "8px",
    alignItems: "center",
    justifyContent: "center"
  });

  combinedLink.addEventListener('mouseover', () => {
    combinedLink.style.color = COLORS.primary;
  });

  combinedLink.addEventListener('mouseout', () => {
    combinedLink.style.color = "#333";
  });

  combinedLink.appendChild(titleText);
  combinedLink.appendChild(githubIcon);
  titleContainer.appendChild(combinedLink);
  headerSection.appendChild(titleContainer);

  return headerSection;
}

function createSidebarElement(settings) {
  const sidebar = document.createElement('div');
  sidebar.id = "perplexity-sidebar";

  const width = (settings && settings.sidebarWidth) ? `${settings.sidebarWidth}px` : SIDEBAR_CONFIG.DEFAULT_WIDTH;

  Object.assign(sidebar.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: width,
    height: "100%",
    backgroundColor: "#fff",
    boxShadow: "-2px 0 5px rgba(0,0,0,0.2)",
    zIndex: SIDEBAR_CONFIG.Z_INDEX,
    display: "flex",
    flexDirection: "column",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
    boxSizing: "border-box"
  });

  return sidebar;
}

function createCloseButton() {
  const closeButton = document.createElement('div');
  closeButton.id = "perplexity-close-button";
  closeButton.innerHTML = "✕";

  Object.assign(closeButton.style, {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: COLORS.buttonBg,
    color: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: "10000",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.2s ease, color 0.2s ease"
  });

  closeButton.addEventListener('mouseover', () => {
    closeButton.style.backgroundColor = COLORS.buttonHoverBg;
    closeButton.style.color = COLORS.primary;
  });

  closeButton.addEventListener('mouseout', () => {
    closeButton.style.backgroundColor = COLORS.buttonBg;
    closeButton.style.color = "#333";
  });

  closeButton.addEventListener('click', () => {
    const sidebar = document.getElementById("perplexity-sidebar");
    const sideButton = document.getElementById("perplexity-side-button");

    if (sidebar) sidebar.style.transform = "translateX(100%)";
    if (sideButton) showSideButton();
  });

  return closeButton;
}

function createOptionsButton() {
  const btn = document.createElement('div');
  btn.id = 'perplexity-options-button';

  btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94a7.43,7.43,0,0,0,.05-.94,7.43,7.43,0,0,0-.05-.94l2.11-1.65a.5.5,0,0,0,.12-.63l-2-3.46a.5.5,0,0,0-.61-.22l-2.49,1a7.28,7.28,0,0,0-1.63-.94l-.38-2.65a.5.5,0,0,0-.5-.42H9.33a.5.5,0,0,0-.5.42l-.38,2.65a7.28,7.28,0,0,0-1.63.94l-2.49-1a.5.5,0,0,0-.61.22l-2,3.46a.5.5,0,0,0,.12.63l2.11,1.65a7.43,7.43,0,0,0-.05.94,7.43,7.43,0,0,0,.05.94L2,14.59a.5.5,0,0,0-.12.63l2,3.46a.5.5,0,0,0,.61.22l2.49-1a7.28,7.28,0,0,0,1.63.94l.38,2.65a.5.5,0,0,0,.5.42h4.34a.5.5,0,0,0,.5-.42l.38-2.65a7.28,7.28,0,0,0,1.63-.94l2.49,1a.5.5,0,0,0,.61-.22l2-3.46a.5.5,0,0,0-.12-.63Zm-7.14,2.06A3,3,0,1,1,15,12,3,3,0,0,1,12,15Z"/></svg>`;

  Object.assign(btn.style, {
    position: 'absolute',
    top: '10px',
    right: '50px',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: COLORS.buttonBg,
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    zIndex: '10000',
    transition: 'background-color 0.2s ease, color 0.2s ease'
  });

  btn.addEventListener('mouseover', () => {
    btn.style.backgroundColor = COLORS.buttonHoverBg;
    btn.style.color = COLORS.primary;
  });

  btn.addEventListener('mouseout', () => {
    btn.style.backgroundColor = COLORS.buttonBg;
    btn.style.color = '#333';
  });

  btn.addEventListener('click', () => {
    toggleOptionsPopup();
  });

  return btn;
}

function createContentContainer() {
  const contentContainer = document.createElement('div');

  Object.assign(contentContainer.style, {
    flex: "1",
    position: "relative",
    width: "100%"
  });

  contentContainer.setAttribute('data-container', 'true');

  return contentContainer;
}

function createResizeHandle() {
  const resizeHandle = document.createElement('div');
  resizeHandle.id = "perplexity-resize-handle";

  Object.assign(resizeHandle.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "6px",
    height: "100%",
    background: COLORS.primary,
    opacity: "0",
    cursor: "ew-resize",
    zIndex: "9999",
    transition: "opacity 0.2s ease"
  });

  resizeHandle.addEventListener('mouseover', () => {
    resizeHandle.style.opacity = "0.5";
  });

  resizeHandle.addEventListener('mouseout', () => {
    resizeHandle.style.opacity = "0";
  });

  return resizeHandle;
}

function createIframe(src) {
  const iframe = document.createElement('iframe');
  iframe.src = src;

  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "none"
  });

  return iframe;
}

function setupResizeFunctionality(sidebar, resizeHandle, iframe) {
  let startX, startWidth;

  function resizePanel(e) {
    const calculatedWidth = startWidth + (startX - e.clientX);

    if (calculatedWidth < SIDEBAR_CONFIG.CLOSE_THRESHOLD) {
      sidebar.dataset.closeOnMouseUp = "true";
    } else {
      sidebar.dataset.closeOnMouseUp = "false";
      sidebar.style.width = `${Math.max(SIDEBAR_CONFIG.MIN_WIDTH, calculatedWidth)}px`;
    }
  }

  function stopResize(_e, currentIframe) {
    document.removeEventListener('mousemove', resizePanel);
    document.removeEventListener('mouseup', stopResize);

    if (sidebar.dataset.closeOnMouseUp === "true") {
      sidebar.style.transform = "translateX(100%)";

      const sideButton = document.getElementById("perplexity-side-button");
      if (sideButton) showSideButton();
    }

    if (currentIframe) currentIframe.style.pointerEvents = 'auto';
  }

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    startWidth = parseInt(sidebar.style.width);

    const currentIframe = sidebar.querySelector('iframe');
    if (currentIframe) currentIframe.style.pointerEvents = 'none';

    document.addEventListener('mousemove', resizePanel);
    document.addEventListener('mouseup', (ev) => stopResize(ev, currentIframe));
  });
}

function addPerplexitySideButton(initiallyHidden = false) {
  addCustomFont();

  const button = createSideButton(initiallyHidden);
  const logoImg = createLogoImage();
  const buttonText = createButtonText();

  button.appendChild(logoImg);
  button.appendChild(buttonText);
  document.body.appendChild(button);

  setupButtonInteractions(button, logoImg, buttonText);
}

function addCustomFont() {
  if (window.perplexityFontAdded) return;
  window.perplexityFontAdded = true;

  const fontFaceStyle = document.createElement('style');
  fontFaceStyle.textContent = `
    @font-face {
      font-family: 'FKGrotesk-Regular';
      src: url('${getExtensionURL('assets/FKGrotesk-Regular.ttf')}') format('truetype');
      font-style: normal;
    }
  `;
  document.head.appendChild(fontFaceStyle);
}

function createLogoImage() {
  const logoImg = document.createElement('img');
  logoImg.src = getExtensionURL('assets/perplexity-logo.webp');
  logoImg.alt = "Perplexity";

  Object.assign(logoImg.style, {
    width: "30px",
    height: "30px",
    marginRight: "0",
    transition: "margin-right 0.3s ease"
  });

  return logoImg;
}

function createSideButton(initiallyHidden = false) {
  const button = document.createElement('div');
  button.id = "perplexity-side-button";

  button.style.cssText = 'all: unset;';

  Object.assign(button.style, {
    position: "fixed",
    top: "50%",
    right: "0",
    transform: initiallyHidden ? "translateY(-50%) translateX(100%)" : "translateY(-50%) translateX(0)",
    width: "50px",
    height: "50px",
    borderRadius: "25px 0 0 25px",
    backgroundColor: COLORS.primary,
    color: "#fff",
    display: "flex",
    pointerEvents: initiallyHidden ? "none" : "auto",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: "9999",
    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
    transition: "transform 0.3s ease, background-color 0.2s ease",
    paddingRight: "5px",
    overflow: "hidden"
  });

  const closeIcon = document.createElement('div');
  closeIcon.textContent = '✕';
  Object.assign(closeIcon.style, {
    position: "absolute",
    top: "2px",
    right: "2px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "#f1f1f1",
    color: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    cursor: "pointer",
    lineHeight: "16px",
    userSelect: "none",
    opacity: "0",
    transition: "opacity 0.2s ease",
    pointerEvents: "none",
  });
  closeIcon.onmouseover = null;
  closeIcon.onmouseout = null;
  closeIcon.addEventListener('mouseenter', () => {
    closeIcon.style.backgroundColor = COLORS.buttonHoverBg;
    closeIcon.style.color = COLORS.primary;
  });
  closeIcon.addEventListener('mouseleave', () => {
    closeIcon.style.backgroundColor = "#f1f1f1";
    closeIcon.style.color = "#333";
  });
  closeIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = document.getElementById('perplexity-side-button');
    if (btn) btn.remove();
  });
  button.appendChild(closeIcon);

  button.addEventListener('mouseover', () => {
    closeIcon.style.opacity = '1';
    closeIcon.style.pointerEvents = 'auto';
  });
  button.addEventListener('mouseout', () => {
    closeIcon.style.opacity = '0';
    closeIcon.style.pointerEvents = 'none';
  });

  return button;
}

function createButtonText() {
  const buttonText = document.createElement('span');
  buttonText.textContent = "search on perplexity";

  Object.assign(buttonText.style, {
    whiteSpace: "nowrap",
    opacity: "0",
    maxWidth: "0",
    overflow: "hidden",
    transition: "opacity 0.3s ease, max-width 0.3s ease",
    fontSize: "20px",
    fontFamily: "FKGrotesk-Regular, sans-serif"
  });

  return buttonText;
}

function setupButtonInteractions(button, _logoImg, _buttonText) {
  const originalBg = button.style.backgroundColor;
  const hoverBg = "#52b8c6";

  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = hoverBg;
  });

  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = originalBg;
  });

  button.addEventListener("click", toggleSidebar);
}

function toggleSidebar() {
  if (!isSupportedPage()) {
    hidePerplexityUI();
    return;
  }
  const sidebar = document.getElementById("perplexity-sidebar");
  const button = document.getElementById("perplexity-side-button");

  if (!sidebar) return;

  const isVisible = sidebar.style.transform === "translateX(0px)" ||
                    sidebar.style.transform === "translateX(0)";

  if (isVisible) {
    sidebar.style.transform = "translateX(100%)";
    if (button) showSideButton();
  } else {
    storageArea.get({
      settings: DEFAULT_SETTINGS
    }, function(data) {
      const settings = (data && data.settings) ? data.settings : DEFAULT_SETTINGS;
      const width = `${settings.sidebarWidth}px`;
      sidebar.style.width = width;
      sidebar.style.transform = "translateX(0)";
      if (button) hideSideButton();

      if (!sidebar.dataset.loaded) {
        const iframe = createIframe(sidebar.dataset.perplexityUrl);
        const container = sidebar.querySelector('[data-container="true"]');
        (container || sidebar).appendChild(iframe);
        sidebar.dataset.loaded = "true";
      }
    });
  }
}

function setupLocationChangeListener() {
  if (window.perplexityLocationListenerInstalled) return;
  window.perplexityLocationListenerInstalled = true;

  const _pushState = history.pushState;
  history.pushState = function() {
    _pushState.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
  };

  const _replaceState = history.replaceState;
  history.replaceState = function() {
    _replaceState.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });

  window.addEventListener('locationchange', handleLocationChange);

  window.addEventListener('yt-navigate-finish', handleLocationChange);

  if (!window.perplexityShortcutListenerInstalled) {
    window.perplexityShortcutListenerInstalled = true;

    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement && document.activeElement.tagName;
      const isEditable = (document.activeElement && (document.activeElement.isContentEditable || activeTag === 'INPUT' || activeTag === 'TEXTAREA'));
      if (isEditable) return;

      const isKeyP = (e.code === 'KeyP') || (e.key && e.key.toLowerCase() === 'p');
      if (!isKeyP) return;

      const isAltOnly = e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey;

      if (isAltOnly) {
        e.preventDefault();
        toggleSidebar();
      }
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.toggleSidebar) {
      toggleSidebar();
    }
  });
}

function handleLocationChange() {
  ensureSideButtonVisible();
  prepareSidebarForSupportedPage();

  const sidebar = document.getElementById('perplexity-sidebar');

  const basePerplexityUrl = 'https://www.perplexity.ai/';

  const isYouTubeVideo = isYouTubeVideoPage();

  if (isYouTubeVideo && cachedSettings.youtubeVideoSummaries) {
    const newPrompt = `Summarize this video: ${window.location.href}`;
    const newUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(newPrompt)}`;

    if (sidebar) {
      sidebar.dataset.perplexityUrl = newUrl;

      const isOpen = sidebar.style.transform === 'translateX(0)' || sidebar.style.transform === 'translateX(0px)';
      const iframe = sidebar.querySelector('iframe');

      if (isOpen) {
        if (iframe) {
          if (iframe.src !== newUrl) iframe.src = newUrl;
        } else {
          const newIframe = createIframe(newUrl);
          const container = sidebar.querySelector('[data-container="true"]');
          (container || sidebar).appendChild(newIframe);
        }
        sidebar.dataset.loaded = 'true';
      } else {
        if (iframe) iframe.remove();
        sidebar.dataset.loaded = '';
      }
    } else {
      createPerplexitySidebar(cachedSettings);
    }
    return;
  }

  const isSearchPageActive = (
    (isGoogleSearchPage() && cachedSettings.googleSearch) ||
    (isDuckDuckGoSearchPage() && cachedSettings.duckduckgoSearch) ||
    (isBraveSearchPage() && cachedSettings.braveSearch)
  );

  if (isSearchPageActive && sidebar) {
    const queryParam = new URLSearchParams(window.location.search).get('q') || '';
    const newUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(queryParam)}`;
    sidebar.dataset.perplexityUrl = newUrl;

    const isOpen = sidebar.style.transform === 'translateX(0)' || sidebar.style.transform === 'translateX(0px)';
    const iframe = sidebar.querySelector('iframe');

    if (isOpen) {
      if (iframe) {
        if (iframe.src !== newUrl) iframe.src = newUrl;
      } else {
        const newIframe = createIframe(newUrl);
        const container = sidebar.querySelector('[data-container="true"]');
        (container || sidebar).appendChild(newIframe);
      }
      sidebar.dataset.loaded = 'true';
    } else {
      if (iframe) iframe.remove();
      sidebar.dataset.loaded = '';
    }
  }

  if (!isYouTubeVideo && !isSearchPageActive && sidebar) {
    sidebar.dataset.perplexityUrl = basePerplexityUrl;

    const isOpen = sidebar.style.transform === 'translateX(0)' || sidebar.style.transform === 'translateX(0px)';
    const iframe = sidebar.querySelector('iframe');

    if (isOpen) {
      if (iframe) {
        if (iframe.src !== basePerplexityUrl) iframe.src = basePerplexityUrl;
      } else {
        const newIframe = createIframe(basePerplexityUrl);
        const container = sidebar.querySelector('[data-container="true"]');
        (container || sidebar).appendChild(newIframe);
      }
      sidebar.dataset.loaded = 'true';
    } else {
      if (iframe) iframe.remove();
      sidebar.dataset.loaded = '';
    }
  }
  prepareSidebarForSupportedPage();
}

function prepareSidebarForSupportedPage() {
  if (!isSupportedPage()) {
    hidePerplexityUI();
    return;
  }
  let sidebar = document.getElementById('perplexity-sidebar');
  if (!sidebar) {
    createPerplexitySidebar(cachedSettings);
    sidebar = document.getElementById('perplexity-sidebar');
    if (sidebar) sidebar.style.transform = 'translateX(100%)';
  } else {
    sidebar.style.display = 'flex';
    sidebar.style.transform = 'translateX(100%)';
  }
}

initializeWithUserSettings();

let lastRecordedUrl = location.href;
function startURLWatcher() {
  if (window.perplexityURLWatcherStarted) return;
  window.perplexityURLWatcherStarted = true;

  setInterval(() => {
    if (location.href !== lastRecordedUrl) {
      lastRecordedUrl = location.href;
      handleLocationChange();
    }
  }, 800);
}

function showSideButton() {
  const btn = document.getElementById('perplexity-side-button');
  if (!btn) return;
  if (!shouldShowSideButton()) {
    hideSideButton();
    return;
  }
  btn.style.transform = 'translateY(-50%) translateX(0)';
  btn.style.pointerEvents = 'auto';
}

function hideSideButton() {
  const btn = document.getElementById('perplexity-side-button');
  if (btn) {
    btn.style.transform = 'translateY(-50%) translateX(100%)';
    btn.style.pointerEvents = 'none';
  }
}

function toggleOptionsPopup() {
  const sidebar = document.getElementById('perplexity-sidebar');
  if (!sidebar) return;

  let overlay = sidebar.querySelector('#perplexity-options-popup');

  if (overlay) {
    overlay.remove();
    return;
  }

  overlay = document.createElement('div');
  overlay.id = 'perplexity-options-popup';

  Object.assign(overlay.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '10001'
  });

  const modal = document.createElement('div');
  Object.assign(modal.style, {
    position: 'relative',
    width: '340px',
    maxWidth: '90%',
    height: 'auto',
    maxHeight: '90%',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  });

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '50px',
    padding: '0 15px',
    borderBottom: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.headerBg,
    flexShrink: '0'
  });

  const titleSpan = document.createElement('span');
  titleSpan.textContent = 'Settings';
  Object.assign(titleSpan.style, {
    fontFamily: 'FKGrotesk-Regular, sans-serif',
    fontSize: '16px',
    color: '#333'
  });

  const close = document.createElement('div');
  close.innerHTML = '✕';
  Object.assign(close.style, {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: COLORS.buttonBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#333',
    transition: 'background-color 0.2s ease, color 0.2s ease'
  });
  close.addEventListener('mouseover', () => { close.style.backgroundColor = COLORS.buttonHoverBg; close.style.color = COLORS.primary; });
  close.addEventListener('mouseout', () => { close.style.backgroundColor = COLORS.buttonBg; close.style.color = '#333'; });
  close.addEventListener('click', () => overlay.remove());

  header.appendChild(titleSpan);
  header.appendChild(close);
  modal.appendChild(header);

  const contentWrap = document.createElement('div');
  Object.assign(contentWrap.style, {
    flex: '1',
    padding: '10px 20px 20px',
    overflowY: 'auto',
    fontFamily: 'FKGrotesk-Regular, sans-serif',
    color: '#333',
    fontSize: '13px',
    maxHeight: 'calc(90vh - 50px)'
  });

  buildOptionsUI(contentWrap);

  modal.appendChild(contentWrap);
  overlay.appendChild(modal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  sidebar.appendChild(overlay);
}

function buildOptionsUI(container) {
  if (!document.getElementById('perplexity-options-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'perplexity-options-style';
    styleEl.textContent = `
      .setting-item{margin:15px 0;display:flex;align-items:center;justify-content:space-between;font-family:'FKGrotesk-Regular',sans-serif} .setting-item p{font-size:14px;margin:0}
      .switch{position:relative;display:inline-block;width:50px;height:24px}.switch input{opacity:0;width:0;height:0}.toggle{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.4s;border-radius:24px}.toggle:before{position:absolute;content:"";height:16px;width:16px;left:4px;bottom:4px;background-color:#fff;transition:.4s;border-radius:50%} input:checked+.toggle{background-color:#40a0b0} input:checked+.toggle:before{transform:translateX(26px)}
      .platform-item{display:flex;align-items:center;gap:6px;margin:8px 0;cursor:pointer;user-select:none;font-family:'FKGrotesk-Regular',sans-serif;font-size:13px;color:#333;width:fit-content} .platform-item img{width:18px;height:18px}
      .platform-item.disabled{color:#999;text-decoration:line-through;text-decoration-color:#999;text-decoration-thickness:2px}
      .platform-item.disabled img{filter:grayscale(100%);opacity:.6}
      .platform-item:not(.disabled):hover{text-decoration:line-through;text-decoration-color:#40a0b0;text-decoration-thickness:2px}
      .platform-item.disabled:hover{color:#40a0b0;text-decoration:line-through;text-decoration-color:#40a0b0;text-decoration-thickness:2px}
      .range-container{width:100%;margin-top:5px}.range-slider{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:#d3d3d3;outline:none}.range-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#40a0b0;cursor:pointer}
      .range-values{display:flex;justify-content:space-between;font-size:12px;color:#666;margin-top:5px}
      .width-value{font-size:13px;color:#40a0b0;font-weight:bold;text-align:center;margin-top:5px}
      .restore-button{background-color:#f1f1f1;border:none;color:#333;padding:8px 14px;font-family:'FKGrotesk-Regular',sans-serif;font-size:13px;cursor:pointer;border-radius:4px;transition:all .3s ease}
      .restore-button:hover{background-color:#e0e0e0;color:#40a0b0}
      .more-options-toggle{margin:20px 0 10px;font-size:14px;color:#40a0b0;cursor:pointer;user-select:none;display:flex;align-items:center;gap:4px}
      .footer{display:flex;justify-content:center;margin-top:20px}
      .kbd{font-family:'FKGrotesk-Regular',sans-serif;font-size:13px;padding:4px 8px;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;color:#333;white-space:nowrap}
    `;
    document.head.appendChild(styleEl);
  }

  const extURL = (p) => getExtensionURL(p);

  container.innerHTML = `
    <div class="setting-item">
      <p>Auto-expand sidebar</p>
      <label class="switch"><input type="checkbox" id="autoExpandSidebar"><span class="toggle"></span></label>
    </div>
    <div class="setting-item"><p>Keyboard shortcut</p><div class="kbd" id="perpKeyboardShortcut"></div></div>
    <h3 style="margin:20px 0 8px 0;font-size:14px;font-weight:bold;color:#333;font-family:'FKGrotesk-Regular',sans-serif;">Supported websites <span style="font-size:12px;color:#40a0b0;font-weight:normal;">(click to toggle)</span></h3>
    <div class="platform-item" data-key="googleSearch"><img src="${extURL('assets/icons/google.svg')}" alt="Google"/><span>Google search</span></div>
    <div class="platform-item" data-key="youtubeVideoSummaries"><img src="${extURL('assets/icons/youtube.svg')}" alt="YouTube"/><span>YouTube video summaries</span></div>
    <div class="platform-item" data-key="duckduckgoSearch"><img src="${extURL('assets/icons/duckduckgo.svg')}" alt="DuckDuckGo"/><span>DuckDuckGo search</span></div>
    <div class="platform-item" data-key="braveSearch"><img src="${extURL('assets/icons/brave.svg')}" alt="Brave"/><span>Brave search</span></div>
    <div class="more-options-toggle" id="moreOptionsToggle">More options ▸</div>
    <div id="moreOptionsSection" style="display:none;">
      <div class="setting-item"><p>Show sidebar button</p><select id="showSidebarButtonMode" style="font-family:'FKGrotesk-Regular',sans-serif;font-size:13px;padding:4px 6px;border:1px solid #ccc;border-radius:4px;width:150px;"><option value="never">Never</option><option value="supported">Only on supported websites</option></select></div>
      <div class="setting-item" style="flex-direction:column;align-items:flex-start;">
        <p>Default sidebar width</p>
        <div class="range-container"><input type="range" min="300" max="700" value="430" class="range-slider" id="sidebarWidth"><div class="width-value"><span id="widthValue">430</span>px</div></div>
      </div>
      <div class="footer"><button id="restoreDefaults" class="restore-button">Restore Defaults</button></div>
    </div>
  `;

  const autoExpandCheckbox = container.querySelector('#autoExpandSidebar');
  const widthSlider = container.querySelector('#sidebarWidth');
  const widthValue = container.querySelector('#widthValue');
  const showSidebarSelect = container.querySelector('#showSidebarButtonMode');
  const platformItems = container.querySelectorAll('.platform-item');
  const moreOptionsToggle = container.querySelector('#moreOptionsToggle');
  const moreOptionsSection = container.querySelector('#moreOptionsSection');
  const restoreBtn = container.querySelector('#restoreDefaults');

  moreOptionsToggle.addEventListener('click', () => {
    const hidden = moreOptionsSection.style.display === 'none';
    moreOptionsSection.style.display = hidden ? 'block' : 'none';
    moreOptionsToggle.textContent = hidden ? 'More options ▾' : 'More options ▸';
  });

  widthSlider.addEventListener('input', () => (widthValue.textContent = widthSlider.value));

  autoExpandCheckbox.addEventListener('change', saveSettings);
  widthSlider.addEventListener('change', saveSettings);
  showSidebarSelect.addEventListener('change', saveSettings);
  platformItems.forEach(item => item.addEventListener('click', () => { item.classList.toggle('disabled'); saveSettings(); }));

  restoreBtn.addEventListener('click', () => {
    Object.assign(currentSettings, DEFAULT_SETTINGS);
    applySettingsToUI();
    saveSettings();
  });

  const storage = chrome.storage.local;
  let currentSettings = { ...DEFAULT_SETTINGS };

  function applySettingsToUI() {
    autoExpandCheckbox.checked = currentSettings.autoExpandSidebar;
    widthSlider.value = currentSettings.sidebarWidth;
    widthValue.textContent = currentSettings.sidebarWidth;
    showSidebarSelect.value = currentSettings.showSidebarButtonMode || 'supported';
    platformItems.forEach(item => {
      const key = item.dataset.key;
      const enabled = currentSettings[key];
      if (!enabled) item.classList.add('disabled'); else item.classList.remove('disabled');
    });
  }

  function saveSettings() {
    currentSettings = {
      autoExpandSidebar: autoExpandCheckbox.checked,
      googleSearch: !container.querySelector('[data-key="googleSearch"]').classList.contains('disabled'),
      youtubeVideoSummaries: !container.querySelector('[data-key="youtubeVideoSummaries"]').classList.contains('disabled'),
      duckduckgoSearch: !container.querySelector('[data-key="duckduckgoSearch"]').classList.contains('disabled'),
      braveSearch: !container.querySelector('[data-key="braveSearch"]').classList.contains('disabled'),
      sidebarWidth: parseInt(widthSlider.value),
      showSidebarButtonMode: showSidebarSelect.value
    };
    storage.set({ settings: currentSettings });
  }

  storage.get({ settings: DEFAULT_SETTINGS }, (data) => {
    currentSettings = data && data.settings ? data.settings : DEFAULT_SETTINGS;
    applySettingsToUI();
  });

  const shortcutEl = container.querySelector('#perpKeyboardShortcut');
  if (shortcutEl) {
    const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform);
    shortcutEl.textContent = isMac ? '⌥P' : 'Alt+P';
  }
}

function setupFullscreenHideButton() {
  if (window.perplexityFullscreenListenerInstalled) return;
  window.perplexityFullscreenListenerInstalled = true;

  function fsHandler() {
    const btn = document.getElementById('perplexity-side-button');
    if (!btn) return;
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    if (isFs && isYouTubeVideoPage()) {
      hideSideButton();
    } else {
      ensureSideButtonVisible();
    }
  }

  document.addEventListener('fullscreenchange', fsHandler);
  document.addEventListener('webkitfullscreenchange', fsHandler);
}

setupFullscreenHideButton();