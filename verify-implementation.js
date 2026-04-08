#!/usr/bin/env node

/**
 * Vérification que l'implémentation des images brawlers est complète
 * Exécuter: node verify-implementation.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Vérification de l\'implémentation des images brawlers\n');
console.log('═'.repeat(60));

let checks = [];

// 1. Vérifier que les fichiers existent
function checkFileExists(filePath, name) {
  const exists = fs.existsSync(filePath);
  checks.push({ name, exists });
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  return exists;
}

console.log('\n📂 Fichiers créés:');
console.log('─'.repeat(60));
checkFileExists(path.join(__dirname, 'src/services/brawlerImages.js'), 'brawlerImages.js');
checkFileExists(path.join(__dirname, 'src/services/playersDataService.js'), 'playersDataService.js');
checkFileExists(path.join(__dirname, 'metro.config.js'), 'metro.config.js');
checkFileExists(path.join(__dirname, '.env.local'), '.env.local');

console.log('\n📝 Documentation créée:');
console.log('─'.repeat(60));
checkFileExists(path.join(__dirname, 'SUMMARY.md'), 'SUMMARY.md');
checkFileExists(path.join(__dirname, 'IMPLEMENTATION_BRAWLER_IMAGES.md'), 'IMPLEMENTATION_BRAWLER_IMAGES.md');
checkFileExists(path.join(__dirname, 'TROUBLESHOOTING_MIME_ERROR.md'), 'TROUBLESHOOTING_MIME_ERROR.md');

// 2. Vérifier les images brawlers
console.log('\n🖼️  Images brawlers (vérification sample):');
console.log('─'.repeat(60));
const brawlerDir = path.join(__dirname, 'assets/brawler');
try {
  const brawlers = fs.readdirSync(brawlerDir).filter(f => f.endsWith('.webp'));
  console.log(`✅ ${brawlers.length} images WebP trouvées`);
  console.log(`   Exemples: ${brawlers.slice(0, 5).join(', ')}`);
} catch (e) {
  console.log('❌ Dossier brawler non trouvé');
}

// 3. Vérifier les modifications dans App.js
console.log('\n🔧 Modifications dans App.js:');
console.log('─'.repeat(60));
const appJs = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf-8');
const checks2 = [
  ['Import Image', appJs.includes('Image }')],
  ['Import getBrawlerImage', appJs.includes('getBrawlerImage')],
  ['Import playersDataService', appJs.includes('loadPlayersData')],
  ['renderBrawlerCard modifié', appJs.includes('cardImageContainer')],
  ['playersList créé', appJs.includes('const playersList')],
];

checks2.forEach(([name, exists]) => {
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  checks.push({ name, exists });
});

// 4. Vérifier styles.js
console.log('\n🎨 Modifications dans styles.js:');
console.log('─'.repeat(60));
const stylesJs = fs.readFileSync(path.join(__dirname, 'styles.js'), 'utf-8');
const checks3 = [
  ['cardImageContainer', stylesJs.includes('cardImageContainer')],
  ['brawlerImage', stylesJs.includes('brawlerImage')],
];

checks3.forEach(([name, exists]) => {
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  checks.push({ name, exists });
});

// 5. Vérifier metro.config.js
console.log('\n⚙️  Configuration Metro:');
console.log('─'.repeat(60));
const metroJs = fs.readFileSync(path.join(__dirname, 'metro.config.js'), 'utf-8');
const checks4 = [
  ['Support WebP', metroJs.includes('webp')],
  ['Support JSON', metroJs.includes('json')],
];

checks4.forEach(([name, exists]) => {
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  checks.push({ name, exists });
});

// 6. Vérifier package.json
console.log('\n📦 Scripts npm ajoutés:');
console.log('─'.repeat(60));
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const hasWebClear = packageJson.scripts['web:clear'] !== undefined;
const hasClean = packageJson.scripts['clean'] !== undefined;
console.log(`${hasWebClear ? '✅' : '❌'} web:clear script`);
console.log(`${hasClean ? '✅' : '❌'} clean script`);
checks.push({ name: 'web:clear script', exists: hasWebClear });
checks.push({ name: 'clean script', exists: hasClean });

// Résumé
console.log('\n═'.repeat(60));
const passedChecks = checks.filter(c => c.exists).length;
const totalChecks = checks.length;
const percentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`\n📊 Résultat: ${passedChecks}/${totalChecks} vérifications réussies (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 ✅ IMPLÉMENTATION COMPLÈTE ET VALIDÉE!');
  console.log('\n   Les images WebP des brawlers sont prêtes à être utilisées.');
  console.log('\n   Commandes pour démarrer:');
  console.log('   - Mobile:  npm start');
  console.log('   - Web:     npm run web');
  process.exit(0);
} else {
  console.log('\n⚠️  Certains fichiers ou configurations manquent.');
  console.log(`   ${totalChecks - passedChecks} point(s) à vérifier.`);
  process.exit(1);
}

