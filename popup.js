document.addEventListener('DOMContentLoaded', function() {

    const toggles = document.querySelectorAll('.toggle');
    const widthSlider = document.getElementById('sidebarWidth');
    const widthValue = document.getElementById('widthValue');
    const autoExpandSidebar = document.getElementById('autoExpandSidebar');
    const youtubeSummaries = document.getElementById('youtubeSummaries');

    const storageArea = chrome.storage.local;

    if (toggles.length) {
        toggles.forEach(t => t.style.transition = 'none');
    }

    storageArea.get({
        settings: DEFAULT_SETTINGS
    }, function(data) {
        const settings = (data && data.settings) ? data.settings : DEFAULT_SETTINGS;
        autoExpandSidebar.checked = settings.autoExpandSidebar;
        youtubeSummaries.checked = settings.youtubeVideoSummaries;

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
    youtubeSummaries.addEventListener('change', saveSettings);

    widthSlider.addEventListener('input', function() {
        widthValue.textContent = this.value;
    });

    widthSlider.addEventListener('change', function() {
        saveSettings();
    });

    document.getElementById('restoreDefaults').addEventListener('click', function() {
        autoExpandSidebar.checked = DEFAULT_SETTINGS.autoExpandSidebar;
        youtubeSummaries.checked = DEFAULT_SETTINGS.youtubeVideoSummaries;
        widthSlider.value = DEFAULT_SETTINGS.sidebarWidth;
        widthValue.textContent = DEFAULT_SETTINGS.sidebarWidth;

        saveSettings();
    });

    function saveSettings() {
        storageArea.set({
            settings: {
                autoExpandSidebar: autoExpandSidebar.checked,
                sidebarWidth: parseInt(widthSlider.value),
                youtubeVideoSummaries: youtubeSummaries.checked
            }
        });
    }
});