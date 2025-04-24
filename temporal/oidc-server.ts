import type { Server } from 'http';

import express, { type Application } from 'express';
import { Provider } from 'oidc-provider';

export type OidcProviderServer = {
  start: () => Promise<Server>;
  stop: () => Promise<void>;
};

export type OidcProviderOptions = {
  port?: number;
};

const PORT = 3001;

let oidcProviderServer: OidcProviderServer;
export const getOidcProviderServer = (): OidcProviderServer =>
  oidcProviderServer;

export async function createOidcProviderServer(
  { port }: OidcProviderOptions = { port: PORT },
): Promise<OidcProviderServer> {
  let server: Server;

  const clients = [
    {
      client_id: 'temporal-ui',
      client_secret: 'temporal-secret',
      grant_types: ['authorization_code'],
      redirect_uris: ['http://localhost:8081/auth/sso/callback'],
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_basic',
    },
  ];

  const oidc = new Provider(`http://localhost:${port}`, {
    clients,
    features: {
      devInteractions: { enabled: false },
      rpInitiatedLogout: { enabled: true },
    },

    routes: {
      authorization: '/auth',
      token: '/token',
      end_session: '/logout',
    },

    async findAccount(ctx, id) {
      return {
        accountId: id,
        async claims() {
          return {
            sub: id,
            email: 'test@example.com',
            name: 'Test User',
          };
        },
      };
    },

    interactions: {
      async url(ctx) {
        return `/interaction/${ctx.oidc.uid}`;
      },
    },
  });

  const app: Application = express();

  app.use(
    '/interaction/:uid',
    express.urlencoded({ extended: false }),
    (req, res) => {
      const { uid } = req.params;
      const form = `
      <form method="post" action="/interaction/${uid}/login">
        <input type="hidden" name="uid" value="${uid}" />
        <label>Username: <input name="login" value="test-user" /></label><br/>
        <label>Password: <input name="password" type="password" value="password" /></label><br/>
        <button type="submit">Login</button>
      </form>
    `;
      res.send(form);
    },
  );

  app.post(
    '/interaction/:uid/login',
    express.urlencoded({ extended: false }),
    async (req, res, next) => {
      const result = {
        login: { accountId: 'test-user' },
        consent: {},
      };
      try {
        await oidc.interactionFinished(req, res, result, {
          mergeWithLastSubmission: false,
        });
      } catch (err) {
        next(err);
      }
    },
  );

  app.use(oidc.callback());

  const start = () =>
    new Promise<Server>((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`✨ OIDC provider listening on http://127.0.0.1:${port}`);
        app.on('error', (error) => {
          reject(error);
        });
        resolve(server);
      });
    });

  const stop = () =>
    new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        console.log('🔪 killed OIDC provider server');
        resolve();
      });
    });

  oidcProviderServer = {
    start,
    stop,
  };

  return oidcProviderServer;
}
