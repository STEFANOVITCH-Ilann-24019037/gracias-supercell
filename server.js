const http = require('http');

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjY3Y2M2MjA1LWMwZWQtNGQ5OS1iZTNmLTUxNTE5NDI4NWNkMyIsImlhdCI6MTc3NDcyMjU0Nywic3ViIjoiZGV2ZWxvcGVyL2FjMGVmMjhmLWFjYzYtMDUyMC1mY2JmLWJlNzQ4ZjdkM2MwOCIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiMTc2LjEzOC44OC4xODgiXSwidHlwZSI6ImNsaWVudCJ9XX0.BJG5cuAvtHwo5E6ODSQtBoNk-P7jhR92zNCoXA78vFlWjH_w7bwp4QW5V78OKiqVYHlsRI26WeMbcNSxL90fiQ";

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
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Proxy server lancé sur http://localhost:${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/brawlers`);
});
