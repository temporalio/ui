import { FullConfig, chromium } from '@playwright/test';

import { createCodecServer } from '../temporal/codec-server';
import { runWorker } from '../temporal/workers';
import { startWorkflows } from '../temporal/client';
import { connect } from '../temporal/client';
import { setLocalStorage } from './test-utilities/mock-local-storage';

const setupDependencies = async () => {
  const codecServer = await createCodecServer({ port: 8888 });

  await codecServer.start();

  const client = await connect();
  await runWorker();
  await startWorkflows(client);
};

async function globalSetup(config: FullConfig) {
  const { mode } = config.metadata;
  const { baseURL } = config.projects[0].use;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  if (mode === 'e2e') {
    await setupDependencies();
  }

  await page.goto(baseURL);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);

  await page
    .context()
    .storageState({ path: `./tests/${mode}/storageState.json` });
}

export default globalSetup;
