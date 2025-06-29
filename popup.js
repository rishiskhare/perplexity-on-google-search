document.addEventListener('DOMContentLoaded', function() {
    const DEFAULT_SETTINGS = {
        autoExpandSidebar: false,
        sidebarWidth: 400
    };

    const toggle = document.querySelector('.toggle');
    const widthSlider = document.getElementById('sidebarWidth');
    const widthValue = document.getElementById('widthValue');
    const autoExpandSidebar = document.getElementById('autoExpandSidebar');

    const storageArea = chrome.storage.local;

    if (toggle) {
        toggle.style.transition = 'none';
    }

    storageArea.get({
        settings: DEFAULT_SETTINGS
    }, function(data) {
        const settings = (data && data.settings) ? data.settings : DEFAULT_SETTINGS;
        autoExpandSidebar.checked = settings.autoExpandSidebar;

        if (settings.sidebarWidth) {
            widthSlider.value = settings.sidebarWidth;
            widthValue.textContent = settings.sidebarWidth;
        }

        setTimeout(() => {
            if (toggle) {
                toggle.style.transition = '.4s';
            }
        }, 100);
    });

    autoExpandSidebar.addEventListener('change', function() {
        saveSettings();
    });

    widthSlider.addEventListener('input', function() {
        widthValue.textContent = this.value;
    });

    widthSlider.addEventListener('change', function() {
        saveSettings();
    });

    document.getElementById('restoreDefaults').addEventListener('click', function() {
        autoExpandSidebar.checked = DEFAULT_SETTINGS.autoExpandSidebar;
        widthSlider.value = DEFAULT_SETTINGS.sidebarWidth;
        widthValue.textContent = DEFAULT_SETTINGS.sidebarWidth;

        saveSettings();
    });

    function saveSettings() {
        storageArea.set({
            settings: {
                autoExpandSidebar: autoExpandSidebar.checked,
                sidebarWidth: parseInt(widthSlider.value)
            }
        });
    }
});