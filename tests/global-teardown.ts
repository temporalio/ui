import { FullConfig, chromium } from '@playwright/test';

import { stopWorkers } from '$temporal-fixtures/workers';

async function globalSetup(config: FullConfig) {
  await stopWorkers();
}

export default globalSetup;
