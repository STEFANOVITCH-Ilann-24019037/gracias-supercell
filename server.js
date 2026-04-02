const http = require('http');

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6Ijg2Y2I1NzRhLWMzOGMtNDYxOS1iMzc3LTgwMzJmODhmMTBkMyIsImlhdCI6MTc3NTExMjg2OSwic3ViIjoiZGV2ZWxvcGVyL2FjMGVmMjhmLWFjYzYtMDUyMC1mY2JmLWJlNzQ4ZjdkM2MwOCIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiMTg1LjMxLjQwLjMwIiwiMTg1LjMxLjQxLjg1Il0sInR5cGUiOiJjbGllbnQifV19.hu8ccbyvPKfaCksA9nFEKs4Df7hoIdzvrvdWvItuE0Bud0AHsvOnCqHy9lBMu65ZcNZLuwQdhMIjaGskCQPhmg" ;
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

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log('Proxy server lancé sur http://localhost:' + PORT);
  console.log('Endpoint: http://localhost:' + PORT + '/api/brawlers');
});
