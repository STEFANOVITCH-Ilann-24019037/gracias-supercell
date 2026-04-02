#!/usr/bin/env node

/**
 * generatePlayersList.js
 *
 * Script Node.js qui scanne le dossier data/api/
 * et génère automatiquement playersList.js avec tous les imports
 *
 * Usage: node scripts/generatePlayersList.js
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../data/api');
const OUTPUT_FILE = path.join(API_DIR, 'playersList.js');

/**
 * Récupère tous les fichiers api*player.json du dossier
 */
function getPlayerFiles() {
  const files = fs.readdirSync(API_DIR);
  return files.filter(file =>
    file.startsWith('api') &&
    file.endsWith('player.json')
  );
}

/**
 * Extrait le TAG d'un nom de fichier
 * Exemple: apiQLVP829Rplayer.json -> QLVP829R
 */
function extractTag(filename) {
  const match = filename.match(/^api(.+)player\.json$/);
  return match ? match[1] : null;
}

/**
 * Génère le fichier playersList.js automatiquement
 */
function generatePlayersList() {
  const playerFiles = getPlayerFiles();

  if (playerFiles.length === 0) {
    console.warn('⚠️  Aucun fichier api*player.json trouvé dans', API_DIR);
    return;
  }

  // Générer les imports
  let imports = playerFiles.map(file => {
    const tag = extractTag(file);
    const varName = `api${tag}player`;
    return `import ${varName} from './${file}';`;
  }).join('\n');

  // Générer le dictionnaire
  let dictEntries = playerFiles.map(file => {
    const tag = extractTag(file);
    const varName = `api${tag}player`;
    return `  '${tag}': ${varName},`;
  }).join('\n');

  // Générer le fichier
  const content = `/**
 * playersList.js - GÉNÉRÉ AUTOMATIQUEMENT
 * 
 * ⚠️ NE PAS MODIFIER MANUELLEMENT
 * Exécutez: npm run generate-players
 * 
 * Ce fichier est généré par: scripts/generatePlayersList.js
 * Il importe automatiquement tous les fichiers api*player.json
 */

${imports}

/**
 * Dictionnaire de TOUS les joueurs disponibles
 * Format: TAG => données JSON
 */
const playersList = {
${dictEntries}
};

export default playersList;
`;

  fs.writeFileSync(OUTPUT_FILE, content);
  console.log('✅ playersList.js généré avec succès!');
  console.log(`📊 ${playerFiles.length} joueur(s) trouvé(s):`);
  playerFiles.forEach(file => {
    const tag = extractTag(file);
    console.log(`   - ${tag} (${file})`);
  });
}

// Exécuter la génération
generatePlayersList();
