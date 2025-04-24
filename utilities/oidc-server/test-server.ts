#!/usr/bin/env ts-node
import { ISSUER, PORT, VIEWS_PATH } from './config';
import routes from './routes/express';
import OIDCServer from './server';
import Account from './support/account';
import providerConfiguration from './support/configuration';

(async () => {
  // Use port 0 to pick an available port
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
