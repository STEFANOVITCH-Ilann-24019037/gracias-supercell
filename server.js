const http = require('http');
require('dotenv').config(); // Charger les variables d'environnement depuis .env

const token = process.env.BEARER_TOKEN;

// Vérifier que le token est défini
if (!token) {
  console.error('❌ ERREUR: BEARER_TOKEN n\'est pas défini!');
  console.error('Assurez-vous que:');
  console.error('1. Le fichier .env existe avec BEARER_TOKEN');
  console.error('2. Ou que la variable d\'environnement BEARER_TOKEN est définie');
  process.exit(1);
}

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
    // Proxy vers l'API Brawl Stars
    const https = require('https');

    const options = {
      family: 4,
      hostname: 'api.brawlstars.com',
      port: 443,
      path: '/v1/brawlers',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('❌ Erreur proxy:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    });

    proxyReq.end();
  } else if (req.url.startsWith('/api/player/') && req.method === 'GET') {
    // Récupérer le playerTag depuis l'URL
    const playerTag = req.url.replace('/api/player/', '');
    const https = require('https');

    const options = {
      hostname: 'api.brawlstars.com',
      port: 443,
      path: `/v1/players/${playerTag}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('Recherche du joueur: ' + playerTag);

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('Erreur proxy:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    });

    proxyReq.end();
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
