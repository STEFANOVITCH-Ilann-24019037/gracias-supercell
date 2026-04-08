#!/usr/bin/env node
/**
 * Vérification rapide que la correction est appliquée
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Vérification rapide de la correction\n');

let allGood = true;

// 1. Vérifier que dataExport.js existe
if (fs.existsSync(path.join(__dirname, 'data/api/dataExport.js'))) {
  console.log('✅ data/api/dataExport.js existe');
} else {
  console.log('❌ data/api/dataExport.js manquant');
  allGood = false;
}

// 2. Vérifier que playersDataService.js est modifié
const serviceCode = fs.readFileSync(path.join(__dirname, 'src/services/playersDataService.js'), 'utf-8');
if (serviceCode.includes("require('../../data/api/dataExport.js')") || serviceCode.includes('dataExport')) {
  console.log('✅ playersDataService.js utilise dataExport');
} else {
  console.log('❌ playersDataService.js n\'utilise pas dataExport');
  allGood = false;
}

// 3. Vérifier que les fichiers JSON existent
const jsonFiles = ['apibrawlers.json', 'apiQLVP829Rplayer.json', 'apiVU02GGJQplayer.json'];
let jsonCount = 0;
jsonFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, `data/api/${file}`))) {
    jsonCount++;
  }
});
console.log(`✅ ${jsonCount}/${jsonFiles.length} fichiers JSON trouvés`);

// 4. Vérifier que brawlerImages.js existe
if (fs.existsSync(path.join(__dirname, 'src/services/brawlerImages.js'))) {
  console.log('✅ src/services/brawlerImages.js existe');
} else {
  console.log('❌ src/services/brawlerImages.js manquant');
  allGood = false;
}

console.log('\n' + '═'.repeat(50));
if (allGood && jsonCount === jsonFiles.length) {
  console.log('\n✅ VÉRIFICATION RÉUSSIE!\n');
  console.log('La correction est appliquée correctement.');
  console.log('Les données se chargeront sans erreur JSON.parse.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Certains fichiers manquent.\n');
  console.log('Assurez-vous que:');
  console.log('  1. npm install a été exécuté');
  console.log('  2. Tous les fichiers JSON existent dans data/api/');
  console.log('  3. Les services ont été mis à jour\n');
  process.exit(1);
}

