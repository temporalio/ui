const DEFAULT_POLL_INTERVAL_SECONDS = 5;
const SLOW_DOWN_INCREMENT_SECONDS = 5;

const basicAuthorization = (clientId, clientSecret) =>
  `Basic ${Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')}`;

const readJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Expected JSON from the identity provider but received: ${text.slice(0, 200)}`,
    );
  }
};

const positiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeTokens = (payload, now) => ({
  accessToken: payload.access_token,
  refreshToken: payload.refresh_token,
  idToken: payload.id_token,
  scope: payload.scope,
  // The sample provider issues 60 second access tokens, which is what makes
  // the refresh path observable in the example UI.
  expiresAt: now + positiveInteger(payload.expires_in, 60) * 1_000,
});

export const createOidcDeviceClient = ({
  issuer,
  clientId,
  clientSecret,
  scope,
  fetchImpl = fetch,
  now = () => Date.now(),
}) => {
  let metadataPromise;

  // A refused connection surfaces from fetch as a bare "fetch failed", which
  // says nothing useful in an example. Name the provider that is unreachable.
  const request = async (url, options) => {
    try {
      return await fetchImpl(url, options);
    } catch (cause) {
      throw new Error(
        `Could not reach the identity provider at ${issuer}. Start it with "pnpm oidc-server".`,
        { cause },
      );
    }
  };

  const discover = () => {
    if (!metadataPromise) {
      metadataPromise = (async () => {
        const response = await request(
          `${issuer}/.well-known/openid-configuration`,
        );
        if (!response.ok) {
          throw new Error(
            `Identity provider discovery failed with ${response.status}. Is it running at ${issuer}?`,
          );
        }
        return readJson(response);
      })().catch((error) => {
        // Do not cache a failed discovery; the provider may start up later.
        metadataPromise = undefined;
        throw error;
      });
    }
    return metadataPromise;
  };

  const postForm = async (endpoint, body) =>
    request(endpoint, {
      method: 'POST',
      headers: {
        Authorization: basicAuthorization(clientId, clientSecret),
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(body).toString(),
    });

  const requestDeviceCode = async () => {
    const { device_authorization_endpoint: endpoint } = await discover();
    if (!endpoint) {
      throw new Error(
        'The identity provider does not advertise a device authorization endpoint.',
      );
    }

    const response = await postForm(endpoint, { scope });
    const payload = await readJson(response);

    if (!response.ok) {
      throw new Error(
        payload.error_description ||
          payload.error ||
          `Device authorization failed with ${response.status}.`,
      );
    }

    return {
      deviceCode: payload.device_code,
      userCode: payload.user_code,
      verificationUri: payload.verification_uri,
      verificationUriComplete: payload.verification_uri_complete,
      expiresAt: now() + positiveInteger(payload.expires_in, 600) * 1_000,
      // RFC 8628 makes `interval` optional and defaults it to 5 seconds. The
      // sample provider omits it.
      intervalSeconds: positiveInteger(
        payload.interval,
        DEFAULT_POLL_INTERVAL_SECONDS,
      ),
    };
  };

  const pollForTokens = async (deviceCode) => {
    const { token_endpoint: endpoint } = await discover();
    const response = await postForm(endpoint, {
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      device_code: deviceCode,
    });
    const payload = await readJson(response);

    if (response.ok) {
      return { status: 'complete', tokens: normalizeTokens(payload, now()) };
    }

    switch (payload.error) {
      case 'authorization_pending':
        return { status: 'pending' };
      case 'slow_down':
        return {
          status: 'pending',
          slowDownBySeconds: SLOW_DOWN_INCREMENT_SECONDS,
        };
      case 'expired_token':
        return { status: 'expired' };
      case 'access_denied':
        return { status: 'denied' };
      default:
        return {
          status: 'error',
          message:
            payload.error_description ||
            payload.error ||
            `Token request failed with ${response.status}.`,
        };
    }
  };

  const refreshTokens = async (refreshToken) => {
    const { token_endpoint: endpoint } = await discover();
    const response = await postForm(endpoint, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const payload = await readJson(response);

    if (!response.ok) {
      throw new Error(
        payload.error_description || payload.error || 'Token refresh failed.',
      );
    }

    return {
      ...normalizeTokens(payload, now()),
      // A provider may or may not rotate the refresh token.
      refreshToken: payload.refresh_token || refreshToken,
    };
  };

  const fetchUserInfo = async (accessToken) => {
    const { userinfo_endpoint: endpoint } = await discover();
    const response = await fetchImpl(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    const payload = await readJson(response);

    if (!response.ok) {
      throw new Error(
        payload.error_description ||
          payload.error ||
          `Userinfo request failed with ${response.status}.`,
      );
    }

    return payload;
  };

  const revoke = async (token, tokenTypeHint) => {
    const { revocation_endpoint: endpoint } = await discover();
    if (!endpoint || !token) return;

    await postForm(endpoint, {
      token,
      token_type_hint: tokenTypeHint,
    }).catch(() => {
      // Sign-out must succeed locally even when the provider is unreachable.
    });
  };

  return {
    discover,
    requestDeviceCode,
    pollForTokens,
    refreshTokens,
    fetchUserInfo,
    revoke,
  };
};
