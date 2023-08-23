import { join } from 'path';

import waitForPort from 'wait-port';
import { $ } from 'zx';

export type UIServer = {
  shutdown: () => Promise<number | null>;
  ready: () => ReturnType<typeof waitForPort>;
};

let uiServer: UIServer;

export const getUIServer = (): UIServer => {
  return uiServer;
};

type Environemt = 'development' | 'e2e';

const portForEnv = (env: Environemt) => {
  if (env === 'development') return 8081;
  if (env === 'e2e') return 8080;
};

export const createUIServer = async (
  env: 'development' | 'e2e' = 'development',
) => {
  $.cwd = join(process.cwd(), 'server');

  await $`make build-server`;

  const uiServerProcess = $`./ui-server --env ${env} start`.quiet();
  console.log(`✨ ui-server running in ${env} mode on port ${portForEnv(env)}`);

  const shutdown = async () => {
    await uiServerProcess.kill();
    console.log('🔪 killed ui-server');
    return await uiServerProcess.exitCode;
  };

  const ready = async () => {
    return waitForPort({ port: portForEnv(env), output: 'silent' });
  };

  uiServer = {
    shutdown,
    ready,
  };

  return uiServer;
};
