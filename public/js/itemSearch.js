// Item Search Module - Search for players by item name

const ItemSearch = {
  gameServerId: null,
  currentItemName: null,
  currentResults: [],

  init(gameServerId) {
    this.gameServerId = gameServerId;
    this.setupEventListeners();
  },

  setupEventListeners() {
    const searchBtn = document.getElementById('item-search-btn');
    const searchInput = document.getElementById('item-search-input');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.performSearch());
    }

    if (searchInput) {
      // Allow Enter key to trigger search
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
    }

    // Listen for area search clear to reset item search if needed
    const clearAreaBtn = document.getElementById('clear-area-btn');
    if (clearAreaBtn) {
      clearAreaBtn.addEventListener('click', () => {
        // If area is cleared, re-run item search without area filter
        if (this.currentItemName) {
          this.performSearch();
        }
      });
    }
  },

  async performSearch() {
    const searchInput = document.getElementById('item-search-input');
    const itemName = searchInput?.value?.trim();

    if (!itemName) {
      alert('Please enter an item name to search for');
      return;
    }

    if (!this.gameServerId) {
      alert('No game server selected');
      return;
    }

    this.currentItemName = itemName;

    try {
      // Get time range from the time range control
      const { start, end } = TimeRange.getDateRange();

      // Call API to get players with this item
      const results = await API.getPlayersByItem(
        this.gameServerId,
        itemName,
        start.toISOString(),
        end.toISOString()
      );

      this.currentResults = results;

      // If there's an active area search, filter results by area
      let finalResults = results;
      if (window.AreaSearch && AreaSearch.currentShape) {
        finalResults = this.filterResultsByArea(results);
      }

      // Display results
      this.displayResults(finalResults, itemName);
    } catch (error) {
      console.error('Item search failed:', error);
      alert('Item search failed: ' + error.message);
    }
  },

  filterResultsByArea(itemResults) {
    // Filter item search results to only include those in the drawn area
    if (!AreaSearch.currentShape) {
      return itemResults;
    }

    const filtered = [];

    if (AreaSearch.currentShape instanceof L.Rectangle) {
      const bounds = AreaSearch.currentShape.getBounds();
      const sw = GameMap.latLngToGame(bounds.getSouthWest());
      const ne = GameMap.latLngToGame(bounds.getNorthEast());

      const minX = Math.min(sw.x, ne.x);
      const maxX = Math.max(sw.x, ne.x);
      const minZ = Math.min(sw.z, ne.z);
      const maxZ = Math.max(sw.z, ne.z);

      filtered.push(...itemResults.filter(r =>
        r.x >= minX && r.x <= maxX && r.z >= minZ && r.z <= maxZ
      ));
    } else if (AreaSearch.currentShape instanceof L.Circle) {
      const center = GameMap.latLngToGame(AreaSearch.currentShape.getLatLng());
      const radiusLatLng = AreaSearch.currentShape.getRadius();
      const radiusGame = radiusLatLng * GameMap.tileSize;

      filtered.push(...itemResults.filter(r => {
        const dx = r.x - center.x;
        const dz = r.z - center.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance <= radiusGame;
      }));
    }

    return filtered;
  },

  displayResults(results, itemName) {
    if (!results || results.length === 0) {
      alert(`No players found with item: ${itemName}`);
      return;
    }

    // Extract unique player IDs from results
    const playerIds = new Set();
    results.forEach(r => {
      if (r.playerId) {
        playerIds.add(r.playerId);
      }
    });

    // Use PlayerList to filter and display results
    if (window.PlayerList) {
      PlayerList.setAreaFilter(Array.from(playerIds));
      // Also select only these players
      PlayerList.selectOnly(Array.from(playerIds));
    }

    // Show a notification
    const areaText = (window.AreaSearch && AreaSearch.currentShape)
      ? ' in drawn area'
      : '';
    console.log(`Found ${playerIds.size} players with item "${itemName}"${areaText}`);
  },

  clear() {
    this.currentItemName = null;
    this.currentResults = [];
    const searchInput = document.getElementById('item-search-input');
    if (searchInput) {
      searchInput.value = '';
    }
  }
};

window.ItemSearch = ItemSearch;
