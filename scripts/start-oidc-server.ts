import yargs from 'yargs/yargs';

import {
  createOidcProviderServer,
  type OidcProviderOptions,
} from '../temporal/oidc-server';

const args = yargs(process.argv.slice(2)).parse();

const options: OidcProviderOptions = {
  port: args['port'],
};

const server = await createOidcProviderServer(options);

server.start().catch(async (error) => {
  console.error(error);
  await server.stop();
  process.exit(1);
});

process.on('beforeExit', () => {
  if (server) server.stop();
});
