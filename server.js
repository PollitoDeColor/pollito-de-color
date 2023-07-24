const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

const hostname = 'localhost';
const port = 8080;

// Configuración de los certificados SSL generados por mkcert
const privateKey = fs.readFileSync(path.join(__dirname, 'localhost-key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'localhost.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Middleware para habilitar CORS y permitir solicitudes desde el dominio de Twitch
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.twitch.tv');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Definir la carpeta pública para archivos estáticos
app.use(express.static(path.join(__dirname)));

// Definir las rutas y la lógica de tu aplicación Express
app.get('/', (req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html'; // Si no se especifica un recurso, se sirve el archivo "index.html"
  }

  const extname = path.extname(filePath);
  const contentType = getContentType(extname);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

// Función para obtener el tipo de contenido según la extensión del archivo
function getContentType(extname) {
    switch (extname) {
      case '.html':
        return 'text/html';
      case '.css':
        return 'text/css';
      case '.js':
        return 'text/javascript';
      case '.json':
        return 'application/json';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      default:
        return 'text/plain';
    }
}

// Crear el servidor HTTPS con los certificados SSL
const httpsServer = https.createServer(credentials, app);

// Iniciar el servidor HTTPS
httpsServer.listen(port, hostname, () => {
  console.log(`Servidor HTTPS iniciado en https://${hostname}:${port}/`);
});