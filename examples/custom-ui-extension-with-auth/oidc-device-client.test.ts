import { describe, expect, it, vi } from 'vitest';

import { createOidcDeviceClient } from './oidc-device-client.mjs';

const ISSUER = 'http://localhost:8889';

const DISCOVERY = {
  issuer: ISSUER,
  device_authorization_endpoint: `${ISSUER}/device/auth`,
  token_endpoint: `${ISSUER}/token`,
  userinfo_endpoint: `${ISSUER}/me`,
  revocation_endpoint: `${ISSUER}/token/revocation`,
};

const json = (status: number, payload: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(payload),
});

const createClient = (
  responses: ReturnType<typeof json>[],
  now = () => 1_000_000,
) => {
  const queue = [...responses];
  const fetchImpl = vi.fn(async (url: string) => {
    if (String(url).includes('.well-known')) return json(200, DISCOVERY);
    const next = queue.shift();
    if (!next) throw new Error(`Unexpected request to ${url}`);
    return next;
  });

  const client = createOidcDeviceClient({
    issuer: ISSUER,
    clientId: 'custom-ui-extension',
    clientSecret: 'custom-ui-extension-secret',
    scope: 'openid profile email offline_access',
    fetchImpl,
    now,
  });

  return { client, fetchImpl };
};

describe('createOidcDeviceClient', () => {
  it('caches the discovery document across calls', async () => {
    const { client, fetchImpl } = createClient([]);

    await client.discover();
    await client.discover();

    const discoveryCalls = fetchImpl.mock.calls.filter(([url]) =>
      String(url).includes('.well-known'),
    );
    expect(discoveryCalls).toHaveLength(1);
  });

  it('normalizes a device authorization response', async () => {
    const { client } = createClient([
      json(200, {
        device_code: 'device-code-value',
        user_code: 'LFHL-FZNJ',
        verification_uri: `${ISSUER}/device`,
        verification_uri_complete: `${ISSUER}/device?user_code=LFHL-FZNJ`,
        expires_in: 600,
      }),
    ]);

    const device = await client.requestDeviceCode();

    expect(device.deviceCode).toBe('device-code-value');
    expect(device.userCode).toBe('LFHL-FZNJ');
    expect(device.verificationUri).toBe(`${ISSUER}/device`);
    expect(device.expiresAt).toBe(1_000_000 + 600_000);
  });

  it('defaults the poll interval to five seconds when the provider omits it', async () => {
    const { client } = createClient([
      json(200, {
        device_code: 'device-code-value',
        user_code: 'LFHL-FZNJ',
        verification_uri: `${ISSUER}/device`,
        expires_in: 600,
      }),
    ]);

    const device = await client.requestDeviceCode();

    expect(device.intervalSeconds).toBe(5);
  });

  it('reports a pending authorization while the user has not approved', async () => {
    const { client } = createClient([
      json(400, { error: 'authorization_pending' }),
    ]);

    const result = await client.pollForTokens('device-code-value');

    expect(result.status).toBe('pending');
    expect(result.slowDownBySeconds).toBeUndefined();
  });

  it('asks the caller to back off when the provider returns slow_down', async () => {
    const { client } = createClient([json(400, { error: 'slow_down' })]);

    const result = await client.pollForTokens('device-code-value');

    expect(result.status).toBe('pending');
    expect(result.slowDownBySeconds).toBe(5);
  });

  it('maps expired_token and access_denied to terminal states', async () => {
    const { client: expiredClient } = createClient([
      json(400, { error: 'expired_token' }),
    ]);
    const { client: deniedClient } = createClient([
      json(400, { error: 'access_denied' }),
    ]);

    expect((await expiredClient.pollForTokens('code')).status).toBe('expired');
    expect((await deniedClient.pollForTokens('code')).status).toBe('denied');
  });

  it('surfaces an unrecognized token error as a message', async () => {
    const { client } = createClient([
      json(400, {
        error: 'invalid_grant',
        error_description: 'grant request is invalid',
      }),
    ]);

    const result = await client.pollForTokens('device-code-value');

    expect(result.status).toBe('error');
    expect(result.message).toBe('grant request is invalid');
  });

  it('returns normalized tokens once authorization completes', async () => {
    const { client } = createClient([
      json(200, {
        access_token: 'access-value',
        refresh_token: 'refresh-value',
        id_token: 'id-value',
        expires_in: 60,
        scope: 'openid profile email offline_access',
      }),
    ]);

    const result = await client.pollForTokens('device-code-value');

    expect(result.status).toBe('complete');
    expect(result.tokens).toMatchObject({
      accessToken: 'access-value',
      refreshToken: 'refresh-value',
      idToken: 'id-value',
      expiresAt: 1_000_000 + 60_000,
    });
  });

  it('keeps the existing refresh token when the provider does not rotate it', async () => {
    const { client } = createClient([
      json(200, { access_token: 'next-access', expires_in: 60 }),
    ]);

    const tokens = await client.refreshTokens('original-refresh');

    expect(tokens.accessToken).toBe('next-access');
    expect(tokens.refreshToken).toBe('original-refresh');
  });

  it('throws a descriptive error when the refresh grant is rejected', async () => {
    const { client } = createClient([
      json(400, {
        error: 'invalid_grant',
        error_description: 'refresh token is invalid',
      }),
    ]);

    await expect(client.refreshTokens('stale-refresh')).rejects.toThrow(
      'refresh token is invalid',
    );
  });

  it('sends the access token as a bearer credential to userinfo', async () => {
    const { client, fetchImpl } = createClient([
      json(200, { sub: 'user@example.com', email: 'user@example.com' }),
    ]);

    const claims = await client.fetchUserInfo('access-value');

    expect(claims.sub).toBe('user@example.com');
    const [, options] = fetchImpl.mock.calls.at(-1) as [string, RequestInit];
    expect((options.headers as Record<string, string>).Authorization).toBe(
      'Bearer access-value',
    );
  });

  it('does not reject when revocation fails so sign-out still completes', async () => {
    const { client } = createClient([]);

    await expect(
      client.revoke('refresh-value', 'refresh_token'),
    ).resolves.toBeUndefined();
  });
});
