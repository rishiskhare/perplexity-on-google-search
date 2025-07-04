document.addEventListener('DOMContentLoaded', () => {
  const toggles = document.querySelectorAll('.toggle');
  const widthSlider = document.getElementById('sidebarWidth');
  const widthValue = document.getElementById('widthValue');
  const autoExpandSidebar = document.getElementById('autoExpandSidebar');
  const platformItems = document.querySelectorAll('.platform-item');
  const moreOptionsToggle = document.getElementById('moreOptionsToggle');
  const moreOptionsSection = document.getElementById('moreOptionsSection');
  const showSidebarButtonMode = document.getElementById('showSidebarButtonMode');

  const storageArea = chrome.storage?.local;

  if (toggles.length) toggles.forEach(t => (t.style.transition = 'none'));

  const DEFAULT_SETTINGS = {
    autoExpandSidebar: false,
    googleSearch: true,
    youtubeVideoSummaries: true,
    duckduckgoSearch: true,
    braveSearch: true,
    showSidebarButtonMode: 'supported',
    sidebarWidth: 430
  };

  function applySettingsToUI(settings) {
    autoExpandSidebar.checked = settings.autoExpandSidebar;
    widthSlider.value = settings.sidebarWidth;
    widthValue.textContent = settings.sidebarWidth;
    showSidebarButtonMode.value = settings.showSidebarButtonMode || 'supported';

    platformItems.forEach(item => {
      const key = item.dataset.key;
      const enabled = settings[key];
      if (!enabled) item.classList.add('disabled'); else item.classList.remove('disabled');
    });
  }

  function loadSettings() {
    storageArea.get({ settings: DEFAULT_SETTINGS }, data => {
      const settings = (data && data.settings) ? data.settings : DEFAULT_SETTINGS;
      applySettingsToUI(settings);
      setTimeout(() => toggles.forEach(t => (t.style.transition = '.4s')), 100);
    });
  }

  function saveSettings() {
    const newSettings = {
      autoExpandSidebar: autoExpandSidebar.checked,
      googleSearch: !document.querySelector('[data-key="googleSearch"]').classList.contains('disabled'),
      youtubeVideoSummaries: !document.querySelector('[data-key="youtubeVideoSummaries"]').classList.contains('disabled'),
      duckduckgoSearch: !document.querySelector('[data-key="duckduckgoSearch"]').classList.contains('disabled'),
      braveSearch: !document.querySelector('[data-key="braveSearch"]').classList.contains('disabled'),
      sidebarWidth: parseInt(widthSlider.value, 10),
      showSidebarButtonMode: showSidebarButtonMode.value
    };
    storageArea.set({ settings: newSettings });
  }

  autoExpandSidebar.addEventListener('change', saveSettings);
  widthSlider.addEventListener('input', () => (widthValue.textContent = widthSlider.value));
  widthSlider.addEventListener('change', saveSettings);
  showSidebarButtonMode.addEventListener('change', saveSettings);
  platformItems.forEach(item => item.addEventListener('click', () => { item.classList.toggle('disabled'); saveSettings(); }));
  document.getElementById('restoreDefaults').addEventListener('click', () => { applySettingsToUI(DEFAULT_SETTINGS); saveSettings(); });
  if (moreOptionsToggle) {
    moreOptionsToggle.addEventListener('click', () => {
      const hidden = moreOptionsSection.style.display === 'none';
      moreOptionsSection.style.display = hidden ? 'block' : 'none';
      moreOptionsToggle.textContent = hidden ? 'More options ▾' : 'More options ▸';
    });
  }

  loadSettings();
}); 