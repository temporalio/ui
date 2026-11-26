#!/usr/bin/env ts-node
import { getConfig } from './config';
import routes from './routes/express';
import OIDCServer from './server';
import Account from './support/account';
import providerConfiguration from './support/configuration';

(async () => {
  const { PORT, ISSUER, VIEWS_PATH } = getConfig();

  const server = new OIDCServer({
    issuer: ISSUER,
    port: PORT,
    viewsPath: VIEWS_PATH,
    providerConfiguration,
    accountModel: Account,
    routes,
  });

  try {
    await server.start();
    console.log('✅ Server started successfully');
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  } finally {
    server.stop();
    console.log('✅ Server stopped successfully');
  }
})();
