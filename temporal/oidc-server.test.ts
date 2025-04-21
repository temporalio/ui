// @vitest-environment node
import type { Server } from 'http';

import fetch from 'node-fetch';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createOidcProviderServer, getOidcProviderServer } from './oidc-server';

let oidcServer: Awaited<ReturnType<typeof createOidcProviderServer>>;
let httpServer: Server;
let port: number;

describe('OidcProviderServer', () => {
  beforeAll(async () => {
    oidcServer = await createOidcProviderServer({ port: 0 });
    httpServer = await oidcServer.start();
    const address = httpServer.address();
    if (!address || typeof address === 'string') {
      throw new Error('Unexpected server address');
    }
    port = address.port;
  });

  afterAll(async () => {
    await oidcServer.stop();
  });

  it('getOidcProviderServer returns the same instance', () => {
    expect(getOidcProviderServer()).toBe(oidcServer);
  });

  it('authorization endpoint redirects to interaction URL', async () => {
    const params = new URLSearchParams({
      client_id: 'temporal-ui',
      redirect_uri: 'http://localhost:3000/auth/callback',
      response_type: 'code',
      scope: 'openid',
    });
    const response = await fetch(
      `http://127.0.0.1:${port}/auth?${params.toString()}`,
      { redirect: 'manual' },
    );
    // OIDC provider may redirect with 302 or 303 status code
    expect([302, 303]).toContain(response.status);
    const location = response.headers.get('location');
    expect(location).toMatch(/^\/interaction\/.+/);
  });
});
