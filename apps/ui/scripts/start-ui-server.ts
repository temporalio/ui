import { createUIServer, UIServer } from '../utilities/ui-server';

const server: UIServer = await createUIServer();

await server.ready();

process.on('beforeExit', async () => {
  await server.shutdown();
});
