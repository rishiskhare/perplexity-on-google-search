const DEFAULT_SETTINGS = {
  autoExpandSidebar: false,
  googleSearch: true,
  youtubeVideoSummaries: true,
  duckduckgoSearch: true,
  braveSearch: true,
  sidebarWidth: 400
};

if (typeof module !== 'undefined') {
  module.exports = DEFAULT_SETTINGS;
} 