const SIDEBAR_CONFIG = {
  DEFAULT_WIDTH: '400px',
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

function createPerplexitySidebar() {
  const query = new URLSearchParams(window.location.search).get('q') || '';
  const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;

  const sidebar = createSidebarElement();
  const headerSection = createHeaderSection();
  const closeButton = createCloseButton();
  const contentContainer = createContentContainer();
  const resizeHandle = createResizeHandle();
  const iframe = createIframe(perplexityUrl);

  headerSection.appendChild(closeButton);
  contentContainer.appendChild(iframe);
  sidebar.appendChild(resizeHandle);
  sidebar.appendChild(headerSection);
  sidebar.appendChild(contentContainer);
  document.body.appendChild(sidebar);

  setupResizeFunctionality(sidebar, resizeHandle, iframe);
}

function createSidebarElement() {
  const sidebar = document.createElement('div');
  sidebar.id = "perplexity-sidebar";

  Object.assign(sidebar.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: SIDEBAR_CONFIG.DEFAULT_WIDTH,
    height: "100%",
    backgroundColor: "#fff",
    boxShadow: "-2px 0 5px rgba(0,0,0,0.3)",
    zIndex: SIDEBAR_CONFIG.Z_INDEX,
    display: "flex",
    flexDirection: "column",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease"
  });

  return sidebar;
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
    if (sideButton) sideButton.style.display = "flex";
  });

  return closeButton;
}

function createContentContainer() {
  const contentContainer = document.createElement('div');

  Object.assign(contentContainer.style, {
    flex: "1",
    position: "relative",
    width: "100%"
  });

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

  resizeHandle.addEventListener('mousedown', () => {
    resizeHandle.style.opacity = "0.7";
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

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    startWidth = parseInt(sidebar.style.width);

    iframe.style.pointerEvents = 'none';

    document.addEventListener('mousemove', resizePanel);
    document.addEventListener('mouseup', stopResize);
  });

  function resizePanel(e) {
    const calculatedWidth = startWidth + (startX - e.clientX);

    if (calculatedWidth < SIDEBAR_CONFIG.CLOSE_THRESHOLD) {
      sidebar.dataset.closeOnMouseUp = "true";
    } else {
      sidebar.dataset.closeOnMouseUp = "false";
      sidebar.style.width = `${Math.max(SIDEBAR_CONFIG.MIN_WIDTH, calculatedWidth)}px`;
    }
  }

  function stopResize() {
    document.removeEventListener('mousemove', resizePanel);
    document.removeEventListener('mouseup', stopResize);

    if (sidebar.dataset.closeOnMouseUp === "true") {
      sidebar.style.transform = "translateX(100%)";

      const sideButton = document.getElementById("perplexity-side-button");
      if (sideButton) sideButton.style.display = "flex";
    }

    iframe.style.pointerEvents = 'auto';
  }
}

function addPerplexitySideButton() {
  addCustomFont();

  const button = createSideButton();
  const logoImg = createLogoImage();
  const buttonText = createButtonText();

  button.appendChild(logoImg);
  button.appendChild(buttonText);
  document.body.appendChild(button);

  setupButtonInteractions(button, logoImg, buttonText);
}

function addCustomFont() {
  const fontFaceStyle = document.createElement('style');
  fontFaceStyle.textContent = `
    @font-face {
      font-family: 'FKGrotesk-Regular';
      src: url('${chrome.runtime.getURL('FKGrotesk-Regular.ttf')}') format('truetype');
      font-style: normal;
    }
  `;
  document.head.appendChild(fontFaceStyle);
}

function createLogoImage() {
  const logoImg = document.createElement('img');
  logoImg.src = chrome.runtime.getURL('perplexity-logo.webp');
  logoImg.alt = "Perplexity";

  Object.assign(logoImg.style, {
    width: "40px",
    height: "40px",
    marginRight: "0",
    transition: "margin-right 0.3s ease"
  });

  return logoImg;
}

function createSideButton() {
  const button = document.createElement('div');
  button.id = "perplexity-side-button";

  Object.assign(button.style, {
    position: "fixed",
    top: "50%",
    right: "0",
    transform: "translateY(-50%)",
    width: "70px",
    height: "70px",
    borderRadius: "35px 0 0 35px",
    backgroundColor: COLORS.primary,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: "9999",
    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
    transition: "width 0.3s ease, padding 0.3s ease",
    paddingRight: "10px",
    overflow: "hidden"
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

function setupButtonInteractions(button, logoImg, buttonText) {
  button.addEventListener('mouseover', () => {
    button.style.width = "248px";
    button.style.justifyContent = "flex-start";
    button.style.paddingLeft = "15px";
    logoImg.style.marginRight = "10px";
    buttonText.style.opacity = "1";
    buttonText.style.maxWidth = "200px";
  });

  button.addEventListener('mouseout', () => {
    button.style.width = "70px";
    button.style.justifyContent = "center";
    button.style.paddingLeft = "0";
    logoImg.style.marginRight = "0";
    buttonText.style.opacity = "0";
    buttonText.style.maxWidth = "0";
  });

  button.addEventListener("click", toggleSidebar);
}

function toggleSidebar() {
  const sidebar = document.getElementById("perplexity-sidebar");
  const button = document.getElementById("perplexity-side-button");

  if (!sidebar) return;

  const isVisible = sidebar.style.transform === "translateX(0px)" ||
                    sidebar.style.transform === "translateX(0)";

  if (isVisible) {
    sidebar.style.transform = "translateX(100%)";
    button.style.display = "flex";
  } else {
    sidebar.style.width = SIDEBAR_CONFIG.DEFAULT_WIDTH;
    sidebar.style.transform = "translateX(0)";
    button.style.display = "none";
  }
}

createPerplexitySidebar();
addPerplexitySideButton();