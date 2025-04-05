import { FullConfig } from '@playwright/test';

import { disconnect, stopWorkflows } from '../temporal/client';
import { getCodecServer } from '../temporal/codec-server';
import { stopWorker } from '../temporal/workers';
import { getTemporalServer } from '../utilities/temporal-server';
import { getUIServer } from '../utilities/ui-server';

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
