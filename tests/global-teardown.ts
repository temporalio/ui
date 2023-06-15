import { stopWorker } from '../temporal/workers';
import { getTemporalServer } from '../utilities/temporal-server';
import { getCodecServer } from '../temporal/codec-server';
import { getUIServer } from '../utilities/ui-server';
import { disconnect, stopWorkflows } from '../temporal/client';
import { FullConfig } from '@playwright/test';

export default async function (config: FullConfig) {
  if (config.metadata.mode === 'e2e') {
    const temporal = getTemporalServer();
    const codecServer = getCodecServer();
    const uiServer = getUIServer();

    await stopWorkflows();
    await stopWorker();
    await disconnect();
    await codecServer.stop();
    await uiServer.shutdown();
    await temporal.shutdown();
  }
}
