import { FullConfig, chromium } from '@playwright/test';

import { createTemporalServer } from '../utilities/temporal-server';
import { createCodecServer } from '../temporal/codec-server';
import { runWorker } from '../temporal/workers';
import { startWorkflows } from '../temporal/client';
import { connect } from '../temporal/client';
import { setLocalStorage } from './test-utilities/mock-local-storage';

async function globalSetup(config: FullConfig) {
  const { mode } = config.metadata;
  const { baseURL } = config.projects[0].use;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(baseURL);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);
  await page.context().storageState({ path: './tests/storageState.json' });

  const codecServer = await createCodecServer({ port: 8888 });
  const temporalServer = await createTemporalServer({
    codecEndpoint: 'http://127.0.0.1:8888',
  });

  await codecServer.start();
  await temporalServer.ready();

  if (mode === 'e2e') {
    const client = await connect();
    await runWorker();
    await startWorkflows(client);
  }
}

export default globalSetup;
