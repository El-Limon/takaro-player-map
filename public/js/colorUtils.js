// Shared color utilities for player markers and paths

const ColorUtils = {
  // Store custom player colors (playerId -> hex color)
  customColors: {},
  // Cache computed hashes for performance
  hashCache: new Map(),

  // Load custom colors from localStorage
  init() {
    const saved = localStorage.getItem('playerCustomColors');
    if (saved) {
      try {
        this.customColors = JSON.parse(saved);
      } catch (e) {
        this.customColors = {};
      }
    }
  },

  // Save custom colors to localStorage
  saveColors() {
    localStorage.setItem('playerCustomColors', JSON.stringify(this.customColors));
  },

  // Set a custom color for a player
  setCustomColor(playerId, color) {
    this.customColors[String(playerId)] = color;
    this.saveColors();
    // Trigger refresh of markers and paths
    this.notifyColorChange(playerId);
  },

  // Clear custom color for a player (revert to auto)
  clearCustomColor(playerId) {
    delete this.customColors[String(playerId)];
    this.saveColors();
    this.notifyColorChange(playerId);
  },

  // Check if player has custom color
  hasCustomColor(playerId) {
    return String(playerId) in this.customColors;
  },

  // Get custom color or null
  getCustomColor(playerId) {
    return this.customColors[String(playerId)] || null;
  },

  // Notify that a color changed - refresh paths and markers
  notifyColorChange(playerId) {
    // Refresh player markers
    if (window.Players && window.App?.gameServerId) {
      Players.refreshVisibility();
    }
    // Refresh paths if visible
    if (window.History && History.isVisible) {
      History.drawPaths();
    }
  },

  // Calculate hash once and cache it
  _getHash(playerId) {
    const key = String(playerId);
    if (this.hashCache.has(key)) {
      return this.hashCache.get(key);
    }

    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    this.hashCache.set(key, hue);
    return hue;
  },

  // Generate a consistent HSL color for a player based on their ID
  getPlayerColor(playerId) {
    // Check for custom color first
    const custom = this.getCustomColor(playerId);
    if (custom) return custom;

    const hue = this._getHash(playerId);
    return `hsl(${hue}, 70%, 50%)`;
  },

  // Get the auto-generated color (ignoring custom)
  getAutoColor(playerId) {
    const hue = this._getHash(playerId);
    return `hsl(${hue}, 70%, 50%)`;
  },

  // Get hue value for a player (useful for SVG styling)
  getPlayerHue(playerId) {
    return this._getHash(playerId);
  },

  // Offline players use gray
  offlineColor: '#6c757d'
};

// Initialize on load
ColorUtils.init();

window.ColorUtils = ColorUtils;
