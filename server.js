const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Charger les variables d'environnement depuis .env

// Charger les données JSON locales
const apiClub1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/api/apiclub1.json'), 'utf8'));
const apiClub2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/api/apiclub2.json'), 'utf8'));
const apiPlayer1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/api/apipalyer1.json'), 'utf8'));
const apiPlayer2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/api/apiplayer2.json'), 'utf8'));

console.log('✅ Fichiers JSON chargés avec succès');

const server = http.createServer((req, res) => {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/brawlers' && req.method === 'GET') {
    // Retourner les données du club 1 locales
    console.log('📦 Retour des données du club 1');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(apiClub1));
  } else if (req.url === '/api/club2' && req.method === 'GET') {
    // Retourner les données du club 2 locales
    console.log('📦 Retour des données du club 2');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(apiClub2));
  } else if (req.url.startsWith('/api/player/') && req.method === 'GET') {
    // Récupérer le playerTag depuis l'URL
    const playerTag = req.url.replace('/api/player/', '').toLowerCase();
    console.log('🎮 Recherche du joueur: ' + playerTag);

    let responseData = null;

    // Déterminer quel fichier retourner basé sur le playerTag
    if (playerTag.includes('player1') || playerTag.includes('82rgu8pr')) {
      responseData = apiPlayer1;
    } else if (playerTag.includes('player2') || playerTag.includes('8lq9jr82')) {
      responseData = apiPlayer2;
    } else {
      // Par défaut retourner le joueur 1
      responseData = apiPlayer1;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Proxy server lancé sur http://localhost:${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/brawlers`);
  console.log(`🎮 Brawlers API: http://localhost:${PORT}/api/brawlers`);
  console.log(`👤 Player API: http://localhost:${PORT}/api/player/<TAG>`);
});
