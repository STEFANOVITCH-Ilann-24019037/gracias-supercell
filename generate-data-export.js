#!/usr/bin/env node
/**
 * Script pour générer dataExport.js avec les données JSON pré-compilées
 * Cela permet à Expo Web de charger les données sans problème de `__dirname`
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Génération du fichier dataExport.js...\n');

try {
  // Charger tous les fichiers JSON
  const apidir = path.join(__dirname, 'data', 'api');

  const loadJSON = (filename) => {
    const filepath = path.join(apidir, filename);
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  };

  const brawlersData = loadJSON('apibrawlers.json');
  const player1Data = loadJSON('apiQLVP829Rplayer.json');
  const player2Data = loadJSON('apiVU02GGJQplayer.json');
  const player3Data = loadJSON('apiRQPOQOQplayer.json');
  const player4Data = loadJSON('api2PVJU20JQplayer.json');
  const player5Data = loadJSON('api2UVJJPQLGPplayer.json');
  const player6Data = loadJSON('apilgoqjvr2uplayer.json');

  // Générer le contenu du fichier
  const content = `/**
 * Auto-généré par generate-data-export.js
 * Contient les données JSON pré-compilées pour Expo Web
 * NE PAS ÉDITER MANUELLEMENT
 */

export const brawlersData = ${JSON.stringify(brawlersData, null, 2)};

export const playersDataMap = ${JSON.stringify({
    QLVP829R: player1Data,
    VU02GGJQ: player2Data,
    RQPOQOQ: player3Data,
    '2PVJU20JQ': player4Data,
    '2UVJJPQLGP': player5Data,
    LGOQJVR2UP: player6Data,
  }, null, 2)};

export default {
  brawlers: brawlersData,
  players: playersDataMap,
};
`;

  // Écrire le fichier
  const outputPath = path.join(apidir, 'dataExport.js');
  fs.writeFileSync(outputPath, content, 'utf-8');

  console.log('✅ Fichier généré avec succès!');
  console.log(`   Location: ${outputPath}`);
  console.log(`   Brawlers: ${brawlersData.items.length}`);
  console.log(`   Joueurs: 6`);
  console.log('\n✨ Vous pouvez maintenant utiliser npm run web\n');

} catch (error) {
  console.error('❌ Erreur lors de la génération:', error.message);
  process.exit(1);
}

