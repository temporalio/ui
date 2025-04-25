import { getConfig } from './config';
import routes from './routes/express';
import OIDCServer from './server';
import Account from './support/account';
import providerConfiguration from './support/configuration';

export { OIDCServer, getConfig, routes, providerConfiguration, Account };
