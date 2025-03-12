document.addEventListener('DOMContentLoaded', function() {
    const DEFAULT_SETTINGS = {
        autoExpandSidebar: false,
        sidebarWidth: 400
    };

    const toggle = document.querySelector('.toggle');
    const widthSlider = document.getElementById('sidebarWidth');
    const widthValue = document.getElementById('widthValue');
    const autoExpandSidebar = document.getElementById('autoExpandSidebar');

    if (toggle) {
        toggle.style.transition = 'none';
    }

    chrome.storage.sync.get({
        settings: DEFAULT_SETTINGS
    }, function(data) {
        autoExpandSidebar.checked = data.settings.autoExpandSidebar;

        if (data.settings.sidebarWidth) {
            widthSlider.value = data.settings.sidebarWidth;
            widthValue.textContent = data.settings.sidebarWidth;
        }

        setTimeout(() => {
            if (toggle) {
                toggle.style.transition = '.4s'; // Restore the original transition
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
        chrome.storage.sync.set({
            settings: {
                autoExpandSidebar: autoExpandSidebar.checked,
                sidebarWidth: parseInt(widthSlider.value)
            }
        });
    }
});