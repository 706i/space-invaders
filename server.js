#!/usr/bin/env node
// =====================================================================
//  HALBAUTOMATIK SPACE INVADERS -- Dev Server
//  Usage:  node server.js [--port=XXXX]
//  Logs every request with timestamps and status codes.
// =====================================================================

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// --- Config ----------------------------------------------------------
const args    = process.argv.slice(2);
const portArg = args.find(a => a.startsWith('--port='));
const PORT    = portArg ? parseInt(portArg.split('=')[1]) : 8080;
const PUBLIC  = path.join(__dirname, 'public');

// --- Color helpers (ANSI) --------------------------------------------
const C = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  bold:   '\x1b[1m',
  violet: '\x1b[35m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  gray:   '\x1b[90m',
};

function timestamp() {
  const d = new Date();
  return C.gray + '[' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0') + ':' +
    String(d.getSeconds()).padStart(2, '0') + '.' +
    String(d.getMilliseconds()).padStart(3, '0') +
    ']' + C.reset;
}

function logLine(tag, color, msg) {
  console.log(timestamp() + ' ' + color + C.bold + tag + C.reset + ' ' + msg);
}

const log = {
  sys:   (msg) => logLine('SYS ', C.violet, msg),
  req:   (msg) => logLine('REQ ', C.cyan,   msg),
  ok:    (msg) => logLine(' OK ', C.green,  msg),
  warn:  (msg) => logLine('WARN', C.yellow, msg),
  err:   (msg) => logLine('ERR ', C.red,    msg),
};

// --- MIME types -------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// --- Request counter --------------------------------------------------
let reqCount = 0;

// --- Server -----------------------------------------------------------
const server = http.createServer((req, res) => {
  const start = Date.now();
  reqCount++;
  const id = reqCount;

  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  log.req(`#${id} ${req.method} ${urlPath}`);

  const filePath = path.join(PUBLIC, urlPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC)) {
    log.warn(`#${id} Blocked directory traversal attempt: ${urlPath}`);
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    const elapsed = Date.now() - start;

    if (err) {
      if (err.code === 'ENOENT') {
        // SPA fallback: try index.html
        fs.readFile(path.join(PUBLIC, 'index.html'), (e2, d2) => {
          if (e2) {
            log.err(`#${id} 404 ${urlPath} (${elapsed}ms)`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
          }
          log.ok(`#${id} 200 ${urlPath} -> index.html (SPA fallback, ${elapsed}ms)`);
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          });
          res.end(d2);
        });
        return;
      }
      log.err(`#${id} 500 ${urlPath}: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const size = data.length;
    const sizeStr = size > 1024 ? (size / 1024).toFixed(1) + 'kb' : size + 'b';

    log.ok(`#${id} 200 ${urlPath} (${sizeStr}, ${elapsed}ms)`);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Request-Id': String(id),
    });
    res.end(data);
  });
});

// --- Startup ----------------------------------------------------------
server.listen(PORT, () => {
  const nets = os.networkInterfaces();
  let localIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const iface of nets[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }

  console.log('');
  console.log(C.violet + C.bold +
    '  ╔══════════════════════════════════════════════════╗' + C.reset);
  console.log(C.violet + C.bold +
    '  ║                                                  ║' + C.reset);
  console.log(C.violet + C.bold +
    '  ║   HALBAUTOMATIK SPACE INVADERS  //  Dev Server   ║' + C.reset);
  console.log(C.violet + C.bold +
    '  ║                                                  ║' + C.reset);
  console.log(C.violet + C.bold +
    '  ╚══════════════════════════════════════════════════╝' + C.reset);
  console.log('');
  log.sys('Server started on port ' + PORT);
  log.sys('Local:   ' + C.bold + 'http://localhost:' + PORT + C.reset);
  log.sys('Network: ' + C.bold + 'http://' + localIP + ':' + PORT + C.reset);
  log.sys('Serving: ' + PUBLIC);
  log.sys('Press Ctrl+C to stop');
  console.log('');
  console.log(C.gray + '  Waiting for requests...' + C.reset);
  console.log('');
});

// --- Graceful shutdown ------------------------------------------------
process.on('SIGINT', () => {
  console.log('');
  log.sys('Shutting down. Total requests served: ' + reqCount);
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.sys('Received SIGTERM. Shutting down.');
  process.exit(0);
});
