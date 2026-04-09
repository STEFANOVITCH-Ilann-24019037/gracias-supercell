const RAW_GITHUB_BASE_URL =
  'https://raw.githubusercontent.com/STEFANOVITCH-Ilann-24019037/gracias-supercell/refs/heads/main/';

let playersDataCache = null;
let usersDataCache = null;

/**
 * Builds an absolute raw GitHub URL from a repository-relative path.
 * @param {string} relativePath - Relative file path inside the repository.
 * @returns {string} The fully qualified raw GitHub URL.
 */
const buildRawUrl = (relativePath) => `${RAW_GITHUB_BASE_URL}${relativePath}`;

/**
 * Fetches a JSON resource from the raw GitHub repository.
 * @param {string} relativePath - Relative path to the JSON file.
 * @returns {Promise<unknown>} The parsed JSON payload.
 */
const fetchJson = async (relativePath) => {
  const response = await fetch(buildRawUrl(relativePath));

  if (!response.ok) {
    throw new Error(`Failed to load ${relativePath} (${response.status} ${response.statusText})`);
  }

  return response.json();
};

/**
 * Normalizes a player hashtag into the raw API filename suffix.
 * @param {string} playerTag - Player hashtag with or without the leading #.
 * @returns {string|null} The normalized tag, or null when invalid.
 */
const normalizePlayerTag = (playerTag) => {
  const normalizedTag = String(playerTag || '').trim().replace(/^#/, '').toUpperCase();
  return normalizedTag || null;
};

/**
 * Loads and caches the player data set used by the application.
 * The data is fetched dynamically from the raw GitHub repository.
 * @returns {Promise<Object>} Resolves to the cached player data object.
 */
export const loadPlayersData = async () => {
  if (playersDataCache) {
    return playersDataCache;
  }

  try {
    const [brawlersData, playersConfig] = await Promise.all([
      fetchJson('data/api/apibrawlers.json'),
      fetchJson('data/api/playersConfig.json'),
    ]);

    const playersMap = {};
    const playerEntries = Array.isArray(playersConfig?.players) ? playersConfig.players : [];

    await Promise.all(
      playerEntries.map(async (player) => {
        if (!player?.tag || !player?.filename) {
          return;
        }

        try {
          const playerData = await fetchJson(`data/api/${player.filename}`);
          playersMap[player.tag] = playerData;
        } catch (error) {
          console.warn(`Unable to load player ${player.tag}: ${error.message}`);
        }
      })
    );

    playersDataCache = {
      brawlers: brawlersData || { items: [] },
      player1: playersMap.QLVP829R || {},
      player2: playersMap.VU02GGJQ || {},
      playersMap,
      playersConfig,
    };

    console.log('Player data loaded successfully');
    console.log(`   Brawlers: ${playersDataCache.brawlers?.items?.length || 0}`);
    return playersDataCache;
  } catch (error) {
    console.error('Error while loading player data:', error.message);
    return { brawlers: { items: [] }, player1: {}, player2: {}, playersMap: {}, playersConfig: null };
  }
};

/**
 * Returns the cached player data if it has already been loaded.
 * @returns {Object|null} The cached player data, or null when unavailable.
 */
export const getPlayersData = () => playersDataCache;

/**
 * Fetches a player profile from the raw GitHub repository.
 * @param {string} playerTag - Player hashtag with or without the leading #.
 * @returns {Promise<Object|null>} The resolved player data, or null when not found.
 */
export const loadPlayerFromJSON = async (playerTag) => {
  const normalizedTag = normalizePlayerTag(playerTag);

  if (!normalizedTag) {
    return null;
  }

  try {
    return await fetchJson(`data/api/api${normalizedTag}player.json`);
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }

    throw new Error(`Unable to load player ${normalizedTag}: ${error.message}`);
  }
};

/**
 * Loads and caches the account user data from the raw GitHub repository.
 * @returns {Promise<Array<Object>>} The account user list.
 */
export const loadUsersData = async () => {
  if (usersDataCache) {
    return usersDataCache;
  }

  const usersData = await fetchJson('data/account/users.json');
  usersDataCache = Array.isArray(usersData) ? usersData : [];
  return usersDataCache;
};

/**
 * Clears the in-memory data caches.
 */
export const resetPlayersData = () => {
  playersDataCache = null;
  usersDataCache = null;
};

