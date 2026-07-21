/**
 * AV Media Telangana Broadcast Kit - Zero-Dependency Broadcast Server
 * Native Node.js WebSocket & HTTP Server for OBS Dock <-> Overlay Communication
 */

const http = require('http');
const crypto = require('crypto');

const PORT = 8085;
const clients = new Set();

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  });
  res.end('AV Media Telangana Broadcast Server Active (Port 8085)');
});

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

  socket.on('data', (buffer) => {
    try {
      const message = decodeWebSocketFrame(buffer);
      if (message) {
        const frame = encodeWebSocketFrame(message);
        for (const client of clients) {
          if (client !== socket && client.writable) {
            client.write(frame);
          }
        }
      }
    } catch (err) {}
  });

  socket.on('close', () => clients.delete(socket));
  socket.on('error', () => clients.delete(socket));
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

server.listen(PORT, () => {
  console.log(`📡 AV Media Telangana Broadcast Server Active on Port ${PORT}`);
});
