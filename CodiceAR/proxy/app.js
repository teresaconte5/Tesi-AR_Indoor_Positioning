// app.js
const express = require("express");
const https = require("https");
const fs = require("fs");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path"); // Importa il modulo 'path' per gestire i percorsi


const options = {
    key: fs.readFileSync(path.join(__dirname, "..", "certs", "mykey.key")), // Modifica con il nome corretto del tuo file chiave
    cert: fs.readFileSync(path.join(__dirname, "..", "certs", "cert.crt")) // Assicurati che il file sia corretto
};



// Crea l'app Express
const app = express();
const PORT = 4000; // Cambia porta per il server proxy
const HOST = "localhost";
const API_BASE_URL = "http://localhost:3000"; // URL del tuo server PHP

// Logging delle richieste
app.use(morgan("dev"));

// Serve static files from node_modules
// Serve i file statici dalla cartella 'node_modules'
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));


// Proxy Logic: Proxy endpoints
app.use(
    "/api", // Questo è il prefisso che userai per le tue richieste
    createProxyMiddleware({
        target: API_BASE_URL,
        changeOrigin: true,
        pathRewrite: {
            "^/api": "api-service/api.php", // Assicurati che questo punti al file corretto
        },
    })
);

// Servire il file index.html dalla radice della cartella 'Codice AR.js'
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html")); // Usa path.join per costruire il percorso corretto
});

// Avvio del server HTTPS
https.createServer(options, app).listen(PORT, HOST, () => {
    console.log(`Server in esecuzione su https://${HOST}:${PORT}`);
});
