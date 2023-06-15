import { stopWorker } from '../temporal/workers';
import { getCodecServer } from '../temporal/codec-server';
import { disconnect, stopWorkflows } from '../temporal/client';
import { FullConfig } from '@playwright/test';

export default async function (config: FullConfig) {
  if (config.metadata.mode === 'e2e') {
    const codecServer = getCodecServer();

    await stopWorkflows();
    await stopWorker();
    await disconnect();
    await codecServer.stop();
  }
}
