// Service for loading player data.
// Imports directly from dataExport (works on Web and React Native).

import { brawlersData, playersDataMap } from '../../data/api/dataExport';

let playersData = null;

/**
 * Loads and caches the player data set used by the application.
 * @returns {Promise<Object>} Resolves to the cached player data object.
 */
export const loadPlayersData = async () => {
  if (playersData) {
    return playersData;
  }

  try {
    // The data is already imported above.
    playersData = {
      brawlers: brawlersData || { items: [] },
      player1: playersDataMap?.QLVP829R || {},
      player2: playersDataMap?.VU02GGJQ || {},
      playersMap: playersDataMap || {},
    };

    console.log('Player data loaded successfully');
    console.log(`   Brawlers: ${brawlersData?.items?.length || 0}`);
    return playersData;
  } catch (error) {
    console.error('Error while loading player data:', error.message);
    // Return empty data if loading fails.
    return { brawlers: { items: [] }, player1: {}, player2: {}, playersMap: {} };
  }
};

/**
 * Returns the cached player data if it has already been loaded.
 * @returns {Object|null} The cached player data, or null when unavailable.
 */
export const getPlayersData = () => {
  return playersData;
};

/**
 * Clears the in-memory player data cache.
 */
export const resetPlayersData = () => {
  playersData = null;
};

