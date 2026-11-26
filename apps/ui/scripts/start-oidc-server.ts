import {
  Account,
  getConfig,
  OIDCServer,
  providerConfiguration,
  routes,
} from '../utilities/oidc-server';

const { PORT, ISSUER, VIEWS_PATH } = getConfig();

const server = new OIDCServer({
  issuer: ISSUER,
  port: PORT,
  viewsPath: VIEWS_PATH,
  providerConfiguration,
  accountModel: Account,
  routes,
});

server.start().catch(async (error) => {
  console.error(error);
  server.stop();
  process.exit(1);
});

process.on('beforeExit', () => {
  if (server) server.stop();
});
