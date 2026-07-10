import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const host = '127.0.0.1';
const port = Number.parseInt(process.env.PORT ?? '8090', 10);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const assets = new Map([
  ['/', { file: 'index.html', type: 'text/html; charset=utf-8' }],
  ['/index.html', { file: 'index.html', type: 'text/html; charset=utf-8' }],
  [
    '/extension.js',
    { file: 'extension.js', type: 'text/javascript; charset=utf-8' },
  ],
  ['/style.css', { file: 'style.css', type: 'text/css; charset=utf-8' }],
]);

const securityHeaders = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    'frame-ancestors http://localhost:3000',
    "object-src 'none'",
  ].join('; '),
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

const respond = (response, status, headers, body) => {
  response.writeHead(status, headers);
  response.end(body);
};

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    respond(response, 405, { Allow: 'GET, HEAD', ...securityHeaders });
    return;
  }

  const pathname = new URL(request.url ?? '/', `http://${host}`).pathname;
  const asset = assets.get(pathname);
  if (!asset) {
    respond(response, 404, securityHeaders, 'Not found');
    return;
  }

  try {
    const body = await readFile(new URL(asset.file, import.meta.url));
    const headers = {
      ...securityHeaders,
      'Content-Length': String(body.byteLength),
      'Content-Type': asset.type,
    };
    respond(
      response,
      200,
      headers,
      request.method === 'HEAD' ? undefined : body,
    );
  } catch {
    respond(response, 500, securityHeaders, 'Internal server error');
  }
});

server.listen(port, host, () => {
  console.log(`Custom UI extension example: http://${host}:${port}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
