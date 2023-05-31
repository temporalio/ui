import { FullConfig, chromium } from '@playwright/test';

import { runWorkers } from '$temporal-fixtures/workers';
import { startWorkflows } from '$temporal-fixtures/client';
import { setLocalStorage } from '$utilities/mock-local-storage';

async function globalSetup(config: FullConfig) {
  const { mode } = config.metadata;
  const { baseURL } = config.projects[0].use;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(baseURL);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);
  await page.context().storageState({ path: './tests/storageState.json' });

  if (mode && mode === 'e2e') {
    const wfs = await startWorkflows();
    await runWorkers(wfs.map((wf) => wf.result()));
  }
}

export default globalSetup;
