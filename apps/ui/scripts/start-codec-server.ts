import yargs from 'yargs/yargs';

import {
  type CodecServerOptions,
  createCodecServer,
} from '../temporal/codec-server';

const args = yargs(process.argv.slice(2)).parse();

const options: CodecServerOptions = {
  port: args['port'],
};

const server = await createCodecServer(options);

server.start().catch(async (error) => {
  console.error(error);
  await server.stop();
  process.exit(1);
});

process.on('beforeExit', () => {
  if (server) server.stop();
});
