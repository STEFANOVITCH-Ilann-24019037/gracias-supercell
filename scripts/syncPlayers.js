#!/usr/bin/env node

/**
 * syncPlayers.js
 *
 * Synchronise automatiquement playersList.js selon playersConfig.json
 *
 * Workflow:
 * 1. Lire playersConfig.json
 * 2. Scanner les fichiers api*player.json
 * 3. Générer les imports automatiquement
 * 4. Réécrire playersList.js
 *
 * Usage: npm run sync-players
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../data/api');
const CONFIG_FILE = path.join(API_DIR, 'playersConfig.json');
const PLAYERS_LIST_FILE = path.join(API_DIR, 'playersList.js');

console.log('🔄 Synchronisation des joueurs...\n');

try {
  // Lire playersConfig.json
  const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
  const playersConfig = JSON.parse(configContent);

  if (!playersConfig.players || !Array.isArray(playersConfig.players)) {
    throw new Error('playersConfig.json invalide - pas de tableau "players"');
  }

  // Vérifier que tous les fichiers existent
  const validPlayers = playersConfig.players.filter(player => {
    const filePath = path.join(API_DIR, player.filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Fichier manquant: ${player.filename} (joueur: ${player.tag})`);
      return false;
    }
    return true;
  });

  // Générer les imports
  let imports = validPlayers.map(player => {
    const filename = player.filename;
    const varName = filename.replace('.json', '').replace(/-/g, '_');
    return `import ${varName} from './${filename}';`;
  }).join('\n');

  // Générer le dictionnaire
  let dictEntries = validPlayers.map(player => {
    const filename = player.filename;
    const varName = filename.replace('.json', '').replace(/-/g, '_');
    return `  '${filename}': ${varName},`;
  }).join('\n');

  // Générer le code de chargement
  const playersList = `/**
 * playersList.js - AUTO-GÉNÉRÉ
 * 
 * ⚠️ GÉNÉRATION AUTOMATIQUE - NE PAS MODIFIER!
 * 
 * Pour ajouter un joueur:
 * 1. Créer: data/api/api + TAG + player.json
 * 2. Ajouter dans playersConfig.json
 * 3. EXÉCUTER: npm run sync-players
 * 
 * C'est tout!
 */

import playersConfig from './playersConfig.json';

// AUTO-IMPORT: Tous les fichiers joueurs sont importés ici
// Cette section est régénérée automatiquement
${imports}

/**
 * Dictionnaire AUTO-GÉNÉRÉ de tous les joueurs
 */
const allImports = {
${dictEntries}
};

/**
 * Charge la liste des joueurs depuis playersConfig.json
 * Les joueurs dans playersConfig.json sont automatiquement détectés
 */
const buildPlayersList = () => {
  const playersList = {};
  
  if (!playersConfig.players) {
    console.error('playersConfig.json invalide - pas de clé "players"');
    return playersList;
  }
  
  playersConfig.players.forEach(player => {
    if (!player.filename) {
      console.warn(\`Joueur \${player.tag} n'a pas de filename dans playersConfig.json\`);
      return;
    }
    
    if (allImports[player.filename]) {
      playersList[player.tag] = allImports[player.filename];
      console.log(\`✅ Joueur chargé: \${player.tag}\`);
    } else {
      console.warn(\`⚠️  Fichier \${player.filename} non trouvé - vérifiez playersConfig.json\`);
    }
  });
  
  return playersList;
};

export default buildPlayersList();
`;

  // Écrire le fichier
  fs.writeFileSync(PLAYERS_LIST_FILE, playersList);

  console.log('✅ playersList.js synchronisé avec succès!\n');
  console.log(`📊 ${validPlayers.length} joueur(s) chargé(s):`);
  validPlayers.forEach(player => {
    console.log(`   ✅ ${player.tag} (${player.filename})`);
  });

  if (playersConfig.players.length > validPlayers.length) {
    console.log(`\n⚠️  ${playersConfig.players.length - validPlayers.length} joueur(s) manquant(s)`);
  }

} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
