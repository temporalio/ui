import {
  type TemporalServer,
  type TemporalServerOptions,
  createTemporalServer,
} from '../temporal/temporal-server';

import yargs from 'yargs/yargs';

const args = yargs(process.argv.slice(2)).parse();

const options: TemporalServerOptions = {
  port: args['port'],
  uiPort: args['uiPort'] ?? args['ui-port'],
  path: args['path'],
  logLevel: args['logLevel'] ?? args['log-level'],
  codecEndpoint: args['codecEndpoint'] ?? args['codec-endpoint'],
};

const server: TemporalServer = await createTemporalServer(options);

await server.ready();

process.on('beforeExit', async () => {
  await server.shutdown();
});
