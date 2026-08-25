import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

import { createOidcDeviceClient } from './oidc-device-client.mjs';

const host = '127.0.0.1';
const port = Number.parseInt(process.env.PORT ?? '8091', 10);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const temporalUiOrigin =
  process.env.TEMPORAL_UI_ORIGIN ?? 'http://localhost:3000';
const issuer = process.env.OIDC_ISSUER ?? 'http://localhost:8889';
const clientId = process.env.OIDC_CLIENT_ID ?? 'custom-ui-extension';
const clientSecret =
  process.env.OIDC_CLIENT_SECRET ?? 'custom-ui-extension-secret';
const scope = 'openid profile email offline_access';

const oidc = createOidcDeviceClient({
  issuer,
  clientId,
  clientSecret,
  scope,
});

const selfOrigin = `http://${host}:${port}`;

// The extension iframe is sandboxed without `allow-same-origin`, so its
// requests carry `Origin: null`. Credentials are never used; the session
// handle travels as a bearer value instead of a cookie.
const allowedApiOrigins = new Set(['null', selfOrigin]);

const REFRESH_SKEW_MS = 5_000;
const MAX_BODY_BYTES = 4_096;

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
    "connect-src 'self'",
    "form-action 'none'",
    `frame-ancestors ${temporalUiOrigin}`,
    "object-src 'none'",
  ].join('; '),
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

// pendingId -> device authorization in progress. sessionId -> signed-in user.
const pending = new Map();
const sessions = new Map();

const opaqueId = () => randomBytes(32).toString('base64url');

const respond = (response, status, headers, body) => {
  response.writeHead(status, headers);
  response.end(body);
};

const corsHeaders = (request) => {
  const origin = request.headers.origin;
  if (!origin || !allowedApiOrigins.has(origin)) return { Vary: 'Origin' };

  return {
    Vary: 'Origin',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600',
  };
};

const sendJson = (request, response, status, payload) => {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  respond(
    response,
    status,
    {
      ...securityHeaders,
      ...corsHeaders(request),
      'Content-Length': String(body.byteLength),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body,
  );
};

const readBody = (request) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body is too large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });

const readJsonBody = async (request) => {
  const raw = await readBody(request);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Request body must be JSON');
  }
};

const bearerSession = (request) => {
  const header = request.headers.authorization ?? '';
  const [scheme, value] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !value) return undefined;
  const session = sessions.get(value);
  return session ? { sessionId: value, session } : undefined;
};

// Only the claims the example renders. A real extension should be equally
// deliberate about what it hands to its frontend.
const displayClaims = (claims) => ({
  sub: claims.sub,
  name: claims.name,
  email: claims.email,
  emailVerified: claims.email_verified,
  preferredUsername: claims.preferred_username,
});

const sessionPayload = (sessionId, session) => ({
  sessionId,
  claims: session.claims,
  accessTokenExpiresInSeconds: Math.max(
    0,
    Math.round((session.tokens.expiresAt - Date.now()) / 1_000),
  ),
  refreshCount: session.refreshCount,
});

const ensureFreshAccessToken = async (session) => {
  if (session.tokens.expiresAt - REFRESH_SKEW_MS > Date.now()) return false;
  if (!session.tokens.refreshToken) {
    throw new Error('The access token expired and no refresh token was issued');
  }

  session.tokens = await oidc.refreshTokens(session.tokens.refreshToken);
  session.refreshCount += 1;
  return true;
};

const startSession = async (request, response) => {
  const device = await oidc.requestDeviceCode();
  const pendingId = opaqueId();

  // The device code is a credential. It stays here; the browser only ever
  // sees the user code and the verification URL.
  pending.set(pendingId, {
    deviceCode: device.deviceCode,
    expiresAt: device.expiresAt,
  });

  sendJson(request, response, 200, {
    pendingId,
    userCode: device.userCode,
    verificationUri: device.verificationUri,
    verificationUriComplete: device.verificationUriComplete,
    intervalSeconds: device.intervalSeconds,
    expiresInSeconds: Math.max(
      0,
      Math.round((device.expiresAt - Date.now()) / 1_000),
    ),
  });
};

const pollSession = async (request, response) => {
  const { pendingId } = await readJsonBody(request);
  const entry = typeof pendingId === 'string' && pending.get(pendingId);

  if (!entry) {
    sendJson(request, response, 404, { status: 'expired' });
    return;
  }

  if (entry.expiresAt <= Date.now()) {
    pending.delete(pendingId);
    sendJson(request, response, 200, { status: 'expired' });
    return;
  }

  const result = await oidc.pollForTokens(entry.deviceCode);

  if (result.status !== 'complete') {
    if (result.status !== 'pending') pending.delete(pendingId);
    sendJson(request, response, 200, result);
    return;
  }

  pending.delete(pendingId);

  const claims = displayClaims(
    await oidc.fetchUserInfo(result.tokens.accessToken),
  );
  const sessionId = opaqueId();
  const session = { tokens: result.tokens, claims, refreshCount: 0 };
  sessions.set(sessionId, session);

  sendJson(request, response, 200, {
    status: 'complete',
    ...sessionPayload(sessionId, session),
  });
};

const getSession = async (request, response) => {
  const found = bearerSession(request);
  if (!found) {
    sendJson(request, response, 401, { error: 'Not signed in' });
    return;
  }

  const refreshed = await ensureFreshAccessToken(found.session);
  sendJson(request, response, 200, {
    ...sessionPayload(found.sessionId, found.session),
    refreshed,
  });
};

const logoutSession = async (request, response) => {
  const found = bearerSession(request);
  if (found) {
    sessions.delete(found.sessionId);
    await oidc.revoke(found.session.tokens.refreshToken, 'refresh_token');
    await oidc.revoke(found.session.tokens.accessToken, 'access_token');
  }
  sendJson(request, response, 200, { status: 'signed-out' });
};

const apiRoutes = new Map([
  ['POST /api/session/start', startSession],
  ['POST /api/session/poll', pollSession],
  ['GET /api/session', getSession],
  ['POST /api/session/logout', logoutSession],
]);

const serveAsset = async (request, response, pathname) => {
  const asset = assets.get(pathname);
  if (!asset) {
    respond(response, 404, securityHeaders, 'Not found');
    return;
  }

  try {
    const body = await readFile(new URL(asset.file, import.meta.url));
    respond(
      response,
      200,
      {
        ...securityHeaders,
        'Content-Length': String(body.byteLength),
        'Content-Type': asset.type,
      },
      request.method === 'HEAD' ? undefined : body,
    );
  } catch {
    respond(response, 500, securityHeaders, 'Internal server error');
  }
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', selfOrigin).pathname;

  if (pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      respond(response, 204, { ...securityHeaders, ...corsHeaders(request) });
      return;
    }

    const handler = apiRoutes.get(`${request.method} ${pathname}`);
    if (!handler) {
      sendJson(request, response, 404, { error: 'Not found' });
      return;
    }

    try {
      await handler(request, response);
    } catch (error) {
      sendJson(request, response, 502, {
        error: error instanceof Error ? error.message : 'Unexpected error',
      });
    }
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    respond(response, 405, { Allow: 'GET, HEAD', ...securityHeaders });
    return;
  }

  await serveAsset(request, response, pathname);
});

const pruneTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of pending) {
    if (entry.expiresAt <= now) pending.delete(id);
  }
}, 60_000);
pruneTimer.unref();

server.listen(port, host, () => {
  console.log(`Custom UI extension with auth example: ${selfOrigin}`);
  console.log(`Identity provider: ${issuer}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
