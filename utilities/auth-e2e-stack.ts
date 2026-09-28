import waitForPort from 'wait-port';

import {
  Account,
  getConfig,
  OIDCServer,
  providerConfiguration,
  routes,
} from './oidc-server';
import { createUIServer, getUIServer, type UIServer } from './ui-server';

/**
 * The auth stack for the E2E suite: a real identity provider and a real
 * auth-enabled ui-server, alongside the unauthenticated one the rest of the
 * suite uses.
 *
 * The cookie lifetimes under test are decided entirely by the Go server, so a
 * test that mocks the auth endpoints cannot see them. This starts the real
 * thing instead.
 */

/**
 * Token lifetimes for the suite, in seconds.
 *
 * These are much shorter than the defaults in the OIDC server's own
 * configuration, which are tuned for a human clicking through
 * `pnpm dev:with-auth`. A test needs to outlive an access token in a few
 * seconds, not a minute.
 *
 * ACCESS_TOKEN must stay below the 45s maxSessionDuration in
 * server/config/e2e-auth.yaml, so that a refresh happens inside the session.
 */
export const E2E_AUTH_TTL = {
  ACCESS_TOKEN: 5,
  ID_TOKEN: 5,
  /** Well past the session, so the refresh cookie is never the reason a refresh fails. */
  REFRESH_TOKEN: 60 * 60 * 24,
  SESSION: 120,
} as const;

/** The auth-enabled ui-server's port, from server/config/e2e-auth.yaml. */
export const AUTH_UI_SERVER_URL = 'http://localhost:8081';

let oidcServer: OIDCServer | undefined;

export const startAuthStack = async (): Promise<UIServer> => {
  const { PORT, ISSUER, VIEWS_PATH } = getConfig();

  oidcServer = new OIDCServer({
    issuer: ISSUER,
    port: PORT,
    viewsPath: VIEWS_PATH,
    // Overridden per instance rather than edited in place, so the shared
    // configuration keeps serving `pnpm dev:with-auth` unchanged.
    providerConfiguration: {
      ...providerConfiguration,
      ttl: {
        ...(providerConfiguration.ttl ?? {}),
        AccessToken: E2E_AUTH_TTL.ACCESS_TOKEN,
        IdToken: E2E_AUTH_TTL.ID_TOKEN,
        RefreshToken: E2E_AUTH_TTL.REFRESH_TOKEN,
        Session: E2E_AUTH_TTL.SESSION,
      },
    },
    accountModel: Account,
    routes,
  });

  await oidcServer.start();
  await waitForPort({ port: PORT, output: 'silent' });
  console.log(`✨ OIDC server running on port ${PORT}`);

  const authUIServer = await createUIServer('e2e-auth');
  await authUIServer.ready();

  return authUIServer;
};

export const stopAuthStack = async (): Promise<void> => {
  await getUIServer('e2e-auth')?.shutdown();

  if (oidcServer) {
    oidcServer.stop();
    oidcServer = undefined;
    console.log('🔪 killed OIDC server');
  }
};
