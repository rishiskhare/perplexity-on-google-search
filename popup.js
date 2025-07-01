document.addEventListener('DOMContentLoaded', function() {

    const toggles = document.querySelectorAll('.toggle');
    const widthSlider = document.getElementById('sidebarWidth');
    const widthValue = document.getElementById('widthValue');
    const autoExpandSidebar = document.getElementById('autoExpandSidebar');
    const platformItems = document.querySelectorAll('.platform-item');
    const moreOptionsToggle = document.getElementById('moreOptionsToggle');
    const moreOptionsSection = document.getElementById('moreOptionsSection');

    const storageArea = chrome.storage.local;

    if (toggles.length) {
        toggles.forEach(t => t.style.transition = 'none');
    }

    storageArea.get({
        settings: DEFAULT_SETTINGS
    }, function(data) {
        const settings = (data && data.settings) ? data.settings : DEFAULT_SETTINGS;
        autoExpandSidebar.checked = settings.autoExpandSidebar;
        platformItems.forEach(item => {
            const key = item.dataset.key;
            const enabled = settings[key];
            if (!enabled) {
                item.classList.add('disabled');
            } else {
                item.classList.remove('disabled');
            }
        });

        if (settings.sidebarWidth) {
            widthSlider.value = settings.sidebarWidth;
            widthValue.textContent = settings.sidebarWidth;
        }

        setTimeout(() => {
            if (toggles.length) {
                toggles.forEach(t => t.style.transition = '.4s');
            }
        }, 100);
    });

    autoExpandSidebar.addEventListener('change', saveSettings);

    platformItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('disabled');
            saveSettings();
        });
    });

    widthSlider.addEventListener('input', function() {
        widthValue.textContent = this.value;
    });

    widthSlider.addEventListener('change', function() {
        saveSettings();
    });

    document.getElementById('restoreDefaults').addEventListener('click', function() {
        autoExpandSidebar.checked = DEFAULT_SETTINGS.autoExpandSidebar;
        platformItems.forEach(item => {
            const key = item.dataset.key;
            const enabled = DEFAULT_SETTINGS[key];
            if (!enabled) {
                item.classList.add('disabled');
            } else {
                item.classList.remove('disabled');
            }
        });
        widthSlider.value = DEFAULT_SETTINGS.sidebarWidth;
        widthValue.textContent = DEFAULT_SETTINGS.sidebarWidth;

        saveSettings();
    });

    if (moreOptionsToggle && moreOptionsSection) {
        moreOptionsToggle.addEventListener('click', () => {
            const isHidden = moreOptionsSection.style.display === 'none';
            moreOptionsSection.style.display = isHidden ? 'block' : 'none';
            moreOptionsToggle.textContent = isHidden ? 'More options ▾' : 'More options ▸';
        });
    }

    function saveSettings() {
        storageArea.set({
            settings: {
                autoExpandSidebar: autoExpandSidebar.checked,
                googleSearch: !document.querySelector('[data-key="googleSearch"]').classList.contains('disabled'),
                sidebarWidth: parseInt(widthSlider.value),
                youtubeVideoSummaries: !document.querySelector('[data-key="youtubeVideoSummaries"]').classList.contains('disabled'),
                duckduckgoSearch: !document.querySelector('[data-key="duckduckgoSearch"]').classList.contains('disabled'),
                braveSearch: !document.querySelector('[data-key="braveSearch"]').classList.contains('disabled')
            }
        });
    }
});