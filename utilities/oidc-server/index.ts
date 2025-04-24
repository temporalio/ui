#!/usr/bin/env node
import { ISSUER, PORT, VIEWS_PATH } from './config';
import routes from './routes/express';
import OIDCServer from './server';
import Account from './support/account';
import providerConfiguration from './support/configuration';

// Instantiate and start the OIDC server
const server = new OIDCServer({
  issuer: ISSUER,
  port: Number(PORT),
  viewsPath: VIEWS_PATH,
  providerConfiguration,
  accountModel: Account,
  routes,
});

server.start();
