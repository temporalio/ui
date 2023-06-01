import { FullConfig, chromium } from '@playwright/test';

import {
  type TemporalServer,
  createTemporalServer,
} from '../utilities/temporal-server';
import { type CodecServer, createCodecServer } from '../temporal/codec-server';
import { runWorkersUntil } from '../temporal/workers';
import { startWorkflows } from '../temporal/client';
import { connect } from '../temporal/client';
import { setLocalStorage } from '~/test-utilities/mock-local-storage';

async function globalSetup(config: FullConfig) {
  const { mode } = config.metadata;
  const { baseURL } = config.projects[0].use;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(baseURL!);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);
  await page.context().storageState({ path: './tests/storageState.json' });

  if (mode && mode === 'e2e') {
    let codecServer: CodecServer;
    let temporalServer: TemporalServer;
    try {
      temporalServer = await createTemporalServer();
      codecServer = await createCodecServer();

      await temporalServer.ready();
      await codecServer.start();

      const client = await connect();
      const result = startWorkflows(client);
      await runWorkersUntil(result);
    } catch (error) {
      console.error(error);
      await temporalServer.shutdown();
      await codecServer.stop();
      return;
    }
  }
}

export default globalSetup;
