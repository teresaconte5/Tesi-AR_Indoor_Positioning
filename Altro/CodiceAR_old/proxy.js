const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Percorsi dei certificati autofirmati
const options = {
  key: fs.readFileSync('./certs/mykey.key'),  // Sostituisci con il percorso corretto della tua chiave privata
  cert: fs.readFileSync('./certs/cert.crt'),  // Sostituisci con il percorso corretto del certificato
};

// Crea un proxy server per instradare le richieste verso il server PHP
const proxy = httpProxy.createProxyServer({ changeOrigin: true });

// Aggiungi gestione degli errori nel proxy
proxy.on('error', (err, req, res) => {
  console.error('Errore nel proxy:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Errore del server.');
});

// Crea un server HTTPS che utilizza il proxy
https.createServer(options, (req, res) => {
    // Inoltra la richiesta esattamente com'è
    proxy.web(req, res, { 
        target: 'http://localhost:3000', 
        selfHandleResponse: false 
    });
}).listen(443, () => {
    console.log('Server HTTPS in esecuzione su https://localhost');
});
