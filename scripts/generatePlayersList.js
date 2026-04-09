#!/usr/bin/env node

/**
 * generatePlayersList.js
 *
 * Generates a remote-fetch players list helper that reads data directly from
 * the raw GitHub repository instead of importing local JSON files.
 *
 * Usage: node scripts/generatePlayersList.js
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../data/api');
const OUTPUT_FILE = path.join(API_DIR, 'playersList.js');

const content = [
  "const RAW_GITHUB_BASE_URL = 'https://raw.githubusercontent.com/STEFANOVITCH-Ilann-24019037/gracias-supercell/refs/heads/main/';",
  '',
  '/**',
  ' * Builds an absolute raw GitHub URL from a repository-relative path.',
  ' * @param {string} relativePath - Relative file path inside the repository.',
  ' * @returns {string} The fully qualified raw GitHub URL.',
  ' */',
  'const buildRawUrl = (relativePath) => RAW_GITHUB_BASE_URL + relativePath;',
  '',
  '/**',
  ' * Fetches a JSON resource from the raw GitHub repository.',
  ' * @param {string} relativePath - Relative path to the JSON file.',
  ' * @returns {Promise<unknown>} The parsed JSON payload.',
  ' */',
  'const fetchJson = async (relativePath) => {',
  '  const response = await fetch(buildRawUrl(relativePath));',
  '',
  '  if (!response.ok) {',
  "    throw new Error('Failed to load ' + relativePath + ' (' + response.status + ' ' + response.statusText + ')');",
  '  }',
  '',
  '  return response.json();',
  '};',
  '',
  '/**',
  ' * Loads the full remote players list.',
  ' * @returns {Promise<Record<string, unknown>>} The player lookup table keyed by tag.',
  ' */',
  'const loadPlayersList = async () => {',
  "  const playersConfig = await fetchJson('data/api/playersConfig.json');",
  '  const playersList = {};',
  '  const players = Array.isArray(playersConfig?.players) ? playersConfig.players : [];',
  '',
  '  await Promise.all(',
  '    players.map(async (player) => {',
  '      if (!player?.tag || !player?.filename) {',
  '        return;',
  '      }',
  '',
  '      try {',
  "        playersList[player.tag] = await fetchJson('data/api/' + player.filename);",
  '      } catch (error) {',
  "        console.warn('Unable to load player ' + player.tag + ': ' + error.message);",
  '      }',
  '    })',
  '  );',
  '',
  '  return playersList;',
  '};',
  '',
  'export default loadPlayersList;',
  '',
].join('\n');

fs.writeFileSync(OUTPUT_FILE, content);
console.log('Generated playersList.js with remote fetch support.');
