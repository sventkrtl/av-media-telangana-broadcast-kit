/**
 * AV Media Telangana - Unified Broadcast Runtime Server
 * HTTP Static File Server + Native WebSocket Communication Engine
 * Health/Version Endpoints & Clean Broadcast Runtime Logs
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const url = require('url');

const REPO_ROOT = path.resolve(__dirname, '../../');
const startTime = Date.now();
const VERSION = '1.2.3';
const PROTOCOL_VERSION = 1;

let PORT = 8085;
try {
  const configPath = path.join(__dirname, '../config/global-config.json');
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (configData.websocket && configData.websocket.port) {
      PORT = configData.websocket.port;
    }
  }
} catch (e) {}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

const clients = new Set();

function logEvent(message) {
  const timeStr = new Date().toLocaleTimeString('en-GB');
  console.log(`[${timeStr}] ${message}`);
}

// ==========================================================================
// 1. HTTP Static File Server & System Endpoints (/health, /version)
// ==========================================================================
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);

  // Health Endpoint
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    return res.end(JSON.stringify({
      status: 'ok',
      http: true,
      websocket: true,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      clients: clients.size,
      version: VERSION
    }));
  }

  // Version Endpoint
  if (parsedUrl.pathname === '/version') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    return res.end(JSON.stringify({
      name: 'AV Media Telangana Broadcast Runtime',
      version: VERSION,
      protocol: PROTOCOL_VERSION
    }));
  }

  let sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(REPO_ROOT, sanitizePath);

  if (!filePath.startsWith(REPO_ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end(`404 Not Found: ${parsedUrl.pathname}`);
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end(`404 Not Found: ${parsedUrl.pathname}`);
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');
    });
  });
});

// ==========================================================================
// 2. Native WebSocket Server (Clean Broadcast Runtime Logs)
// ==========================================================================
server.on('upgrade', (req, socket, head) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`
  ];

  socket.write(headers.join('\r\n') + '\r\n\r\n');
  clients.add(socket);
  logEvent('Client Connected');

  socket.on('data', (buffer) => {
    try {
      const message = decodeWebSocketFrame(buffer);
      if (message) {
        try {
          const parsed = JSON.parse(message);
          if (parsed.engine && parsed.action) {
            logEvent(`${parsed.engine}.${parsed.action}`);
          }
        } catch (e) {}

        const frame = encodeWebSocketFrame(message);
        for (const client of clients) {
          if (client !== socket && client.writable) {
            client.write(frame);
          }
        }
      }
    } catch (err) {}
  });

  socket.on('close', () => {
    clients.delete(socket);
    logEvent('Client Disconnected');
  });

  socket.on('error', () => {
    clients.delete(socket);
  });
});

function decodeWebSocketFrame(buffer) {
  const secondByte = buffer[1];
  const isMasked = (secondByte & 0x80) === 0x80;
  let length = secondByte & 0x7f;
  let offset = 2;

  if (length === 126) {
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    offset = 10;
  }

  let maskingKey;
  if (isMasked) {
    maskingKey = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  const payload = buffer.slice(offset, offset + length);
  if (isMasked) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskingKey[i % 4];
    }
  }

  return payload.toString('utf8');
}

function encodeWebSocketFrame(message) {
  const payload = Buffer.from(message, 'utf8');
  const length = payload.length;

  let header;
  if (length <= 125) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = length;
  } else if (length <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  return Buffer.concat([header, payload]);
}

// ==========================================================================
// 3. Server Initialization & Output
// ==========================================================================
server.listen(PORT, '127.0.0.1', () => {
  console.log(`====================================================`);
  console.log(`📡 Broadcast Runtime Started`);
  console.log(``);
  console.log(`HTTP:`);
  console.log(`http://127.0.0.1:${PORT}/`);
  console.log(``);
  console.log(`WebSocket:`);
  console.log(`ws://127.0.0.1:${PORT}/`);
  console.log(``);
  console.log(`Endpoints:`);
  console.log(`http://127.0.0.1:${PORT}/health`);
  console.log(`http://127.0.0.1:${PORT}/version`);
  console.log(``);
  console.log(`Static Root:`);
  console.log(`${REPO_ROOT}`);
  console.log(``);
  console.log(`Ready for OBS.`);
  console.log(`====================================================`);
});
